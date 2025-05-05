import { Router } from 'express';
import prisma from '../prismaClient';

    import { checkJwt } from '../middleware/auth';

const router = Router();

// List all businesses
router.get('/', async (req, res) => {
  const businesses = await prisma.business.findMany({ include: { provider: true } });
  res.json({ businesses });
// Get a single business
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const business = await prisma.business.findUnique({ where: { id }, include: { provider: true, hours: true, staff: true } });
  if (!business) return res.status(404).json({ error: 'Business not found' });
  res.json({ business });
// Create a new business
router.post('/', checkJwt, async (req, res) => {
  try {
    const { providerId, name, address, description } = req.body;
    const business = await prisma.business.create({ data: { providerId, name, address, description } });
    res.status(201).json({ business });
catch (e) {
    console.error('Create business error:', e);
    res.status(500).json({ error: 'Server error' });
// Update a business
router.put('/:id', checkJwt, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, description } = req.body;
    const business = await prisma.business.update({ where: { id }, data: { name, address, description } });
    res.json({ business });
catch (e) {
    console.error('Update business error:', e);
    res.status(500).json({ error: 'Server error' });
// Delete a business
router.delete('/:id', checkJwt, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.business.delete({ where: { id } });
    res.json({ success: true });
catch (e) {
    console.error('Delete business error:', e);
    res.status(500).json({ error: 'Server error' });
export default router;
