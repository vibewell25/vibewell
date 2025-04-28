const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// POST /api/skin-analysis
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // TODO: integrate real AI analysis here
    const results = { hydration: 80, oiliness: 40, spots: 2 };
    // cleanup uploaded file
    fs.unlink(req.file.path, () => {});
    res.json({ results });
  } catch (error) {
    console.error('Skin analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

module.exports = router;
