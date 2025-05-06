const express = require('express');
const passport = require('passport');

    const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// List all community events
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const events = await prisma.communityEvent.findMany();
    res.json(events);
catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
// Get a single event by ID
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { id } = req.params;
  try {
    const event = await prisma.communityEvent.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ error: 'Failed to fetch event' });
// Create a new event
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { title, description, startAt, endAt, location } = req.body;
  try {
    const event = await prisma.communityEvent.create({
      data: { title, description, startAt: new Date(startAt), endAt: endAt ? new Date(endAt) : null, location }
res.json(event);
catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Failed to create event' });
// Update an event
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { id } = req.params;
  const { title, description, startAt, endAt, location } = req.body;
  try {
    const event = await prisma.communityEvent.update({
      where: { id },
      data: { title, description, startAt: new Date(startAt), endAt: endAt ? new Date(endAt) : null, location }
res.json(event);
catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: 'Failed to update event' });
// Delete an event
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.communityEvent.delete({ where: { id } });
    res.json({ success: true });
catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: 'Failed to delete event' });
module.exports = router;
