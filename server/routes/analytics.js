const express = require('express');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

const auth = passport.authenticate('jwt', { session: false });

// Analytics summary metrics
router.get('/summary', auth, async (req, res) => {
  try {
    const bookingCount = await prisma.booking.count();
    const payrollAgg = await prisma.payrollRecord.aggregate({ _sum: { salary: true } });
    const benefitsAgg = await prisma.benefitClaim.aggregate({
      where: { status: 'approved' },
      _sum: { amount: true }
    });
    res.json({
      bookingCount,
      payrollTotal: payrollAgg._sum.salary || 0,
      benefitsTotal: benefitsAgg._sum.amount || 0
    });
  } catch (err) {
    console.error('Analytics summary error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics summary' });
  }
});

// Monthly bookings count
router.get('/bookings/monthly', auth, async (req, res) => {
  try {
    const recs = await prisma.booking.findMany({ select: { appointmentDate: true } });
    const counts = recs.reduce((acc, { appointmentDate }) => {
      const month = new Date(appointmentDate).toISOString().slice(0,7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    const data = Object.entries(counts)
      .map(([month, count]) => ({ month, count }))
      .sort((a,b) => a.month.localeCompare(b.month));
    res.json(data);
  } catch (err) {
    console.error('Analytics bookings monthly error:', err);
    res.status(500).json({ error: 'Failed to fetch monthly bookings' });
  }
});

// Monthly payroll spend
router.get('/payroll/monthly', auth, async (req, res) => {
  try {
    const recs = await prisma.payrollRecord.findMany({ select: { salary: true, periodStart: true } });
    const sums = recs.reduce((acc, { salary, periodStart }) => {
      const month = new Date(periodStart).toISOString().slice(0,7);
      acc[month] = (acc[month] || 0) + salary;
      return acc;
    }, {});
    const data = Object.entries(sums)
      .map(([month, total]) => ({ month, total }))
      .sort((a,b) => a.month.localeCompare(b.month));
    res.json(data);
  } catch (err) {
    console.error('Analytics payroll monthly error:', err);
    res.status(500).json({ error: 'Failed to fetch monthly payroll' });
  }
});

// Monthly benefits payout
router.get('/benefits/monthly', auth, async (req, res) => {
  try {
    const recs = await prisma.benefitClaim.findMany({
      where: { status: 'approved' },
      select: { amount: true, requestedAt: true }
    });
    const sums = recs.reduce((acc, { amount, requestedAt }) => {
      const month = new Date(requestedAt).toISOString().slice(0,7);
      acc[month] = (acc[month] || 0) + (amount || 0);
      return acc;
    }, {});
    const data = Object.entries(sums)
      .map(([month, total]) => ({ month, total }))
      .sort((a,b) => a.month.localeCompare(b.month));
    res.json(data);
  } catch (err) {
    console.error('Analytics benefits monthly error:', err);
    res.status(500).json({ error: 'Failed to fetch monthly benefits' });
  }
});

// Revenue metrics (one-time and subscription)
router.get('/metrics/revenue', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const paymentAgg = await prisma.paymentTransaction.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: start, lte: end }, mode: 'payment' },
    });
    const subscriptionAgg = await prisma.paymentTransaction.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: start, lte: end }, mode: 'subscription' },
    });
    const payment = paymentAgg._sum.amount || 0;
    const subscription = subscriptionAgg._sum.amount || 0;
    const total = payment + subscription;
    res.json({ total, payment, subscription });
  } catch (err) {
    console.error('Error fetching revenue metrics:', err);
    res.status(500).json({ error: 'Failed to fetch revenue metrics' });
  }
});

// Client metrics: new vs returning users
router.get('/metrics/clients', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const newUsers = await prisma.user.count({ where: { createdAt: { gte: start, lte: end } } });
    const bookings = await prisma.booking.findMany({ where: { appointmentDate: { gte: start, lte: end } }, select: { userId: true } });
    const uniqueUserIds = [...new Set(bookings.map(b => b.userId))];
    const returningUsers = await prisma.user.count({ where: { id: { in: uniqueUserIds }, createdAt: { lt: start } } });
    res.json({ newUsers, returningUsers });
  } catch (err) {
    console.error('Error fetching client metrics:', err);
    res.status(500).json({ error: 'Failed to fetch client metrics' });
  }
});

// Service usage metrics
router.get('/metrics/services', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const records = await prisma.booking.findMany({
      where: { appointmentDate: { gte: start, lte: end } },
      select: { serviceId: true, service: { select: { name: true } } },
    });
    const counts = records.reduce((acc, { serviceId, service }) => {
      if (!acc[serviceId]) acc[serviceId] = { serviceId, name: service.name || null, count: 0 };
      acc[serviceId].count++;
      return acc;
    }, {});
    const services = Object.values(counts);
    res.json({ services });
  } catch (err) {
    console.error('Error fetching service metrics:', err);
    res.status(500).json({ error: 'Failed to fetch service metrics' });
  }
});

