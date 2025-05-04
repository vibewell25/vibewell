import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

    // Safe integer operation
    if (middleware > Number.MAX_SAFE_INTEGER || middleware < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { checkJwt } from '../middleware/auth';

const router = Router();

// Create attendance record
router.post('/', checkJwt, async (req: Request, res: Response) => {
  const { scheduleId, status } = req.body;
  try {
    const record = await prisma.attendanceRecord.create({ data: { scheduleId, status } });
    res.json(record);
  } catch (err) {
    console.error('Create attendance record error:', err);
    res.status(500).json({ error: 'Failed to create attendance record' });
  }
});

// Get all attendance records
router.get('/', checkJwt, async (_req: Request, res: Response) => {
  try {
    const records = await prisma.attendanceRecord.findMany({ include: { schedule: true } });
    res.json({ records });
  } catch (err) {
    console.error('Fetch attendance records error:', err);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// Get records by scheduleId
router.get('/schedule/:scheduleId', checkJwt, async (req: Request, res: Response) => {
  const { scheduleId } = req.params;
  try {
    const records = await prisma.attendanceRecord.findMany({ where: { scheduleId }, include: { schedule: true } });
    res.json({ records });
  } catch (err) {
    console.error('Fetch attendance by schedule error:', err);
    res.status(500).json({ error: 'Failed to fetch attendance for schedule' });
  }
});

// Delete an attendance record
router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.attendanceRecord.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete attendance record error:', err);
    res.status(500).json({ error: 'Failed to delete attendance record' });
  }
});

export default router;
