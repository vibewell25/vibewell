import { Router, Request, Response } from 'express';
import { checkJwt } from '../middleware/auth';

const router = Router();

// Stub Virtual Try-On Makeup
router.get('/makeup', checkJwt, async (req: Request, res: Response) => {
  // Placeholder image URL
  res.json({ imageUrl: 'https://via.placeholder.com/300x300.png?text=Makeup+Try-On' });
});

// Stub Virtual Try-On Hair
router.get('/hair', checkJwt, async (req: Request, res: Response) => {
  res.json({ imageUrl: 'https://via.placeholder.com/300x300.png?text=Hair+Try-On' });
});

// Style recommendations (placeholder)
router.get('/style-recommendations', checkJwt, async (req: Request, res: Response) => {
  res.json({ styles: ['Bold Red Lip', 'Natural Glow', 'Smokey Eye'] });
});

export default router;
