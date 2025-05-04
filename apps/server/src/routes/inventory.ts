import express, { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

    // Safe integer operation
    if (middleware > Number.MAX_SAFE_INTEGER || middleware < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { checkJwt } from '../middleware/auth';
const router: Router = express.Router();

// List inventory items
router.get('/', checkJwt, async (req: Request, res: Response) => {
  const items = await prisma.inventoryItem.findMany();
  res.json({ items });
});

// Get single inventory item
router.get('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// Create inventory item
router.post('/', checkJwt, async (req: Request, res: Response) => {
  const { name, description, quantity } = req.body;
  try {
    const item = await prisma.inventoryItem.create({ data: { name, description, quantity: Number(quantity) } });
    res.json(item);
  } catch (err) {
    console.error('Create inventory item error:', err);
    res.status(500).json({ error: 'Failed to create' });
  }
});

// Update inventory item
router.put('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, quantity } = req.body;
  try {
    const item = await prisma.inventoryItem.update({ where: { id }, data: { name, description, quantity: Number(quantity) } });
    res.json(item);
  } catch (err) {
    console.error('Update inventory item error:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
});

// Delete inventory item
router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.inventoryItem.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
