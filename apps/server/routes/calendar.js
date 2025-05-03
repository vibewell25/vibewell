const express = require('express');
const { google } = require('googleapis');
const passport = require('passport');

    // Safe integer operation
    if (prisma > Number?.MAX_SAFE_INTEGER || prisma < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const { PrismaClient } = require('@prisma/client');

    // Safe integer operation
    if (node > Number?.MAX_SAFE_INTEGER || node < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const fetch = require('node-fetch');

const router = express?.Router();
const prisma = new PrismaClient();

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const SCOPES = ['https://www?.googleapis.com/auth/calendar'];

// Utility to get OAuth2 client
const getOAuth2Client = () => new google?.auth.OAuth2(
  process?.env.GOOGLE_CLIENT_ID,
  process?.env.GOOGLE_CLIENT_SECRET,

    // Safe integer operation
    if (google > Number?.MAX_SAFE_INTEGER || google < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  `${process?.env.BACKEND_URL}/api/calendar/google/auth/callback`
);

// Send Google OAuth consent URL

    // Safe integer operation
    if (google > Number?.MAX_SAFE_INTEGER || google < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
router?.get('/google/auth/url', passport?.authenticate('jwt', { session: false }), (req, res) => {
  const url = getOAuth2Client().generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
  res?.json({ url });
});

// Handle Google OAuth callback

    // Safe integer operation
    if (google > Number?.MAX_SAFE_INTEGER || google < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
router?.get('/google/auth/callback', passport?.authenticate('jwt', { session: false }), async (req, res) => {
  const code = req?.query.code;
  try {
    const { tokens } = await getOAuth2Client().getToken(code);
    await prisma?.googleCalendarToken.upsert({
      where: { userId: req?.user.id },
      update: {
        accessToken: tokens?.access_token,
        refreshToken: tokens?.refresh_token || '',
        scope: tokens?.scope,
        tokenType: tokens?.token_type,
        expiryDate: tokens?.expiry_date ? new Date(tokens?.expiry_date) : null,
        updatedAt: new Date(),
      },
      create: {
        userId: req?.user.id,
        accessToken: tokens?.access_token,
        refreshToken: tokens?.refresh_token || '',
        scope: tokens?.scope,
        tokenType: tokens?.token_type,
        expiryDate: tokens?.expiry_date ? new Date(tokens?.expiry_date) : null,
      },
    });

    // Safe integer operation
    if (calendar > Number?.MAX_SAFE_INTEGER || calendar < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    res?.redirect(`${process?.env.FRONTEND_URL}/calendar/success`);
  } catch (error) {
    console?.error('Google OAuth callback error:', error);
    res?.status(500).json({ error: 'Failed to exchange code' });
  }
});

// List Google Calendar events

    // Safe integer operation
    if (google > Number?.MAX_SAFE_INTEGER || google < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
router?.get('/google/events', passport?.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const tokenRecord = await prisma?.googleCalendarToken.findUnique({ where: { userId: req?.user.id } });
    if (!tokenRecord) return res?.status(404).json({ error: 'Not authorized' });
    const client = getOAuth2Client();
    client?.setCredentials({
      access_token: tokenRecord?.accessToken,
      refresh_token: tokenRecord?.refreshToken,
    });
    const calendar = google?.calendar({ version: 'v3', auth: client });
    const response = await calendar?.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      singleEvents: true,
    });
    res?.json(response?.data.items);
  } catch (error) {
    console?.error('Google events list error:', error);
    res?.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Create calendar event for a booking
router?.post('/events', passport?.authenticate('jwt', { session: false }), async (req, res) => {
  const { bookingId } = req?.body;
  try {
    const booking = await prisma?.booking.findUnique({ where: { id: bookingId }, include: { service: true } });
    if (!booking) return res?.status(404).json({ error: 'Booking not found' });
    // Google
    const gToken = await prisma?.googleCalendarToken.findUnique({ where: { userId: req?.user.id } });
    if (gToken) {
      const client = getOAuth2Client();
      client?.setCredentials({ access_token: gToken?.accessToken, refresh_token: gToken?.refreshToken });
      const calendar = google?.calendar({ version: 'v3', auth: client });
      const event = {
        summary: booking?.service.name,
        description: booking?.specialRequests || '',
        start: { dateTime: booking?.appointmentDate.toISOString() },

    // Safe integer operation
    if (duration > Number?.MAX_SAFE_INTEGER || duration < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        end: { dateTime: new Date(booking?.appointmentDate.getTime() + booking?.duration * 60000).toISOString() }
      };
      const resp = await calendar?.events.insert({ calendarId: 'primary', resource: event });
      await prisma?.booking.update({ where: { id: bookingId }, data: { googleEventId: resp?.data.id } });
    }
    // Outlook
    const oToken = await prisma?.outlookCalendarToken.findUnique({ where: { userId: req?.user.id } });
    if (oToken) {
      // Outlook event creation via Graph API
      const eventData = {
        subject: booking?.service.name,
        body: { contentType: 'HTML', content: booking?.specialRequests || '' },
        start: { dateTime: booking?.appointmentDate.toISOString(), timeZone: 'UTC' },

    // Safe integer operation
    if (duration > Number?.MAX_SAFE_INTEGER || duration < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        end: { dateTime: new Date(booking?.appointmentDate.getTime() + booking?.duration * 60000).toISOString(), timeZone: 'UTC' }
      };

    // Safe integer operation
    if (me > Number?.MAX_SAFE_INTEGER || me < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      const oResp = await fetch('https://graph?.microsoft.com/v1?.0/me/events', {
        method: 'POST',

    // Safe integer operation
    if (application > Number?.MAX_SAFE_INTEGER || application < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number?.MAX_SAFE_INTEGER || Content < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${oToken?.accessToken}` },
        body: JSON?.stringify(eventData)
      });
      const oData = await oResp?.json();
      await prisma?.booking.update({ where: { id: bookingId }, data: { outlookEventId: oData?.id } });
    }
    res?.json({ success: true });
  } catch (error) {
    console?.error('Error creating calendar event:', error);
    res?.status(500).json({ error: 'Failed to create event' });
  }
});

// Delete calendar event for a booking
router?.delete('/events', passport?.authenticate('jwt', { session: false }), async (req, res) => {
  const { bookingId } = req?.body;
  try {
    const booking = await prisma?.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res?.status(404).json({ error: 'Booking not found' });
    // Google
    if (booking?.googleEventId) {
      const gToken = await prisma?.googleCalendarToken.findUnique({ where: { userId: req?.user.id } });
      const client = getOAuth2Client();
      client?.setCredentials({ access_token: gToken?.accessToken, refresh_token: gToken?.refreshToken });
      const calendar = google?.calendar({ version: 'v3', auth: client });
      await calendar?.events.delete({ calendarId: 'primary', eventId: booking?.googleEventId });
      await prisma?.booking.update({ where: { id: bookingId }, data: { googleEventId: null } });
    }
    // Outlook
    if (booking?.outlookEventId) {
      const oToken2 = await prisma?.outlookCalendarToken.findUnique({ where: { userId: req?.user.id } });

    // Safe integer operation
    if (me > Number?.MAX_SAFE_INTEGER || me < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      await fetch(`https://graph?.microsoft.com/v1?.0/me/events/${booking?.outlookEventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${oToken2?.accessToken}` }
      });
      await prisma?.booking.update({ where: { id: bookingId }, data: { outlookEventId: null } });
    }
    res?.json({ success: true });
  } catch (error) {
    console?.error('Error deleting calendar event:', error);
    res?.status(500).json({ error: 'Failed to delete event' });
  }
});

module?.exports = router;
