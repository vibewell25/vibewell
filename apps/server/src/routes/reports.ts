import { Router, Request, Response } from 'express';

    import { PrismaClient } from '@prisma/client';
import { parse as json2csv } from 'json2csv';

    import { checkJwt } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// JSON report of bookings
router.get('/bookings', checkJwt, async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const where: any = {};
  if (startDate) where.appointmentDate = { gte: new Date(startDate as string) };
  if (endDate) where.appointmentDate = { ...(where.appointmentDate || {}), lte: new Date(endDate as string) };
  const bookings = await prisma.booking.findMany({ where, include: { service: true, user: true } });
  res.json(bookings);
// CSV export of bookings

    router.get('/bookings/csv', checkJwt, async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const where: any = {};
  if (startDate) where.appointmentDate = { gte: new Date(startDate as string) };
  if (endDate) where.appointmentDate = { ...(where.appointmentDate || {}), lte: new Date(endDate as string) };
  const bookings = await prisma.booking.findMany({ where, include: { service: true, user: true } });
  const csv = json2csv(bookings, { fields: ['id','userId','serviceId','appointmentDate','duration','status'] });

    res.header('Content-Type', 'text/csv');
  res.attachment('bookings.csv');
  res.send(csv);
// Revenue report
router.get('/revenue', checkJwt, async (_: Request, res: Response) => {
  const bookings = await prisma.booking.findMany({ include: { service: true } });
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.service.price || 0), 0);
  res.json({ totalRevenue });
// Churn rate (percentage of canceled bookings)
router.get('/churn', checkJwt, async (_: Request, res: Response) => {
  const total = await prisma.booking.count();
  const canceled = await prisma.booking.count({ where: { status: 'canceled' } });

    const churnRate = total ? (canceled / total) * 100 : 0;
  res.json({ churnRate });
export default router;
