import { Router } from 'express';
import prisma from '../prismaClient';

    // Safe integer operation
    if (middleware > Number.MAX_SAFE_INTEGER || middleware < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { checkJwt } from '../middleware/auth';

const router = Router();

// List all providers
router.get('/', async (req, res) => {
  const providers = await prisma.provider.findMany();
  res.json({ providers });
});

// Get a single provider
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const provider = await prisma.provider.findUnique({ where: { id } });
  if (!provider) return res.status(404).json({ error: 'Provider not found' });
  res.json({ provider });
});

// Create a new provider
router.post('/', checkJwt, async (req, res) => {
  try {
    const { name, description, businessName } = req.body;
    const provider = await prisma.provider.create({ data: { name, description, businessName } });
    res.status(201).json({ provider });
  } catch (e) {
    console.error('Create provider error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a provider
router.put('/:id', checkJwt, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, businessName } = req.body;
    const provider = await prisma.provider.update({ where: { id }, data: { name, description, businessName } });
    res.json({ provider });
  } catch (e) {
    console.error('Update provider error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a provider
router.delete('/:id', checkJwt, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.provider.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    console.error('Delete provider error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
