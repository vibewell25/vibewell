import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type {
  Booking,
  BeautyService,
  Business,
  User,
  CalendarConnection,
  CalendarEvent,
} from '@prisma/client';

interface BookingWithRelations extends Booking {
  service: BeautyService;
  business: Business;
  user: User;
}

interface CalendarConnectionWithUser extends CalendarConnection {
  user: User;
}

interface CalendarEventWithRelations extends CalendarEvent {
  booking: BookingWithRelations;
  user: User;
  connection: CalendarConnectionWithUser;
}

type CalendarEventCreateInput = {
  userId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
};

type CalendarEventUpdateInput = {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
  attendees?: string[];
};

export class CalendarService {
  private async getOAuth2Client() {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
    return oauth2Client;
  }

  private async getOutlookClient(accessToken: string): Promise<Client> {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  async connectGoogleCalendar(userId: string, code: string): Promise<CalendarConnectionWithUser> {
    try {
      const oauth2Client = await this.getOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code);

      const calendarConnection = await prisma.calendarConnection.create({
        data: {
          userId,
          provider: 'google',
          accessToken: tokens.access_token ?? '',
          refreshToken: tokens.refresh_token ?? '',
          expiryDate: new Date(tokens.expiry_date ?? Date.now()),
        },
      });

      return calendarConnection;
    } catch (error) {
      logger.error('Error connecting Google Calendar:', error);
      throw new Error('Failed to connect Google Calendar');
    }
  }

  async connectOutlookCalendar(userId: string, accessToken: string): Promise<void> {
    try {
      await prisma.calendarConnection.create({
        data: {
          userId,
          provider: 'outlook',
          accessToken,
          expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour from now
        },
      });
    } catch (error) {
      logger.error('Error connecting Outlook calendar:', error);
      throw new Error('Failed to connect Outlook calendar');
    }
  }

  async syncBooking(bookingId: string): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: {
            include: {
              calendarConnections: true,
            },
          },
          service: true,
          business: true,
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      const connections = booking.user.calendarConnections;

