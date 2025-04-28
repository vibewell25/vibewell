import express, { Router, Request, Response } from 'express';
import prisma from '../prismaClient';
import { checkJwt } from '../middleware/auth';
const router: Router = express.Router();

// List all benefit claims
router.get('/', checkJwt, async (_req: Request, res: Response) => {
  const claims = await prisma.benefitClaim.findMany();
  res.json({ claims });
});

// List current user's benefit claims
router.get('/me', checkJwt, async (req: Request, res: Response) => {
  const userId = (req.auth as any).sub as string;
  const claims = await prisma.benefitClaim.findMany({ where: { userId } });
  res.json({ claims });
});

// Get a single claim
router.get('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const claim = await prisma.benefitClaim.findUnique({ where: { id } });
  if (!claim) return res.status(404).json({ error: 'Not found' });
  res.json(claim);
});

// Create a benefit claim
router.post('/', checkJwt, async (req: Request, res: Response) => {
  const userId = (req.auth as any).sub as string;
  const { type, amount } = req.body;
  try {
    const claim = await prisma.benefitClaim.create({ data: { userId, type, amount: amount ? Number(amount) : undefined, status: 'pending' } });
    res.json(claim);
  } catch (err) {
    console.error('Create benefit claim error:', err);
    res.status(500).json({ error: 'Failed to create' });
  }
});

// Update a claim
router.put('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, processedAt } = req.body;
  try {
    const updated = await prisma.benefitClaim.update({
      where: { id },
      data: { status, processedAt: processedAt ? new Date(processedAt) : undefined }
    });
    res.json(updated);
  } catch (err) {
    console.error('Update benefit claim error:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
});

// Delete a claim
router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.benefitClaim.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
