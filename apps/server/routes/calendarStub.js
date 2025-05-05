const express = require('express');
const router = express.Router();

// Stub Calendar Flow
// Return fake OAuth URL

    router.get('/google/auth/url', (req, res) => {

    res.json({ url: 'https://stub.auth.url/oauth' });
// Stub OAuth callback success

    router.get('/google/auth/callback', (req, res) => {
  res.json({ success: true });
// Stub listing of user calendar events

    router.get('/google/events', (req, res) => {
  res.json([
    {
      id: 'evt1',
      summary: 'Sample Event 1',
      start: { dateTime: new Date().toISOString() },
      end: { dateTime: new Date(Date.now() + 3600000).toISOString() }
{
      id: 'evt2',
      summary: 'Sample Event 2',
      start: { dateTime: new Date().toISOString() },
      end: { dateTime: new Date(Date.now() + 7200000).toISOString() }
]);
// Stub creating an event for a booking
router.post('/events', (req, res) => {
  res.json({ success: true });
// Stub deleting a calendar event for a booking
router.delete('/events', (req, res) => {
  res.json({ success: true });
// Stub Outlook OAuth flow

    router.get('/outlook/auth/url', (req, res) => {

    res.json({ url: 'https://stub.outlook.auth/oauth' });
router.get('/outlook/auth/callback', (req, res) => {
  res.json({ success: true });
// Stub listing of user Outlook calendar events

    router.get('/outlook/events', (req, res) => {
  res.json([
    {
      id: 'evt3',
      subject: 'Outlook Sample Event 1',
      start: { dateTime: new Date().toISOString() },
      end:   { dateTime: new Date(Date.now() + 3600000).toISOString() }
{
      id: 'evt4',
      subject: 'Outlook Sample Event 2',
      start: { dateTime: new Date().toISOString() },
      end:   { dateTime: new Date(Date.now() + 7200000).toISOString() }
]);
module.exports = router;
