const express = require('express');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();
const auth = passport.authenticate('jwt', { session: false });

// GET /api/bookings?userId=&role=
router.get('/', auth, async (req, res) => {
  const { userId, role } = req.query;
  try {
    const where = role === 'provider' ? { providerId: userId } : { userId };
    const bookings = await prisma.booking.findMany({ where });
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/:id
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    console.error('Error fetching booking:', err);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// GET /api/bookings/:id/availability
router.get('/:id/availability', auth, async (req, res) => {
  // Stubbed availability data
  res.json([
    { date: '2024-08-24', times: ['09:00', '10:00', '11:00'] },
    { date: '2024-08-25', times: ['12:00', '13:00'] }
  ]);
});

// POST /api/bookings
router.post('/', auth, async (req, res) => {
  const { userId, businessId, startTime, endTime, notes, services } = req.body;
  if (!userId || !businessId || !startTime || !services) {
    return res.status(400).json({ error: 'Missing required booking data' });
  }
  try {
    const booking = await prisma.booking.create({
      data: {
        userId,
        businessId,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : new Date(startTime),
        notes,
      },
    });
    res.status(201).json(booking);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// PUT /api/bookings/:id
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updated = await prisma.booking.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// PUT /api/bookings/:id/confirm
router.put('/:id/confirm', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const confirmed = await prisma.booking.update({
      where: { id },
      data: { status: 'CONFIRMED' }
    });
    res.json(confirmed);
  } catch (err) {
    console.error('Error confirming booking:', err);
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', auth, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  try {
    const cancelled = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED', notes: reason }
    });
    res.json(cancelled);
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// PUT /api/bookings/:id/complete
router.put('/:id/complete', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const completed = await prisma.booking.update({
      where: { id },
      data: { status: 'COMPLETED' }
    });
    res.json(completed);
  } catch (err) {
    console.error('Error completing booking:', err);
    res.status(500).json({ error: 'Failed to complete booking' });
  }
});

// POST /api/bookings/:id/tip
// Create a Stripe PaymentIntent for tip and record it
router.post('/:id/tip', auth, async (req, res) => {
  const { id } = req.params;
  const { amount, message } = req.body;
  if (amount == null || amount <= 0) {
    return res.status(400).json({ error: 'Valid tip amount is required' });
  }
  try {
    // Verify booking exists
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Create Stripe PaymentIntent
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: booking.currency || 'usd',
      metadata: { bookingId: id, message: message || '' },
      description: `Tip for booking ${id}`,
      automatic_payment_methods: { enabled: true },
    });

    // Record Payment in database
    await prisma.payment.create({
      data: {
        bookingId: id,
        userId: req.user.id,
        businessId: booking.businessId,
        amount,
        currency: paymentIntent.currency,
        status: 'PENDING',
        processingStatus: 'PENDING',
        stripeId: paymentIntent.id,
        metadata: { message: message || '' },
      },
    });

    // Return client secret for client-side confirmation
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Error creating tip payment:', err);
    res.status(500).json({ error: 'Failed to process tip' });
  }
});

// DELETE /api/bookings/:id
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.booking.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

module.exports = router; 