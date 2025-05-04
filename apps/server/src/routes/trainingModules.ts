import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

    // Safe integer operation
    if (middleware > Number.MAX_SAFE_INTEGER || middleware < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { checkJwt } from '../middleware/auth';

const router = Router();

// Create training module
router.post('/', checkJwt, async (req: Request, res: Response) => {
  const { title, description, contentUrl } = req.body;
  try {
    const module = await prisma.trainingModule.create({ data: { title, description, contentUrl } });
    res.json(module);
  } catch (err) {
    console.error('Create module error:', err);
    res.status(500).json({ error: 'Failed to create module' });
  }
});

// List all modules
router.get('/', checkJwt, async (_req: Request, res: Response) => {
  try {
    const modules = await prisma.trainingModule.findMany();
    res.json({ modules });
  } catch (err) {
    console.error('Fetch modules error:', err);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// Get a module by ID
router.get('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const module = await prisma.trainingModule.findUnique({ where: { id } });
    if (!module) return res.status(404).json({ error: 'Module not found' });
    res.json(module);
  } catch (err) {
    console.error('Fetch module error:', err);
    res.status(500).json({ error: 'Failed to fetch module' });
  }
});

// Update a module
router.put('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, contentUrl } = req.body;
  try {
    const module = await prisma.trainingModule.update({ where: { id }, data: { title, description, contentUrl } });
    res.json(module);
  } catch (err) {
    console.error('Update module error:', err);
    res.status(500).json({ error: 'Failed to update module' });
  }
});

// Delete a module
router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.trainingModule.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete module error:', err);
    res.status(500).json({ error: 'Failed to delete module' });
  }
});

export default router;