// Subscription churn metrics
router.get('/metrics/subscription-churn', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const cancellations = await prisma.subscription.count({ where: { currentPeriodEnd: { gte: start, lte: end } } });
    const totalSubs = await prisma.subscription.count({ where: { currentPeriodEnd: { gte: end } } });
    const churnRate = totalSubs > 0 ? cancellations / totalSubs : 0;
    res.json({ cancellations, totalSubs, churnRate });
  } catch (err) {
    console.error('Error fetching subscription churn metrics:', err);
    res.status(500).json({ error: 'Failed to fetch subscription churn metrics' });
  }
});

// Revenue breakdown for chart
router.get('/metrics/revenue-breakdown', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const records = await prisma.paymentTransaction.findMany({ where: { createdAt: { gte: start, lte: end } }, select: { createdAt: true, amount: true } });
    const breakdownMap = records.reduce((acc, { createdAt, amount }) => {
      const date = createdAt.toISOString().slice(0,10);
      acc[date] = (acc[date] || 0) + amount;
      return acc;
    }, {});
    const breakdown = Object.entries(breakdownMap).map(([date, total]) => ({ date, total })).sort((a,b) => a.date.localeCompare(b.date));
    res.json(breakdown);
  } catch (err) {
    console.error('Error fetching revenue breakdown metrics:', err);
    res.status(500).json({ error: 'Failed to fetch revenue breakdown metrics' });
  }
});

// CSV export endpoints
router.get('/metrics/revenue/export', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const paymentAgg = await prisma.paymentTransaction.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: start, lte: end }, mode: 'payment' } });
    const subscriptionAgg = await prisma.paymentTransaction.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: start, lte: end }, mode: 'subscription' } });
    const payment = paymentAgg._sum.amount || 0;
    const subscription = subscriptionAgg._sum.amount || 0;
    const total = payment + subscription;
    const csv = 'metric,value\n' + `total,${total}\n` + `payment,${payment}\n` + `subscription,${subscription}\n`;
    res.header('Content-Type','text/csv');
    res.send(csv);
  } catch (err) {
    console.error('Error exporting revenue CSV:', err);
    res.status(500).send('Failed to export revenue CSV');
  }
});

router.get('/metrics/clients/export', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const newUsers = await prisma.user.count({ where: { createdAt: { gte: start, lte: end } } });
    const bookings = await prisma.booking.findMany({ where: { appointmentDate: { gte: start, lte: end } }, select: { userId: true } });
    const uniqueUserIds = [...new Set(bookings.map(b => b.userId))];
    const returningUsers = await prisma.user.count({ where: { id: { in: uniqueUserIds }, createdAt: { lt: start } } });
    const csv = 'metric,value\n' + `newUsers,${newUsers}\n` + `returningUsers,${returningUsers}\n`;
    res.header('Content-Type','text/csv');
    res.send(csv);
  } catch (err) {
    console.error('Error exporting client CSV:', err);
    res.status(500).send('Failed to export client CSV');
  }
});

router.get('/metrics/services/export', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const records = await prisma.booking.findMany({ where: { appointmentDate: { gte: start, lte: end } }, select: { serviceId: true, service: { select: { name: true } } } });
    const counts = records.reduce((acc, { serviceId, service }) => { acc[serviceId] = acc[serviceId] || { serviceId, name: service.name || '', count: 0 }; acc[serviceId].count++; return acc; }, {});
    const rows = Object.values(counts);
    let csv = 'serviceId,name,count\n';
    rows.forEach(r => { csv += `${r.serviceId},${r.name},${r.count}\n`; });
    res.header('Content-Type','text/csv');
    res.send(csv);
  } catch (err) {
    console.error('Error exporting services CSV:', err);
    res.status(500).send('Failed to export services CSV');
  }
});

router.get('/metrics/subscription-churn/export', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const cancellations = await prisma.subscription.count({ where: { currentPeriodEnd: { gte: start, lte: end } } });
    const totalSubs = await prisma.subscription.count({ where: { currentPeriodEnd: { gte: end } } });
    const churnRate = totalSubs > 0 ? cancellations / totalSubs : 0;
    const csv = 'metric,value\n' + `cancellations,${cancellations}\n` + `totalSubs,${totalSubs}\n` + `churnRate,${churnRate}\n`;
    res.header('Content-Type','text/csv');
    res.send(csv);
  } catch (err) {
    console.error('Error exporting churn CSV:', err);
    res.status(500).send('Failed to export churn CSV');
  }
});

router.get('/metrics/revenue-breakdown/export', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const records = await prisma.paymentTransaction.findMany({ where: { createdAt: { gte: start, lte: end } }, select: { createdAt: true, amount: true } });
    const breakdownMap = records.reduce((acc, { createdAt, amount }) => { const date = createdAt.toISOString().slice(0,10); acc[date] = (acc[date] || 0) + amount; return acc; }, {});
    const sorted = Object.entries(breakdownMap).sort((a,b) => a[0].localeCompare(b[0]));
    let csv = 'date,total\n';
    sorted.forEach(([date,total]) => { csv += `${date},${total}\n`; });
    res.header('Content-Type','text/csv');
    res.send(csv);
  } catch (err) {
    console.error('Error exporting breakdown CSV:', err);
    res.status(500).send('Failed to export breakdown CSV');
  }
});

module.exports = router;
