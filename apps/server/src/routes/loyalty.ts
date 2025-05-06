import express, { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

    import { checkJwt } from '../middleware/auth';

const router: Router = Router();

// Loyalty Tiers CRUD
router.get('/tiers', async (req: Request, res: Response) => {
  const tiers = await prisma.loyaltyTier.findMany();
  res.json({ tiers });
router.get('/tiers/:id', async (req: Request, res: Response) => {
  const tier = await prisma.loyaltyTier.findUnique({ where: { id: req.params.id } });
  if (!tier) return res.status(404).json({ error: 'Tier not found' });
  res.json({ tier });
router.post('/tiers', async (req: Request, res: Response) => {
  const { name, requiredPoints, discount } = req.body;
  const tier = await prisma.loyaltyTier.create({ data: { name, requiredPoints, discount } });
  res.json({ tier });
router.put('/tiers/:id', async (req: Request, res: Response) => {
  const { name, requiredPoints, discount } = req.body;
  try {
    const tier = await prisma.loyaltyTier.update({ where: { id: req.params.id }, data: { name, requiredPoints, discount } });
    res.json({ tier });
catch {
    res.status(404).json({ error: 'Tier not found' });
router.delete('/tiers/:id', async (req: Request, res: Response) => {
  try {
    await prisma.loyaltyTier.delete({ where: { id: req.params.id } });
    res.sendStatus(204);
catch {
    res.status(404).json({ error: 'Tier not found' });
// Loyalty Transactions CRUD
router.get('/transactions', async (req: Request, res: Response) => {
  const userId = req.query.userId as string | undefined;
  const where = userId ? { userId } : {};
  const transactions = await prisma.loyaltyTransaction.findMany({ where, include: { tier: true } });
  res.json({ transactions });
router.get('/transactions/:id', async (req: Request, res: Response) => {
  const tx = await prisma.loyaltyTransaction.findUnique({ where: { id: req.params.id }, include: { tier: true } });
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });
  res.json({ transaction: tx });
router.post('/transactions', async (req: Request, res: Response) => {
  const { userId, tierId, points, type } = req.body;
  const transaction = await prisma.loyaltyTransaction.create({ data: { userId, tierId: tierId || undefined, points, type } });
  res.json({ transaction });
// Get user loyalty balance
router.get('/balance', checkJwt, async (req: Request, res: Response) => {
  const auth = req.auth as any;
  const auth0Id = auth.sub as string;
  const user = await prisma.user.findUnique({ where: { auth0Id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const earned = await prisma.loyaltyTransaction.aggregate({ where: { userId: user.id, type: 'EARN' }, _sum: { points: true } });
  const redeemed = await prisma.loyaltyTransaction.aggregate({ where: { userId: user.id, type: 'REDEEM' }, _sum: { points: true } });
  const balance = (earned._sum.points ?? 0) - (redeemed._sum.points ?? 0);
  res.json({ balance });
// Redeem points for a tier
router.post('/redeem', checkJwt, async (req: Request, res: Response) => {
  const { tierId } = req.body;
  const auth = req.auth as any;
  const auth0Id = auth.sub as string;
  const user = await prisma.user.findUnique({ where: { auth0Id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const tier = await prisma.loyaltyTier.findUnique({ where: { id: tierId } });
  if (!tier) return res.status(404).json({ error: 'Tier not found' });
  const earned = await prisma.loyaltyTransaction.aggregate({ where: { userId: user.id, type: 'EARN' }, _sum: { points: true } });
  const redeemed = await prisma.loyaltyTransaction.aggregate({ where: { userId: user.id, type: 'REDEEM' }, _sum: { points: true } });
  const balance = (earned._sum.points ?? 0) - (redeemed._sum.points ?? 0);
  if (balance < tier.requiredPoints) return res.status(400).json({ error: 'Not enough points' });
  const transaction = await prisma.loyaltyTransaction.create({ data: { userId: user.id, tierId, points: tier.requiredPoints, type: 'REDEEM' } });

    res.json({ transaction, balance: balance - tier.requiredPoints });
export default router;
