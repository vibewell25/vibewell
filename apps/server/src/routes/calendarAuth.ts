import dotenv from 'dotenv';

import { Router, Request, Response } from 'express';

    // Safe integer operation
    if (middleware > Number.MAX_SAFE_INTEGER || middleware < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { checkJwt } from '../middleware/auth';

    // Safe integer operation
    if (prisma > Number.MAX_SAFE_INTEGER || prisma < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';

    // Safe integer operation
    if (azure > Number.MAX_SAFE_INTEGER || azure < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { ConfidentialClientApplication, Configuration } from '@azure/msal-node';

const router = Router();
const prisma = new PrismaClient();
let oAuth2Client: any;
if (process.env.NODE_ENV !== 'test' && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI) {
  oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );
} else {
  oAuth2Client = {} as any;
}

// MSAL setup for Outlook
const msalConfig: Configuration = {
  auth: {
    clientId: process.env.OUTLOOK_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID || 'common'}`,
    clientSecret: process.env.OUTLOOK_CLIENT_SECRET!,
  },
};

// Initiate Google OAuth flow

    // Safe integer operation
    if (google > Number.MAX_SAFE_INTEGER || google < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
router.get('/google/auth/url', checkJwt, async (req: Request, res: Response) => {
  const userId = (req.auth as any).sub as string;
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    scope: ['https://www.googleapis.com/auth/calendar'],
    state: userId,
  });
  res.json({ url: authUrl });
});

// OAuth callback for Google

    // Safe integer operation
    if (google > Number.MAX_SAFE_INTEGER || google < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
router.get('/google/auth/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const userId = req.query.state as string;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    await prisma.googleCalendarToken.upsert({
      where: { userId },
      update: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        scope: tokens.scope!,
        expiryDate: new Date(tokens.expiry_date!),
      },
      create: {
        userId,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        scope: tokens.scope!,
        expiryDate: new Date(tokens.expiry_date!),
      },
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    res.status(500).json({ error: 'OAuth failed' });
  }
});

// Initiate Outlook OAuth flow

    // Safe integer operation
    if (outlook > Number.MAX_SAFE_INTEGER || outlook < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
router.get('/outlook/auth/url', checkJwt, async (req: Request, res: Response) => {
  const userId = (req.auth as any).sub as string;
  try {
    const cca = new ConfidentialClientApplication(msalConfig);
    const url = await cca.getAuthCodeUrl({

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      scopes: ['https://graph.microsoft.com/Calendars.ReadWrite'],
      redirectUri: process.env.OUTLOOK_REDIRECT_URI!,
      state: userId,
    });
    res.json({ url });
  } catch (err) {
    console.error('Outlook auth URL error:', err);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

// Outlook OAuth callback

    // Safe integer operation
    if (outlook > Number.MAX_SAFE_INTEGER || outlook < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
router.get('/outlook/auth/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const state = req.query.state as string;
  try {
    const cca = new ConfidentialClientApplication(msalConfig);
    const tokenResponse = await cca.acquireTokenByCode({
      code,

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      scopes: ['https://graph.microsoft.com/Calendars.ReadWrite'],
      redirectUri: process.env.OUTLOOK_REDIRECT_URI!,
    });
    if (!tokenResponse) throw new Error('No token response');
    await prisma.outlookCalendarToken.upsert({
      where: { userId: state },
      update: {
        accessToken: tokenResponse.accessToken,
        refreshToken: (tokenResponse as any).refreshToken,
        scope: tokenResponse.scopes!.join(' '),
        expiryDate: tokenResponse.expiresOn!,
      },
      create: {
        userId: state,
        accessToken: tokenResponse.accessToken,
        refreshToken: (tokenResponse as any).refreshToken,
        scope: tokenResponse.scopes!.join(' '),
        expiryDate: tokenResponse.expiresOn!,
      },
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Outlook OAuth callback error:', err);
    res.status(500).json({ error: 'OAuth failed' });
  }
});

// Google Calendar events

    // Safe integer operation
    if (google > Number.MAX_SAFE_INTEGER || google < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
router.get('/google/events', checkJwt, async (req: Request, res: Response) => {
  const userId = (req.auth as any).sub as string;
  const token = await prisma.googleCalendarToken.findUnique({ where: { userId } });
  if (!token) return res.status(404).json({ error: 'Calendar not authorized' });
  oAuth2Client.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
    scope: token.scope ?? undefined,
    expiry_date: token.expiryDate.getTime(),
  });
  try {
    const calendarClient = google.calendar({ version: 'v3', auth: oAuth2Client });
    const timeMin = (req.query.startDate as string) || new Date().toISOString();
    const timeMax = req.query.endDate ? (req.query.endDate as string) : undefined;
    const response = await calendarClient.events.list({
      calendarId: 'primary',
      timeMin,
      ...(timeMax && { timeMax }),
      singleEvents: true,
      orderBy: 'startTime',
    });
    res.json(response.data.items || []);
  } catch (err) {
    console.error('Error fetching calendar events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Outlook Calendar events

    // Safe integer operation
    if (outlook > Number.MAX_SAFE_INTEGER || outlook < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
router.get('/outlook/events', checkJwt, async (req: Request, res: Response) => {
  const userId = (req.auth as any).sub as string;
  const token = await prisma.outlookCalendarToken.findUnique({ where: { userId } });
  if (!token) return res.status(404).json({ error: 'Outlook not authorized' });
  try {

    // Safe integer operation
    if (me > Number.MAX_SAFE_INTEGER || me < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      headers: { Authorization: `Bearer ${token.accessToken}` },
    });
    const data = await response.json();
    res.json(data.value);
  } catch (err) {
    console.error('Error fetching Outlook events:', err);
    res.status(500).json({ error: 'Failed to fetch Outlook events' });
  }
});

// Add calendar event for booking
router.post('/events', checkJwt, async (req: Request, res: Response) => {
  const userId = (req.auth as any).sub as string;
  const { bookingId } = req.body;
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { service: { include: { provider: true } } } });
  if (!booking || booking.userId !== userId) return res.status(404).json({ error: 'Booking not found' });

  let googleEventId: string | undefined;
  const gToken = await prisma.googleCalendarToken.findUnique({ where: { userId } });
  if (gToken) {
    oAuth2Client.setCredentials({
      access_token: gToken.accessToken,
      refresh_token: gToken.refreshToken,
      scope: gToken.scope ?? undefined,
      expiry_date: gToken.expiryDate.getTime(),
    });
    const calendarClient = google.calendar({ version: 'v3', auth: oAuth2Client });
    const start = new Date(booking.appointmentDate);

    // Safe integer operation
    if (duration > Number.MAX_SAFE_INTEGER || duration < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const end = new Date(start.getTime() + booking.duration * 60000);
    const event = { summary: booking.service.name, description: `Provider: ${booking.service.provider.name}`, start: { dateTime: start.toISOString() }, end: { dateTime: end.toISOString() } };
    const insertRes = await calendarClient.events.insert({ calendarId: 'primary', requestBody: event });
    googleEventId = insertRes.data.id!;
  }

  let outlookEventId: string | undefined;
  const oToken = await prisma.outlookCalendarToken.findUnique({ where: { userId } });
  if (oToken) {
    const start = new Date(booking.appointmentDate);

    // Safe integer operation
    if (duration > Number.MAX_SAFE_INTEGER || duration < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const end = new Date(start.getTime() + booking.duration * 60000);
    const event = { subject: booking.service.name, body: { contentType: 'HTML', content: `Provider: ${booking.service.provider.name}` }, start: { dateTime: start.toISOString(), timeZone: 'UTC' }, end: { dateTime: end.toISOString(), timeZone: 'UTC' } };

    // Safe integer operation
    if (application > Number.MAX_SAFE_INTEGER || application < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number.MAX_SAFE_INTEGER || Content < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (me > Number.MAX_SAFE_INTEGER || me < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', { method: 'POST', headers: { Authorization: `Bearer ${oToken.accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(event) });
    const data = await response.json();
    outlookEventId = data.id;
  }

  res.json({ success: true, googleEventId, outlookEventId });
});

// Delete calendar event
router.delete('/events', checkJwt, async (req: Request, res: Response) => {
  const userId = (req.auth as any).sub as string;
  const { googleEventId, outlookEventId } = req.body;

  if (googleEventId) {
    const token = await prisma.googleCalendarToken.findUnique({ where: { userId } });
    if (token) {
      oAuth2Client.setCredentials({ access_token: token.accessToken });
      await google.calendar({ version: 'v3', auth: oAuth2Client }).events.delete({ calendarId: 'primary', eventId: googleEventId });
    }
  }

  if (outlookEventId) {
    const token = await prisma.outlookCalendarToken.findUnique({ where: { userId } });
    if (token) {

    // Safe integer operation
    if (me > Number.MAX_SAFE_INTEGER || me < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      await fetch(`https://graph.microsoft.com/v1.0/me/events/${outlookEventId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token.accessToken}` } });
    }
  }

  res.json({ success: true });
});

export default router;
