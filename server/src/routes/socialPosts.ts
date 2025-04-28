import express, { Router, Request, Response } from 'express';
import prisma from '../prismaClient';
import { checkJwt } from '../middleware/auth';

const router: Router = express.Router();

// List social posts
router.get('/', checkJwt, async (req: Request, res: Response) => {
  const posts = await prisma.socialPost.findMany({ include: { comments: true } });
  res.json({ posts });
});

// Get a single social post
router.get('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = await prisma.socialPost.findUnique({ where: { id }, include: { comments: true } });
  if (!post) return res.status(404).json({ error: 'Not found' });
  res.json(post);
});

// Create social post
router.post('/', checkJwt, async (req: Request, res: Response) => {
  const userId = (req.auth as any).sub as string;
  const { content } = req.body;
  try {
    const newPost = await prisma.socialPost.create({ data: { content, authorId: userId } });
    res.json(newPost);
  } catch (err) {
    console.error('Create social post error:', err);
    res.status(500).json({ error: 'Failed to create' });
  }
});

// Update social post
router.put('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;
  try {
    const updated = await prisma.socialPost.update({ where: { id }, data: { content } });
    res.json(updated);
  } catch (err) {
    console.error('Update social post error:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
});

// Delete social post
router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.socialPost.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