      for (const connection of connections) {
        switch (connection.provider) {
          case 'google':
            await this.syncWithGoogleCalendar(booking, connection);
            break;
          case 'outlook':
            await this.syncWithOutlookCalendar(booking, connection);
            break;
          case 'apple':
            await this.syncWithAppleCalendar(booking, connection);
            break;
          default:
            logger.warn(`Unsupported calendar provider: ${connection.provider}`);
        }
      }
    } catch (error) {
      logger.error('Error syncing booking with calendar:', error);
      throw new Error('Failed to sync booking with calendar');
    }
  }

  private async syncWithGoogleCalendar(
    booking: BookingWithRelations,
    connection: CalendarConnectionWithUser,
  ): Promise<void> {
    try {
      const oauth2Client = await this.getOAuth2Client();
      oauth2Client.setCredentials({
        access_token: connection.accessToken,
        refresh_token: connection.refreshToken,
        expiry_date: connection.expiryDate.getTime(),
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const event = {
        summary: `${booking.service.name} at ${booking.business.name}`,
        description: booking.service.description,
        start: {
          dateTime: booking.startTime.toISOString(),
        },
        end: {
          dateTime: booking.endTime.toISOString(),
        },
        location: booking.business.address,
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      await prisma.calendarEvent.create({
        data: {
          bookingId: booking.id,
          userId: connection.userId,
          provider: 'google',
          externalEventId: response.data.id ?? '',
        },
      });
    } catch (error) {
      logger.error('Error syncing with Google Calendar:', error);
      throw new Error('Failed to sync with Google Calendar');
    }
  }

  private async syncWithOutlookCalendar(
    booking: BookingWithRelations,
    connection: CalendarConnectionWithUser,
  ): Promise<void> {
    try {
      const client = await this.getOutlookClient(connection.accessToken);

      const event = {
        subject: `${booking.service.name} at ${booking.business.name}`,
        body: {
          contentType: 'HTML',
          content: booking.service.description || '',
        },
        start: {
          dateTime: booking.startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: booking.endTime.toISOString(),
          timeZone: 'UTC',
        },
        location: {
          displayName: booking.business.address || '',
        },
      };

      const response = await client.api('/me/events').post(event);

      await prisma.calendarEvent.create({
        data: {
          bookingId: booking.id,
          userId: connection.userId,
          provider: 'outlook',
          externalEventId: response.id,
        },
      });
    } catch (error) {
      logger.error('Error syncing with Outlook Calendar:', error);
      throw new Error('Failed to sync with Outlook Calendar');
    }
  }

  private async syncWithAppleCalendar(
    booking: BookingWithRelations,
    connection: CalendarConnectionWithUser,
  ): Promise<void> {
    if (Platform.OS !== 'ios') {
      logger.warn('Apple Calendar sync is only available on iOS devices');
      return;
    }

    try {
      const { AppleCalendarModule } = NativeModules;

      // Request calendar access if not already granted
      const hasAccess = await AppleCalendarModule.requestAccess();
      if (!hasAccess) {
        throw new Error('Calendar access not granted');
      }

      const response = await AppleCalendarModule.addEvent(
        `${booking.service.name} at ${booking.business.name}`,
        booking.startTime,
        booking.endTime,
        booking.service.description,
        booking.business.address,
      );

      await prisma.calendarEvent.create({
        data: {
          bookingId: booking.id,
          userId: connection.userId,
          provider: 'apple',
          externalEventId: response.eventId,
        },
      });
    } catch (error) {
      logger.error('Error syncing with Apple Calendar:', error);
      throw new Error('Failed to sync with Apple Calendar');
    }
  }

  /**
   * Update synced calendar event
   */
  async updateCalendarEvent(bookingId: string) {
    try {
      const calendarEvents = await prisma.calendarEvent.findMany({
        where: { bookingId },
        include: {
          booking: true,
        },
      });

      for (const event of calendarEvents) {
        switch (event.provider) {
          case 'google':
            await this.updateGoogleCalendarEvent(event);
            break;
          case 'outlook':
            await this.updateOutlookCalendarEvent(event);
            break;
          case 'apple':
            await this.updateAppleCalendarEvent(event);
            break;
        }
      }
    } catch (error) {
      logger.error('Error updating calendar event', error);
      throw error;
    }
  }

  /**
   * Delete synced calendar event
   */
  async deleteCalendarEvent(bookingId: string) {
    try {
      const calendarEvents = await prisma.calendarEvent.findMany({
        where: { bookingId },
      });

      for (const event of calendarEvents) {
        switch (event.provider) {
          case 'google':
            await this.deleteGoogleCalendarEvent(event);
            break;
          case 'outlook':
            await this.deleteOutlookCalendarEvent(event);
            break;
          case 'apple':
            await this.deleteAppleCalendarEvent(event);
            break;
        }
      }

      // Delete calendar event records
      await prisma.calendarEvent.deleteMany({
        where: { bookingId },
      });
    } catch (error) {
      logger.error('Error deleting calendar event', error);
      throw error;
    }
  }

  private async updateGoogleCalendarEvent(event: CalendarEventWithRelations): Promise<void> {
    try {
      const connection = event.connection;
      const booking = event.booking;

      const oauth2Client = await this.getOAuth2Client();
      oauth2Client.setCredentials({
        access_token: connection.accessToken,
        refresh_token: connection.refreshToken,
        expiry_date: connection.expiryDate.getTime(),
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const updatedEvent = {
        summary: `${booking.service.name} at ${booking.business.name}`,
        description: booking.service.description,
        start: {
          dateTime: booking.startTime.toISOString(),
        },
        end: {
          dateTime: booking.endTime.toISOString(),
        },
        location: booking.business.address,
      };

      await calendar.events.update({
        calendarId: 'primary',
        eventId: event.externalEventId,
        requestBody: updatedEvent,
      });
    } catch (error) {
      logger.error('Error updating Google Calendar event:', error);
      throw new Error('Failed to update Google Calendar event');
    }
  }

  private async updateOutlookCalendarEvent(event: CalendarEventWithRelations): Promise<void> {
    try {
      const connection = event.connection;
      const booking = event.booking;
      const client = await this.getOutlookClient(connection.accessToken);

      const updatedEvent = {
        subject: `${booking.service.name} at ${booking.business.name}`,
        body: {
          contentType: 'HTML',
          content: booking.service.description || '',
        },
        start: {
          dateTime: booking.startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: booking.endTime.toISOString(),
          timeZone: 'UTC',
        },
        location: {
          displayName: booking.business.address || '',
        },
      };

      await client.api(`/me/events/${event.externalEventId}`).update(updatedEvent);
    } catch (error) {
      logger.error('Error updating Outlook Calendar event:', error);
      throw new Error('Failed to update Outlook Calendar event');
    }
  }

  private async updateAppleCalendarEvent(event: CalendarEventWithRelations): Promise<void> {
    if (Platform.OS !== 'ios') {
      logger.warn('Apple Calendar update is only available on iOS devices');
      return;
    }

    try {
      const { AppleCalendarModule } = NativeModules;
      const booking = event.booking;

      await AppleCalendarModule.updateEvent(
        event.externalEventId,
        `${booking.service.name} at ${booking.business.name}`,
        booking.startTime,
        booking.endTime,
        booking.service.description,
        booking.business.address,
      );
    } catch (error) {
      logger.error('Error updating Apple Calendar event:', error);
      throw new Error('Failed to update Apple Calendar event');
    }
  }

  private async deleteGoogleCalendarEvent(event: CalendarEventWithRelations): Promise<void> {
    try {
      const connection = event.connection;
      const oauth2Client = await this.getOAuth2Client();
      oauth2Client.setCredentials({
        access_token: connection.accessToken,
        refresh_token: connection.refreshToken,
        expiry_date: connection.expiryDate.getTime(),
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: event.externalEventId,
      });
    } catch (error) {
      logger.error('Error deleting Google Calendar event:', error);
      throw new Error('Failed to delete Google Calendar event');
    }
  }

  private async deleteOutlookCalendarEvent(event: CalendarEventWithRelations): Promise<void> {
    try {
      const connection = event.connection;
      const client = await this.getOutlookClient(connection.accessToken);

      await client.api(`/me/events/${event.externalEventId}`).delete();
    } catch (error) {
      logger.error('Error deleting Outlook Calendar event:', error);
      throw new Error('Failed to delete Outlook Calendar event');
    }
  }

  private async deleteAppleCalendarEvent(event: CalendarEventWithRelations): Promise<void> {
    if (Platform.OS !== 'ios') {
      logger.warn('Apple Calendar deletion is only available on iOS devices');
      return;
    }

    try {
      const { AppleCalendarModule } = NativeModules;
      await AppleCalendarModule.deleteEvent(event.externalEventId);
    } catch (error) {
      logger.error('Error deleting Apple Calendar event:', error);
      throw new Error('Failed to delete Apple Calendar event');
    }
  }
}

export default CalendarService;
