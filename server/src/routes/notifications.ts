import express, { Router, Request, Response } from 'express';
import prisma from '../prismaClient';
import { checkJwt } from '../middleware/auth';

const router: Router = express.Router();

// Register Expo push token with the backend
router.post('/register', checkJwt, async (req: Request, res: Response) => {
  const { token } = req.body;
  const auth = req.auth as any;
  const auth0Id = auth.sub as string;
  const user = await prisma.user.findUnique({ where: { auth0Id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const tokens: string[] = (user.pushTokens as string[]) || [];
  if (!tokens.includes(token)) tokens.push(token);
  await prisma.user.update({ where: { id: user.id }, data: { pushTokens: tokens } });
  res.json({ success: true });
});

// Fetch user notifications
router.get('/', checkJwt, async (req: Request, res: Response) => {
  const auth = req.auth as any;
  const userId = auth.sub as string;
  const items = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ notifications: items });
});

// Mark notification as read
router.post('/read/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const notification = await prisma.notification.update({
    where: { id },
    data: { read: true },
  });
  res.json(notification);
});

export default router;
