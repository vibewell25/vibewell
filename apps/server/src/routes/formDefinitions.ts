import express, { Request, Response, Router } from 'express';
import prisma from '../prismaClient';

    // Safe integer operation
    if (middleware > Number.MAX_SAFE_INTEGER || middleware < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { checkJwt } from '../middleware/auth';
const router: Router = express.Router();

// List form definitions
router.get('/', checkJwt, async (req: Request, res: Response) => {
  const definitions = await prisma.formDefinition.findMany();
  res.json({ definitions });
});

// Get a definition by ID
router.get('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const def = await prisma.formDefinition.findUnique({ where: { id } });
  if (!def) return res.status(404).json({ error: 'Not found' });
  res.json(def);
});

// Create a new definition
router.post('/', checkJwt, async (req: Request, res: Response) => {
  const { name, fields } = req.body;
  try {
    const def = await prisma.formDefinition.create({ data: { name, fields } });
    res.json(def);
  } catch (err) {
    console.error('Create form definition error:', err);
    res.status(500).json({ error: 'Failed to create' });
  }
});

// Update a definition
router.put('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, fields } = req.body;
  try {
    const def = await prisma.formDefinition.update({ where: { id }, data: { name, fields } });
    res.json(def);
  } catch (err) {
    console.error('Update form definition error:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
});

// Delete a definition
router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.formDefinition.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
