const express = require('express');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult, query } = require('express-validator');

const router = express.Router();
const prisma = new PrismaClient();
const auth = passport.authenticate('jwt', { session: false });

// GET /api/reviews?search=&userId=&serviceId=&businessId=
router.get('/', auth,
  query('search').optional().isString(),
  query('userId').optional().isUUID(),
  query('serviceId').optional().isString(),
  query('businessId').optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { search, userId, serviceId, businessId } = req.query;
    try {
      const where = {};
      if (search) where.comment = { contains: search, mode: 'insensitive' };
      if (userId) where.userId = userId;
      if (serviceId) where.serviceId = serviceId;
      if (businessId) where.businessId = businessId;

      const reviews = await prisma.serviceReview.findMany({
        where,
        include: { user: true, service: true, booking: true, business: true, sentiment: true },
        orderBy: { createdAt: 'desc' },
res.json(reviews);
catch (err) {
      console.error('Error fetching reviews:', err);
      res.status(500).json({ error: 'Failed to fetch reviews' });
// POST /api/reviews
router.post('/', auth,
  body('serviceId').notEmpty().withMessage('serviceId is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be 1-5'),
  body('comment').optional().isString().isLength({ max: 1000 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { serviceId, bookingId, businessId, rating, comment } = req.body;
    try {
      const review = await prisma.serviceReview.create({
        data: {
          serviceId,
          userId: req.user.id,
          bookingId,
          businessId,
          rating: Number(rating),
          comment,
res.status(201).json(review);
catch (err) {
      console.error('Error creating review:', err);
      res.status(500).json({ error: 'Failed to create review' });
// PUT /api/reviews/:id/approve
router.put('/:id/approve', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.serviceReview.update({
      where: { id },
      data: { status: 'APPROVED' }
res.json(updated);
catch (err) {
    console.error('Error approving review:', err);
    res.status(500).json({ error: 'Failed to approve review' });
// PUT /api/reviews/:id/reject
router.put('/:id/reject', auth,
  body('note').notEmpty().withMessage('Rejection note is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { note } = req.body;
    try {
      const updated = await prisma.serviceReview.update({
        where: { id },
        data: { status: 'REJECTED', moderationNotes: note }
res.json(updated);
catch (err) {
      console.error('Error rejecting review:', err);
      res.status(500).json({ error: 'Failed to reject review' });
// PUT /api/reviews/:id/resolve
router.put('/:id/resolve', auth,
  body('note').notEmpty().withMessage('Resolution note is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { note } = req.body;
    try {
      const existing = await prisma.serviceReview.findUnique({ where: { id } });
      const newNotes = (existing.moderationNotes || '') + `\n${new Date().toISOString()}: ${note}`;
      const updated = await prisma.serviceReview.update({
        where: { id },
        data: { status: 'APPROVED', moderationNotes: newNotes }
res.json(updated);
catch (err) {
      console.error('Error resolving review:', err);
      res.status(500).json({ error: 'Failed to resolve review' });
module.exports = router; 