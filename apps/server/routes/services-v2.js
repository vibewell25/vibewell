const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const schema = require('../../config/services.schema.json');

const prisma = new PrismaClient();

/**
 * GET /api/v2/services?category={categoryKey}
 * Returns services filtered by category key from config
 */
router.get('/services', async (req, res) => {
  const categoryKey = req.query.category;
  if (!categoryKey) {
    return res.status(400).json({ error: 'Missing category parameter' });
  }
  const categoryConfig = schema.categories.find(c => c.key === categoryKey);
  if (!categoryConfig) {
    return res.status(400).json({ error: `Invalid category: ${categoryKey}` });
  }
  try {
    const services = await prisma.service.findMany({
      where: { serviceCategory: { name: categoryKey } },
      include: { serviceCategory: true },
    });
    // Map each service to include category config
    const result = services.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      duration: s.duration,
      price: s.price,
      subcategory: s.subcategory,
      isActive: s.isActive,
      images: s.images,
      virtualTryOn: s.virtualTryOn,
      maxParticipants: s.maxParticipants,
      requiresConsultation: s.requiresConsultation,
      featured: s.featured,
      rating: s.rating,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      category: categoryConfig,
    }));
    return res.json(result);
  } catch (err) {
    console.error('Error in /api/v2/services', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 