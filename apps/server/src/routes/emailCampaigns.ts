import express, { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

    import { checkJwt } from '../middleware/auth';

const router: Router = express.Router();

// List email campaigns
router.get('/', checkJwt, async (req: Request, res: Response) => {
  const campaigns = await prisma.emailCampaign.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ campaigns });
// Get a single campaign
router.get('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const campaign = await prisma.emailCampaign.findUnique({ where: { id } });
  if (!campaign) return res.status(404).json({ error: 'Not found' });
  res.json({ campaign });
// Create email campaign
router.post('/', checkJwt, async (req: Request, res: Response) => {
  const { name, subject, body, scheduledAt } = req.body;
  try {
    const campaign = await prisma.emailCampaign.create({
      data: {
        name,
        subject,
        body,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined
res.json(campaign);
catch (err) {
    console.error('Create email campaign error:', err);
    res.status(500).json({ error: 'Failed to create' });
// Update email campaign
router.put('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, subject, body, scheduledAt, sent } = req.body;
  try {
    const campaign = await prisma.emailCampaign.update({
      where: { id },
      data: {
        name,
        subject,
        body,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        sent: sent ?? false
res.json(campaign);
catch (err) {
    console.error('Update email campaign error:', err);
    res.status(500).json({ error: 'Failed to update' });
// Delete email campaign
router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.emailCampaign.delete({ where: { id } });
  res.json({ success: true });
export default router;
