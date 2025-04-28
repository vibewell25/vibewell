import express, { Router, Request, Response } from 'express';
import prisma from '../prismaClient';
import { checkJwt } from '../middleware/auth';
const router: Router = express.Router();

// List all payroll records
router.get('/', checkJwt, async (_req: Request, res: Response) => {
  const records = await prisma.payrollRecord.findMany();
  res.json({ records });
});

// List current user's payroll records
router.get('/me', checkJwt, async (req: Request, res: Response) => {
  const userId = (req.auth as any).sub as string;
  const records = await prisma.payrollRecord.findMany({ where: { userId } });
  res.json({ records });
});

// Get a record by ID
router.get('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const record = await prisma.payrollRecord.findUnique({ where: { id } });
  if (!record) return res.status(404).json({ error: 'Not found' });
  res.json(record);
});

// Create a payroll record
router.post('/', checkJwt, async (req: Request, res: Response) => {
  const { userId, salary, periodStart, periodEnd } = req.body;
  try {
    const newRec = await prisma.payrollRecord.create({ data: {
      userId,
      salary: Number(salary),
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd)
    }});
    res.json(newRec);
  } catch (err) {
    console.error('Create payroll record error:', err);
    res.status(500).json({ error: 'Failed to create' });
  }
});

// Update a payroll record
router.put('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { salary, periodStart, periodEnd } = req.body;
  try {
    const updated = await prisma.payrollRecord.update({ where: { id }, data: {
      salary: Number(salary),
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd)
    }});
    res.json(updated);
  } catch (err) {
    console.error('Update payroll record error:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
});

// Delete a payroll record
router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.payrollRecord.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
