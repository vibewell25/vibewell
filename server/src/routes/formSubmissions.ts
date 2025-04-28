import express, { Request, Response, Router } from 'express';
import prisma from '../prismaClient';
import { checkJwt } from '../middleware/auth';

const router: Router = express.Router();

// List all submissions with docs
router.get('/', checkJwt, async (req: Request, res: Response) => {
  const submissions = await prisma.formSubmission.findMany({ include: { documents: true } });
  res.json({ submissions });
});

// Get single submission
router.get('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const submission = await prisma.formSubmission.findUnique({ where: { id }, include: { documents: true } });
  if (!submission) return res.status(404).json({ error: 'Not found' });
  res.json(submission);
});

// Create submission
router.post('/', checkJwt, async (req: Request, res: Response) => {
  const { definitionId, data } = req.body;
  try {
    const submission = await prisma.formSubmission.create({ data: { definitionId, data } });
    res.json(submission);
  } catch (err) {
    console.error('Create submission error:', err);
    res.status(500).json({ error: 'Failed to create' });
  }
});

// Delete submission
router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.formSubmission.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
