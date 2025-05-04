const express = require('express');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();
const auth = passport.authenticate('jwt', { session: false });

// Public provider search
router.get('/search', async (req, res) => {
  const { q, category, lat, lng, radius } = req.query;
  try {
    const whereClause = { isActive: true };
    if (q) {
      whereClause.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { bio: { contains: q, mode: 'insensitive' } }
      ];
    }
    if (category) whereClause.specialties = { has: category };
    const providers = await prisma.provider.findMany({ where: whereClause });
    res.json(providers);
  } catch (err) {
    console.error('Error searching providers:', err);
    res.status(500).json({ error: 'Failed to search providers' });
  }
});

// Featured providers
router.get('/featured', async (req, res) => {
  try {
    const providers = await prisma.provider.findMany({
      where: { isActive: true }, orderBy: { rating: 'desc' }, take: 10
    });
    res.json(providers);
  } catch (err) {
    console.error('Error fetching featured providers:', err);
    res.status(500).json({ error: 'Failed to fetch featured providers' });
  }
});

// Providers by category
router.get('/category/:category', async (req, res) => {
  const { category } = req.params;
  try {
    const providers = await prisma.provider.findMany({ where: { specialties: { has: category }, isActive: true } });
    res.json(providers);
  } catch (err) {
    console.error('Error fetching providers by category:', err);
    res.status(500).json({ error: 'Failed to fetch providers by category' });
  }
});

// Nearby providers (stubbed)
router.get('/nearby', async (req, res) => {
  try {
    const providers = await prisma.provider.findMany({ where: { isActive: true } });
    res.json(providers);
  } catch (err) {
    console.error('Error fetching nearby providers:', err);
    res.status(500).json({ error: 'Failed to fetch nearby providers' });
  }
});

// GET /api/providers/:id (Provider details)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const provider = await prisma.provider.findUnique({
      where: { id },
      include: { user: true, availability: true }
    });
    if (!provider) return res.status(404).json({ error: 'Provider not found' });
    res.json(provider);
  } catch (err) {
    console.error('Error fetching provider:', err);
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
});

// GET /api/providers/:id/appointments
router.get('/:id/appointments', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const appointments = await prisma.booking.findMany({ where: { providerId: id } });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Services by provider
router.get('/:id/services', async (req, res) => {
  const { id } = req.params;
  try {
    const services = await prisma.service.findMany({
      where: { providerId: id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(services);
  } catch (err) {
    console.error('Error fetching services for provider:', err);
    res.status(500).json({ error: 'Failed to fetch provider services' });
  }
});

// Reviews for provider
router.get('/:id/reviews', async (req, res) => {
  const { id } = req.params;
  try {
    const reviews = await prisma.serviceReview.findMany({
      where: { booking: { providerId: id } },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    const data = reviews.map((r) => ({
      id: r.id,
      user: { name: r.user.name, avatar: r.user.image || '' },
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt,
      images: [],
    }));
    res.json(data);
  } catch (err) {
    console.error('Error fetching reviews for provider:', err);
    res.status(500).json({ error: 'Failed to fetch provider reviews' });
  }
});

module.exports = router; 