import { CalendarService } from '../calendar-service';
import { prisma } from '@/lib/database/client';
import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';

// Mock dependencies
jest.mock('@/lib/database/client', () => ({
  prisma: {
    calendarConnection: {
      create: jest.fn(),
    },
    booking: {
      findUnique: jest.fn(),
    },
    calendarEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        getToken: jest.fn().mockResolvedValue({
          tokens: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expiry_date: Date.now(),
          },
        }),
        setCredentials: jest.fn(),
      })),
    },
    calendar: jest.fn().mockReturnValue({
      events: {
        insert: jest.fn().mockResolvedValue({ data: { id: 'mock-event-id' } }),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
      },
    }),
  },
}));

jest.mock('@microsoft/microsoft-graph-client', () => ({
  Client: {
    init: jest.fn().mockReturnValue({
      api: jest.fn().mockReturnValue({
        post: jest.fn().mockResolvedValue({ id: 'mock-outlook-event-id' }),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
      }),
    }),
  },
}));

describe('CalendarService', () => {
  let calendarService: CalendarService;
  const mockBooking = {
    id: 'booking-id',
    service: {
      name: 'Test Service',
      description: 'Test Description',
    },
    business: {
      name: 'Test Business',
      address: '123 Test St',
    },
    startTime: new Date(),
    endTime: new Date(),
    user: {
      calendarConnections: [
        {
          provider: 'google',
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiryDate: new Date(),
          userId: 'user-id',
        },
      ],
    },
  };

  beforeEach(() => {
    calendarService = new CalendarService();
    jest.clearAllMocks();
  });

  describe('Google Calendar Integration', () => {
    it('should connect to Google Calendar', async () => {
      const userId = 'test-user-id';
      const code = 'test-code';

      await calendarService.connectGoogleCalendar(userId, code);

      expect(prisma.calendarConnection.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          provider: 'google',
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        }),
      });
    });

    it('should sync booking with Google Calendar', async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);

      await calendarService.syncBooking('booking-id');

      expect(prisma.calendarEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          bookingId: 'booking-id',
          provider: 'google',
          externalEventId: 'mock-event-id',
        }),
      });
    });
  });

  describe('Outlook Calendar Integration', () => {
    const mockOutlookBooking = {
      ...mockBooking,
      user: {
        calendarConnections: [
          {
            provider: 'outlook',
            accessToken: 'mock-outlook-token',
            refreshToken: 'mock-refresh-token',
            expiryDate: new Date(),
            userId: 'user-id',
          },
        ],
      },
    };

    it('should sync booking with Outlook Calendar', async () => {
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockOutlookBooking);

      await calendarService.syncBooking('booking-id');

      expect(prisma.calendarEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          bookingId: 'booking-id',
          provider: 'outlook',
          externalEventId: 'mock-outlook-event-id',
        }),
      });
    });
  });

  describe('Calendar Event Management', () => {
    const mockCalendarEvent = {
      id: 'event-id',
      bookingId: 'booking-id',
      provider: 'google',
      externalEventId: 'external-event-id',
      booking: mockBooking,
      connection: mockBooking.user.calendarConnections[0],
    };

    beforeEach(() => {
      (prisma.calendarEvent.findMany as jest.Mock).mockResolvedValue([mockCalendarEvent]);
    });

    it('should update calendar events', async () => {
      await calendarService.updateCalendarEvent('booking-id');
      expect(google.calendar().events.update).toHaveBeenCalled();
    });

    it('should delete calendar events', async () => {
      await calendarService.deleteCalendarEvent('booking-id');
      expect(google.calendar().events.delete).toHaveBeenCalled();
      expect(prisma.calendarEvent.deleteMany).toHaveBeenCalledWith({
        where: { bookingId: 'booking-id' },
      });
    });
  });
}); 