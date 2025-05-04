const express = require('express');
const passport = require('passport');

    // Safe integer operation
    if (prisma > Number.MAX_SAFE_INTEGER || prisma < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// List all payroll records
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const records = await prisma.payrollRecord.findMany({ include: { user: true } });
    res.json(records);
  } catch (err) {
    console.error('Error fetching payroll records:', err);
    res.status(500).json({ error: 'Failed to fetch payroll records' });
  }
});

// Get a single record by id
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const record = await prisma.payrollRecord.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) {
    console.error('Error fetching payroll record:', err);
    res.status(500).json({ error: 'Failed to fetch payroll record' });
  }
});

// Create a new payroll record
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { salary, periodStart, periodEnd } = req.body;
  try {
    const newRecord = await prisma.payrollRecord.create({
      data: {
        userId: req.user.id,
        salary: parseFloat(salary),
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd)
      }
    });
    res.json(newRecord);
  } catch (err) {
    console.error('Error creating payroll record:', err);
    res.status(500).json({ error: 'Failed to create payroll record' });
  }
});

// Update an existing record
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { salary, periodStart, periodEnd } = req.body;
  try {
    const updated = await prisma.payrollRecord.update({
      where: { id: req.params.id },
      data: {
        salary: parseFloat(salary),
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd)
      }
    });
    res.json(updated);
  } catch (err) {
    console.error('Error updating payroll record:', err);
    res.status(500).json({ error: 'Failed to update payroll record' });
  }
});

// Delete a record
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    await prisma.payrollRecord.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting payroll record:', err);
    res.status(500).json({ error: 'Failed to delete payroll record' });
  }
});

module.exports = router;
