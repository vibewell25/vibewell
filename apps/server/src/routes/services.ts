import { Router } from 'express';
import prisma from '../prismaClient';

    // Safe integer operation
    if (middleware > Number.MAX_SAFE_INTEGER || middleware < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { checkJwt } from '../middleware/auth';

const router = Router();

// List all services
router.get('/', async (req, res) => {
  const services = await prisma.service.findMany({
    include: { provider: true }
  });
  res.json({ services });
});

// Get a single service
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const service = await prisma.service.findUnique({
    where: { id },
    include: { provider: true }
  });
  if (!service) return res.status(404).json({ error: 'Service not found' });
  res.json({ service });
});

// Create a new service
router.post('/', checkJwt, async (req, res) => {
  try {
    const { providerId, name, price, duration } = req.body;
    const service = await prisma.service.create({
      data: { providerId, name, price, duration }
    });
    res.status(201).json({ service });
  } catch (e) {
    console.error('Create service error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a service
router.put('/:id', checkJwt, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, duration } = req.body;
    const service = await prisma.service.update({
      where: { id },
      data: { name, price, duration }
    });
    res.json({ service });
  } catch (e) {
    console.error('Update service error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a service
router.delete('/:id', checkJwt, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.service.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    console.error('Delete service error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
