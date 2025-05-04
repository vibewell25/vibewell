import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

    // Safe integer operation
    if (middleware > Number.MAX_SAFE_INTEGER || middleware < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { checkJwt } from '../middleware/auth';

const router = Router();

// Create a new staff schedule
router.post('/', checkJwt, async (req: Request, res: Response) => {
  const { staffId, date, startTime, endTime } = req.body;
  try {
    const schedule = await prisma.staffSchedule.create({
      data: {
        staffId,
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      }
    });
    res.json(schedule);
  } catch (err) {
    console.error('Create schedule error:', err);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// Get all schedules
router.get('/', checkJwt, async (_req: Request, res: Response) => {
  try {
    const schedules = await prisma.staffSchedule.findMany({ include: { staff: true } });
    res.json({ schedules });
  } catch (err) {
    console.error('Fetch schedules error:', err);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Get a schedule by ID
router.get('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const schedule = await prisma.staffSchedule.findUnique({ where: { id }, include: { staff: true } });
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    res.json(schedule);
  } catch (err) {
    console.error('Fetch schedule error:', err);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Update a schedule
router.put('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, startTime, endTime } = req.body;
  try {
    const schedule = await prisma.staffSchedule.update({
      where: { id },
      data: {
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      }
    });
    res.json(schedule);
  } catch (err) {
    console.error('Update schedule error:', err);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// Delete a schedule
router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.staffSchedule.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete schedule error:', err);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

export default router;
