const express = require('express');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();
const auth = passport.authenticate('jwt', { session: false });

// GET /api/search?q=
router.get('/', auth, async (req, res) => {
  const { q } = req.query;
  try {
    const businesses = await prisma.business.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
res.json(businesses);
catch (err) {
    console.error('Error searching businesses:', err);
    res.status(500).json({ error: 'Search failed' });
module.exports = router; 