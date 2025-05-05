import express, { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

    import { checkJwt } from '../middleware/auth';

const router: Router = Router();

// Get current user's referral code
router.get('/code', checkJwt, async (req: Request, res: Response) => {
  const auth = req.auth as any;
  const auth0Id = auth.sub as string;
  const user = await prisma.user.findUnique({ where: { auth0Id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ referralCode: user.referralCode });
// Apply referral code
router.post('/apply', checkJwt, async (req: Request, res: Response) => {
  const { code } = req.body;
  const auth = req.auth as any;
  const auth0Id = auth.sub as string;
  const user = await prisma.user.findUnique({ where: { auth0Id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.referredById) return res.status(400).json({ error: 'Already referred' });
  const referrer = await prisma.user.findUnique({ where: { referralCode: code } });
  if (!referrer) return res.status(404).json({ error: 'Invalid referral code' });
  if (referrer.id === user.id) return res.status(400).json({ error: 'Cannot refer yourself' });

  const rewardPoints = 100;
  await prisma.loyaltyTransaction.createMany({
    data: [
      { userId: referrer.id, points: rewardPoints, type: 'EARN' },
      { userId: user.id, points: rewardPoints, type: 'EARN' },
    ],
await prisma.user.update({ where: { id: user.id }, data: { referredById: referrer.id } });
  res.json({ rewardPoints });
export default router;
