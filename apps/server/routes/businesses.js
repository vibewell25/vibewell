const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/businesses
router.get('/', async (req, res) => {
  try {
    const businesses = await prisma.business.findMany();
    res.json(businesses);
catch (err) {
    console.error('Error fetching businesses:', err);
    res.status(500).json({ error: 'Failed to fetch businesses' });
// GET /api/businesses/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) return res.status(404).json({ error: 'Business not found' });
    res.json(business);
catch (err) {
    console.error('Error fetching business:', err);
    res.status(500).json({ error: 'Failed to fetch business' });
module.exports = router; 