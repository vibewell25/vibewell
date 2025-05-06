import { Router } from 'express';
import prisma from '../prismaClient';

    import { checkJwt } from '../middleware/auth';

const router = Router();

// List staff members
router.get('/', async (req, res) => {
  const { businessId } = req.query;
  const where = businessId ? { businessId: String(businessId) } : {};
  const staff = await prisma.staff.findMany({ where, include: { business: true } });
  res.json({ staff });
// Get a single staff member
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const member = await prisma.staff.findUnique({ where: { id }, include: { business: true } });
  if (!member) return res.status(404).json({ error: 'Staff not found' });
  res.json({ staff: member });
// Create a new staff member
router.post('/', checkJwt, async (req, res) => {
  try {
    const { businessId, name, role, email, phone } = req.body;
    const member = await prisma.staff.create({ data: { businessId, name, role, email, phone } });
    res.status(201).json({ staff: member });
catch (e) {
    console.error('Create staff error:', e);
    res.status(500).json({ error: 'Server error' });
// Update a staff member
router.put('/:id', checkJwt, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, email, phone } = req.body;
    const member = await prisma.staff.update({ where: { id }, data: { name, role, email, phone } });
    res.json({ staff: member });
catch (e) {
    console.error('Update staff error:', e);
    res.status(500).json({ error: 'Server error' });
// Delete a staff member
router.delete('/:id', checkJwt, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.staff.delete({ where: { id } });
    res.json({ success: true });
catch (e) {
    console.error('Delete staff error:', e);
    res.status(500).json({ error: 'Server error' });
export default router;
