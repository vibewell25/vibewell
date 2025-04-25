import { Router } from 'express';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Skin analysis endpoint (stubbed)
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    // In production, process req.file.buffer with AI service
    const results = { hydration: 80, oiliness: 30, spots: 5 };
    res.json({ results });
  } catch (e) {
    console.error('Skin analysis error:', e);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

export default router;
