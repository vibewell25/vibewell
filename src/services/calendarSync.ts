import { google } from 'googleapis';
import { microsoft } from '@microsoft/microsoft-graph-client';
import { format } from 'date-fns';

interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    until?: Date;
    count?: number;
  };
  metadata?: Record<string, any>;
}

interface CalendarProvider {
  name: string;
  type: 'google' | 'microsoft' | 'apple';
  credentials: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  };
}

class CalendarSyncService {
  private static instance: CalendarSyncService;
  private providers: Map<string, CalendarProvider> = new Map();

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): CalendarSyncService {
    if (!CalendarSyncService.instance) {
      CalendarSyncService.instance = new CalendarSyncService();
    }
    return CalendarSyncService.instance;
  }

  // Provider Management
  public async addProvider(provider: CalendarProvider): Promise<void> {
    this.providers.set(provider.name, provider);
  }

  public async removeProvider(providerName: string): Promise<void> {
    this.providers.delete(providerName);
  }

  public getProvider(providerName: string): CalendarProvider | undefined {
    return this.providers.get(providerName);
  }

  // Google Calendar Integration
  private async getGoogleCalendarClient(provider: CalendarProvider) {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
      access_token: provider.credentials.accessToken,
      refresh_token: provider.credentials.refreshToken,
    });

    return google.calendar({ version: 'v3', auth });
  }

  // Microsoft Calendar Integration
  private async getMicrosoftGraphClient(provider: CalendarProvider) {
    return microsoft.Client.init({
      authProvider: (done) => {
        done(null, provider.credentials.accessToken);
      },
    });
  }

  // Event Management
  public async createEvent(providerName: string, event: CalendarEvent): Promise<string> {
    const provider = this.getProvider(providerName);
    if (!provider) throw new Error(`Provider ${providerName} not found`);

    switch (provider.type) {
      case 'google':
        return this.createGoogleEvent(provider, event);
      case 'microsoft':
        return this.createMicrosoftEvent(provider, event);
      default:
        throw new Error(`Unsupported provider type: ${provider.type}`);
    }
  }

  private async createGoogleEvent(provider: CalendarProvider, event: CalendarEvent): Promise<string> {
    const calendar = await this.getGoogleCalendarClient(provider);
    
    const googleEvent = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      location: event.location,
      attendees: event.attendees?.map(email => ({ email })),
      recurrence: event.recurrence ? [
        `RRULE:FREQ=${event.recurrence.frequency.toUpperCase()}` +
        (event.recurrence.interval ? `;INTERVAL=${event.recurrence.interval}` : '') +
        (event.recurrence.until ? `;UNTIL=${format(event.recurrence.until, "yyyyMMdd'T'HHmmss'Z'")}` : '') +
        (event.recurrence.count ? `;COUNT=${event.recurrence.count}` : '')
      ] : undefined,
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: googleEvent,
    });

    return response.data.id || '';
  }

  private async createMicrosoftEvent(provider: CalendarProvider, event: CalendarEvent): Promise<string> {
    const client = await this.getMicrosoftGraphClient(provider);
    
    const microsoftEvent = {
      subject: event.title,
      body: {
        contentType: 'HTML',
        content: event.description,
      },
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      location: {
        displayName: event.location,
      },
      attendees: event.attendees?.map(email => ({
        emailAddress: {
          address: email,
        },
        type: 'required',
      })),
      recurrence: event.recurrence ? {
        pattern: {
          type: event.recurrence.frequency,
          interval: event.recurrence.interval || 1,
        },
        range: {
          type: event.recurrence.until ? 'endDate' : 'noEnd',
          endDate: event.recurrence.until?.toISOString(),
          numberOfOccurrences: event.recurrence.count,
        },
      } : undefined,
    };

    const response = await client
      .api('/me/events')
      .post(microsoftEvent);

    return response.id;
  }

  // Sync Management
  public async syncEvents(providerName: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const provider = this.getProvider(providerName);
    if (!provider) throw new Error(`Provider ${providerName} not found`);

    switch (provider.type) {
      case 'google':
        return this.syncGoogleEvents(provider, startDate, endDate);
      case 'microsoft':
        return this.syncMicrosoftEvents(provider, startDate, endDate);
      default:
        throw new Error(`Unsupported provider type: ${provider.type}`);
    }
  }

  private async syncGoogleEvents(provider: CalendarProvider, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const calendar = await this.getGoogleCalendarClient(provider);
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items?.map(item => ({
      id: item.id,
      title: item.summary || '',
      description: item.description,
      startTime: new Date(item.start?.dateTime || ''),
      endTime: new Date(item.end?.dateTime || ''),
      location: item.location,
      attendees: item.attendees?.map(a => a.email || '').filter(Boolean),
    })) || [];
  }

  private async syncMicrosoftEvents(provider: CalendarProvider, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const client = await this.getMicrosoftGraphClient(provider);
    
    const response = await client
      .api('/me/calendarView')
      .query({
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
      })
      .get();

    return response.value.map((item: any) => ({
      id: item.id,
      title: item.subject,
      description: item.body?.content,
      startTime: new Date(item.start.dateTime),
      endTime: new Date(item.end.dateTime),
      location: item.location?.displayName,
      attendees: item.attendees?.map((a: any) => a.emailAddress.address),
    }));
  }
}

export const calendarSyncService = CalendarSyncService.getInstance(); 