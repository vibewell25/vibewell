import express, { Router, Request, Response } from 'express';
import prisma from '../prismaClient';
import { checkJwt } from '../middleware/auth';
const router: Router = express.Router();

// List all registrations
router.get('/', checkJwt, async (_req: Request, res: Response) => {
  const regs = await prisma.eventRegistration.findMany();
  res.json({ registrations: regs });
});

// List registrations for an event
router.get('/event/:eventId', checkJwt, async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const regs = await prisma.eventRegistration.findMany({ where: { eventId } });
  res.json({ registrations: regs });
});

// List registrations for current user
router.get('/me', checkJwt, async (req: Request, res: Response) => {
  const userId = (req.auth as any).sub as string;
  const regs = await prisma.eventRegistration.findMany({ where: { userId } });
  res.json({ registrations: regs });
});

// Create registration
router.post('/', checkJwt, async (req: Request, res: Response) => {
  const userId = (req.auth as any).sub as string;
  const { eventId } = req.body;
  try {
    const reg = await prisma.eventRegistration.create({ data: { eventId, userId } });
    res.json(reg);
  } catch (err) {
    console.error('Create registration error:', err);
    res.status(500).json({ error: 'Failed to register' });
  }
});

// Delete registration
router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.eventRegistration.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete registration error:', err);
    res.status(500).json({ error: 'Failed to unregister' });
  }
});

export default router;
