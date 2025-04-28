const express = require('express');
const fetch = require('node-fetch');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const CLIENT_ID = process.env.OUTLOOK_CLIENT_ID;
const CLIENT_SECRET = process.env.OUTLOOK_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.BACKEND_URL}/api/calendar/outlook/auth/callback`;
const SCOPES = ['offline_access', 'https://graph.microsoft.com/Calendars.ReadWrite'];

// Send Outlook OAuth consent URL
router.get('/auth/url', passport.authenticate('jwt', { session: false }), (req, res) => {
  const url = `${AUTH_URL}?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_mode=query&scope=${encodeURIComponent(SCOPES.join(' '))}&prompt=consent`;
  res.json({ url });
});

// Handle Outlook OAuth callback
router.get('/auth/callback', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const code = req.query.code;
  try {
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('scope', SCOPES.join(' '));

    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const tokenData = await tokenRes.json();

    await prisma.outlookCalendarToken.upsert({
      where: { userId: req.user.id },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        scope: tokenData.scope,
        tokenType: tokenData.token_type,
        expiryDate: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
        updatedAt: new Date(),
      },
      create: {
        userId: req.user.id,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        scope: tokenData.scope,
        tokenType: tokenData.token_type,
        expiryDate: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
      },
    });

    res.redirect(`${process.env.FRONTEND_URL}/calendar/success`);
  } catch (error) {
    console.error('Outlook OAuth callback error:', error);
    res.status(500).json({ error: 'Failed to exchange code' });
  }
});

// List Outlook Calendar events
router.get('/events', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const tokenRecord = await prisma.outlookCalendarToken.findUnique({ where: { userId: req.user.id } });
    if (!tokenRecord) return res.status(404).json({ error: 'Not authorized' });

    const now = new Date().toISOString();
    const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const eventsRes = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${now}&endDateTime=${weekLater}`,
      { headers: { Authorization: `Bearer ${tokenRecord.accessToken}` } }
    );
    const eventsData = await eventsRes.json();
    res.json(eventsData.value || []);
  } catch (error) {
    console.error('Outlook events list error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

module.exports = router;
