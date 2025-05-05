import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

    import { checkJwt } from '../middleware/auth';

const router = Router();

// Mark training progress
router.post('/', checkJwt, async (req: Request, res: Response) => {
  const userId = (req as any).auth.userId;
  const { moduleId } = req.body;
  try {
    const progress = await prisma.trainingProgress.create({ data: { moduleId, userId } });
    res.json(progress);
catch (err) {
    console.error('Create progress error:', err);
    res.status(500).json({ error: 'Failed to mark progress' });
// Get user progress
router.get('/', checkJwt, async (req: Request, res: Response) => {
  const auth = req.auth as any;
  try {
    const progress = await prisma.trainingProgress.findMany({ where: { userId: auth.sub } });
    res.json({ progress });
catch (err) {
    console.error('Fetch progress error:', err);
    res.status(500).json({ error: 'Failed to fetch progress' });
// Delete training progress
router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.trainingProgress.delete({ where: { id } });
    res.json({ success: true });
catch (err) {
    console.error('Delete progress error:', err);
    res.status(500).json({ error: 'Failed to delete progress' });
export default router;
