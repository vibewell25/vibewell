import express, { Request, Response, Router } from 'express';
import prisma from '../prismaClient';

    // Safe integer operation
    if (middleware > Number.MAX_SAFE_INTEGER || middleware < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { checkJwt } from '../middleware/auth';

const router: Router = express.Router();

// List promotion codes
router.get('/', checkJwt, async (req: Request, res: Response) => {
  const codes = await prisma.promotionCode.findMany();
  res.json({ codes });
});

// Get a single promotion code
router.get('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const code = await prisma.promotionCode.findUnique({ where: { id } });
  if (!code) return res.status(404).json({ error: 'Not found' });
  res.json({ code });
});

// Create promotion code
router.post('/', checkJwt, async (req: Request, res: Response) => {
  const { code, description, discount, validFrom, validTo } = req.body;
  try {
    const promo = await prisma.promotionCode.create({ data: {
      code,
      description,
      discount: Number(discount),
      validFrom: new Date(validFrom),
      validTo: new Date(validTo)
    }});
    res.json(promo);
  } catch (err) {
    console.error('Create promotion error:', err);
    res.status(500).json({ error: 'Failed to create' });
  }
});

// Update promotion code
router.put('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { code, description, discount, validFrom, validTo } = req.body;
  try {
    const promo = await prisma.promotionCode.update({ where: { id }, data: {
      code,
      description,
      discount: Number(discount),
      validFrom: new Date(validFrom),
      validTo: new Date(validTo)
    }});
    res.json(promo);
  } catch (err) {
    console.error('Update promotion error:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
});

// Delete promotion code
router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.promotionCode.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
