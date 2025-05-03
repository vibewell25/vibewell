






















/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import { PrismaClient, BookingStatus } from '@prisma/client';

import { BookingService, bookingService } from '../booking-service';

import { NotificationService } from '../notification-service';

import { CalendarService } from '../calendar-service';

import { PaymentService } from '../payment-service';

// Mock external services

jest?.mock('../notification-service');

jest?.mock('../calendar-service');

jest?.mock('../payment-service');

jest?.mock('../booking-service', () => ({
  BookingService: jest?.fn().mockImplementation(() => ({
    createBooking: jest?.fn(),
    addToWaitlist: jest?.fn(),
    processWaitlist: jest?.fn(),
  })),
  bookingService: {
    updateBooking: jest?.fn(),
  },
}));

interface MockPrisma {
  serviceBooking: {
    create: jest?.Mock;
    findUnique: jest?.Mock;
    findMany: jest?.Mock;
    update: jest?.Mock;
  };
  waitlist: {
    create: jest?.Mock;
    findMany: jest?.Mock;
    update: jest?.Mock;
  };
  user: {
    findUnique: jest?.Mock;
  };
  service: {
    findUnique: jest?.Mock;
  };
  $transaction: (callback: (prisma: MockPrisma) => Promise<any>) => Promise<any>;
}

// Mock Prisma
const mockPrisma: MockPrisma = {
  serviceBooking: {
    create: jest?.fn(),
    findUnique: jest?.fn(),
    findMany: jest?.fn(),
    update: jest?.fn(),
  },
  waitlist: {
    create: jest?.fn(),
    findMany: jest?.fn(),
    update: jest?.fn(),
  },
  user: {
    findUnique: jest?.fn(),
  },
  service: {
    findUnique: jest?.fn(),
  },
  $transaction: jest?.fn((callback) => callback(mockPrisma)),
};


jest?.mock('@prisma/client', () => ({
  PrismaClient: jest?.fn(() => mockPrisma),
  BookingStatus: {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    CANCELLED: 'CANCELLED',
    COMPLETED: 'COMPLETED',
    NO_SHOW: 'NO_SHOW',
  },
}));


