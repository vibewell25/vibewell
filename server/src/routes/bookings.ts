import express, { Request, Response } from 'express';
import prisma from '../prismaClient';
import { checkJwt } from '../middleware/auth';

const router = express.Router();

// List all bookings for the authenticated user
router.get('/', checkJwt, async (req: Request, res: Response) => {
  const userId = (req.auth as any).sub as string;
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: { service: true },
  });
  res.json({ bookings });
});

// Get a booking by ID (only owner)
router.get('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req.auth as any).sub as string;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { service: true },
  });
  if (!booking || booking.userId !== userId) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  res.json({ booking });
});

// Create a new booking
router.post('/', checkJwt, async (req: Request, res: Response) => {
  const userId = (req.auth as any).sub as string;
  const { serviceId, appointmentDate, duration, specialRequests } = req.body;
  try {
    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceId,
        appointmentDate: new Date(appointmentDate),
        duration,
        specialRequests,
      },
    });
    res.status(201).json({ booking });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update booking status
router.patch('/:id/status', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    });
    res.json({ booking });
  } catch (err) {
    console.error('Update booking status error:', err);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Delete a booking
router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.booking.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete booking error:', err);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

export default router;
