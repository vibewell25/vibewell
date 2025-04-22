import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import ical from 'ical-generator';
import { v4 as uuidv4 } from 'uuid';

interface CalendarConfig {
  google?: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  microsoft?: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  apple?: {
    teamId: string;
    keyId: string;
    privateKey: string;
  };
}

interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  attendees?: string[];
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    until?: Date;
    count?: number;
  };
  reminders?: {
    minutes: number;
    method: 'email' | 'popup';
  }[];
}

class CalendarService {
  private static instance: CalendarService;
  private config: CalendarConfig;
  private googleAuth: OAuth2Client | null = null;

  private constructor(config: CalendarConfig) {
    this.config = config;
    this.initializeGoogleAuth();
  }

  public static getInstance(config?: CalendarConfig): CalendarService {
    if (!CalendarService.instance && config) {
      CalendarService.instance = new CalendarService(config);
    }
    return CalendarService.instance;
  }

  private initializeGoogleAuth(): void {
    if (this.config.google) {
      this.googleAuth = new google.auth.OAuth2(
        this.config.google.clientId,
        this.config.google.clientSecret,
        this.config.google.redirectUri
      );
    }
  }

  // Google Calendar Integration
  public async createGoogleEvent(event: CalendarEvent, accessToken: string): Promise<any> {
    if (!this.googleAuth) {
      throw new Error('Google Calendar not configured');
    }

    this.googleAuth.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: 'v3', auth: this.googleAuth });

    const googleEvent = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      attendees: event.attendees?.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: event.reminders?.map(reminder => ({
          method: reminder.method,
          minutes: reminder.minutes
        }))
      }
    };

    if (event.recurrence) {
      googleEvent['recurrence'] = [
        `RRULE:FREQ=${event.recurrence.frequency.toUpperCase()}` +
        (event.recurrence.interval ? `;INTERVAL=${event.recurrence.interval}` : '') +
        (event.recurrence.until ? `;UNTIL=${event.recurrence.until.toISOString().replace(/[-:]/g, '').split('.')[0]}Z` : '') +
        (event.recurrence.count ? `;COUNT=${event.recurrence.count}` : '')
      ];
    }

    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: googleEvent
      });
      return response.data;
    } catch (error) {
      console.error('Google Calendar error:', error);
      throw error;
    }
  }

  // Microsoft Calendar Integration
  public async createMicrosoftEvent(event: CalendarEvent, accessToken: string): Promise<any> {
    if (!this.config.microsoft) {
      throw new Error('Microsoft Calendar not configured');
    }

    const microsoftEvent = {
      subject: event.title,
      body: {
        contentType: 'HTML',
        content: event.description
      },
      start: {
        dateTime: event.start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      location: {
        displayName: event.location
      },
      attendees: event.attendees?.map(email => ({
        emailAddress: { address: email },
        type: 'required'
      }))
    };

    try {
      const response = await axios.post(
        'https://graph.microsoft.com/v1.0/me/events',
        microsoftEvent,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Microsoft Calendar error:', error);
      throw error;
    }
  }

  // Apple Calendar Integration (iCloud)
  public async createAppleEvent(event: CalendarEvent): Promise<string> {
    if (!this.config.apple) {
      throw new Error('Apple Calendar not configured');
    }

    const calendar = ical({
      domain: 'vibewell.com',
      name: 'Vibewell Calendar'
    });

    const iCalEvent = calendar.createEvent({
      id: uuidv4(),
      start: event.start,
      end: event.end,
      summary: event.title,
      description: event.description,
      location: event.location,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    if (event.recurrence) {
      iCalEvent.repeating({
        freq: event.recurrence.frequency,
        interval: event.recurrence.interval,
        until: event.recurrence.until,
        count: event.recurrence.count
      });
    }

    return calendar.toString();
  }

  // Generic Calendar Operations
  public async createEvent(
    event: CalendarEvent,
    provider: 'google' | 'microsoft' | 'apple',
    accessToken?: string
  ): Promise<any> {
    switch (provider) {
      case 'google':
        if (!accessToken) throw new Error('Access token required for Google Calendar');
        return this.createGoogleEvent(event, accessToken);

      case 'microsoft':
        if (!accessToken) throw new Error('Access token required for Microsoft Calendar');
        return this.createMicrosoftEvent(event, accessToken);

      case 'apple':
        return this.createAppleEvent(event);

      default:
        throw new Error('Unsupported calendar provider');
    }
  }

  // Batch Operations
  public async batchCreateEvents(
    events: CalendarEvent[],
    provider: 'google' | 'microsoft' | 'apple',
    accessToken?: string
  ): Promise<any[]> {
    const results = [];
    for (const event of events) {
      try {
        const result = await this.createEvent(event, provider, accessToken);
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({ success: false, error });
      }
    }
    return results;
  }

  // Export Calendar
  public async exportCalendar(
    events: CalendarEvent[],
    format: 'ical' | 'json'
  ): Promise<string> {
    if (format === 'ical') {
      const calendar = ical({
        domain: 'vibewell.com',
        name: 'Vibewell Calendar'
      });

      events.forEach(event => {
        calendar.createEvent({
          start: event.start,
          end: event.end,
          summary: event.title,
          description: event.description,
          location: event.location
        });
      });

      return calendar.toString();
    } else {
      return JSON.stringify(events);
    }
  }
}

export default CalendarService; 