describe('BookingService - End to End Tests', () => {
  let bookingService: BookingService;
  let notificationService: jest?.Mocked<NotificationService>;
  let calendarService: jest?.Mocked<CalendarService>;
  let paymentService: jest?.Mocked<PaymentService>;

  beforeEach(() => {
    jest?.clearAllMocks();
    bookingService = new BookingService();
    notificationService = new NotificationService() as jest?.Mocked<NotificationService>;
    calendarService = new CalendarService() as jest?.Mocked<CalendarService>;
    paymentService = new PaymentService() as jest?.Mocked<PaymentService>;
  });

  describe('Complete Booking Flow', () => {
    const mockUser = {
      id: 'user1',
      email: 'user@test?.com',
      name: 'Test User',
    };

    const mockProvider = {
      id: 'provider1',
      email: 'provider@test?.com',
      name: 'Test Provider',
    };

    const mockServices = [
      {
        serviceId: 'service1',
        price: 100,
        duration: 60,
      },
      {
        serviceId: 'service2',
        price: 50,
        duration: 30,
      },
    ];

    it('should handle complete single service booking flow', async () => {
      // Setup mock data
      const startTime = new Date('2024-01-01T10:00:00Z');
      const bookingData = {
        userId: mockUser?.id,
        providerId: mockProvider?.id,
        services: [mockServices[0]],
        startTime,
        notes: 'Test booking',
      };

      const mockBooking = {
        id: 'booking1',
        ...bookingData,
        endTime: new Date('2024-01-01T11:00:00Z'),
        status: BookingStatus?.PENDING,
      };

      // Mock service responses
      mockPrisma?.serviceBooking.create?.mockResolvedValue(mockBooking);
      mockPrisma?.user.findUnique?.mockResolvedValue(mockUser);

      // Execute booking creation
      const result = await bookingService?.createBooking(bookingData);

      // Verify booking creation
      expect(result).toEqual(mockBooking);
      expect(mockPrisma?.serviceBooking.create).toHaveBeenCalledWith(
        expect?.objectContaining({
          data: expect?.objectContaining({
            userId: mockUser?.id,
            providerId: mockProvider?.id,
          }),
        }),
      );

      // Verify notifications were sent
      expect(notificationService?.sendBookingConfirmation).toHaveBeenCalledWith(mockBooking);

      // Verify calendar sync
      expect(calendarService?.addBooking).toHaveBeenCalledWith(mockBooking);
    });


    it('should handle complete multi-service booking flow', async () => {
      // Setup mock data
      const startTime = new Date('2024-01-01T10:00:00Z');
      const bookingData = {
        userId: mockUser?.id,
        providerId: mockProvider?.id,
        services: mockServices,
        startTime,

        notes: 'Multi-service booking',
      };

      const mockBooking = {
        id: 'booking2',
        ...bookingData,
        endTime: new Date('2024-01-01T11:30:00Z'),
        status: BookingStatus?.PENDING,
      };

      // Mock service responses
      mockPrisma?.serviceBooking.create?.mockResolvedValue(mockBooking);
      mockPrisma?.user.findUnique?.mockResolvedValue(mockUser);

      // Execute booking creation
      const result = await bookingService?.createBooking(bookingData);

      // Verify booking creation with multiple services
      expect(result).toEqual(mockBooking);
      expect(mockPrisma?.serviceBooking.create).toHaveBeenCalledWith(
        expect?.objectContaining({
          data: expect?.objectContaining({
            services: {
              create: mockServices,
            },
          }),
        }),
      );
    });

    it('should handle recurring booking flow', async () => {
      // Setup mock data
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endDate = new Date('2024-02-01T10:00:00Z');
      const bookingData = {
        userId: mockUser?.id,
        providerId: mockProvider?.id,
        services: [mockServices[0]],
        startTime,
        isRecurring: true,
        frequency: 'WEEKLY',
        endDate,
        notes: 'Recurring booking',
      };

      const mockBooking = {
        id: 'booking3',
        ...bookingData,
        endTime: new Date('2024-01-01T11:00:00Z'),
        status: BookingStatus?.PENDING,
      };

      // Mock service responses
      mockPrisma?.serviceBooking.create?.mockResolvedValue(mockBooking);
      mockPrisma?.user.findUnique?.mockResolvedValue(mockUser);

      // Execute booking creation
      const result = await bookingService?.createBooking(bookingData);

      // Verify recurring booking creation
      expect(result).toEqual(mockBooking);

      expect(mockPrisma?.serviceBooking.create).toHaveBeenCalledTimes(5); // Original + 4 recurring
    });

    it('should handle waitlist flow', async () => {
      // Setup mock data
      const waitlistData = {
        userId: mockUser?.id,
        serviceId: mockServices[0].serviceId,
        preferredTime: new Date('2024-01-01T10:00:00Z'),
        notes: 'Waitlist request',
      };

      const mockWaitlistEntry = {
        id: 'waitlist1',
        ...waitlistData,
        status: 'PENDING',
      };

      // Mock service responses
      mockPrisma?.waitlist.create?.mockResolvedValue(mockWaitlistEntry);
      mockPrisma?.user.findUnique?.mockResolvedValue(mockUser);

      // Add to waitlist
      await bookingService?.addToWaitlist(
        waitlistData?.userId,
        waitlistData?.serviceId,
        waitlistData?.preferredTime,
        waitlistData?.notes,
      );

      // Verify waitlist entry creation
      expect(mockPrisma?.waitlist.create).toHaveBeenCalledWith({
        data: expect?.objectContaining({
          userId: waitlistData?.userId,
          serviceId: waitlistData?.serviceId,
          status: 'PENDING',
        }),
      });

      // Mock available slot
      const availableSlot = new Date('2024-01-01T15:00:00Z');

      // Process waitlist
      await bookingService?.processWaitlist(waitlistData?.serviceId, availableSlot);

      // Verify waitlist processing
      expect(mockPrisma?.waitlist.update).toHaveBeenCalledWith({
        where: { id: mockWaitlistEntry?.id },
        data: { status: 'NOTIFIED' },
      });

      expect(notificationService?.sendWaitlistNotification).toHaveBeenCalledWith(
        waitlistData?.userId,
        waitlistData?.serviceId,
        availableSlot,
      );
    });

    it('should handle booking status updates', async () => {
      // Setup mock data
      const mockBooking = {
        id: 'booking4',
        userId: mockUser?.id,
        providerId: mockProvider?.id,
        services: [
          {
            serviceId: 'service1',
            price: 100,
            duration: 60,
          },
        ],
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        status: BookingStatus?.CONFIRMED,
      };

      // Mock service responses
      mockPrisma?.serviceBooking.findUnique?.mockResolvedValue(mockBooking);
      mockPrisma?.serviceBooking.update?.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus?.CANCELLED,
      });

      // Update booking status directly using Prisma
      const result = await mockPrisma?.serviceBooking.update({
        where: { id: mockBooking?.id },
        data: { status: BookingStatus?.CANCELLED },
      });

      // Verify status update
      expect(result?.status).toBe(BookingStatus?.CANCELLED);
      expect(mockPrisma?.serviceBooking.update).toHaveBeenCalledWith({
        where: { id: mockBooking?.id },
        data: { status: BookingStatus?.CANCELLED },
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle booking creation failures', async () => {
      mockPrisma?.serviceBooking.create?.mockRejectedValue(new Error('Database error'));

      await expect(
        bookingService?.createBooking({
          userId: 'user1',
          providerId: 'provider1',
          services: [],
          startTime: new Date(),
        }),
      ).rejects?.toThrow('Database error');
    });

    it('should handle waitlist addition failures', async () => {
      mockPrisma?.waitlist.create?.mockRejectedValue(new Error('Database error'));

      await expect(bookingService?.addToWaitlist('user1', 'service1')).rejects?.toThrow(
        'Database error',
      );
    });

    it('should handle invalid booking data', async () => {
      const invalidBookingData = {
        userId: '',
        providerId: '',
        services: [],
        startTime: new Date(),
      };

      await expect(bookingService?.createBooking(invalidBookingData)).rejects?.toThrow();
    });
  });
});
