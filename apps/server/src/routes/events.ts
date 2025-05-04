import express, { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

    // Safe integer operation
    if (middleware > Number.MAX_SAFE_INTEGER || middleware < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { checkJwt } from '../middleware/auth';
const router: Router = express.Router();

// List events
router.get('/', checkJwt, async (req: Request, res: Response) => {
  const events = await prisma.event.findMany({ include: { registrations: true } });
  res.json({ events });
});

// Get event by ID
router.get('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const event = await prisma.event.findUnique({ where: { id }, include: { registrations: true } });
  if (!event) return res.status(404).json({ error: 'Not found' });
  res.json(event);
});

// Create event
router.post('/', checkJwt, async (req: Request, res: Response) => {
  const { title, description, date } = req.body;
  try {
    const newEvent = await prisma.event.create({ data: { title, description, date: new Date(date) } });
    res.json(newEvent);
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Failed to create' });
  }
});

// Update event
router.put('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, date } = req.body;
  try {
    const updated = await prisma.event.update({ where: { id }, data: { title, description, date: new Date(date) } });
    res.json(updated);
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
});

// Delete event
router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.event.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
