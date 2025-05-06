const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');

    const apiDocsRoutes = require('./api-docs');
const servicesV2Routes = require('./services-v2');

// Apply routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/docs', apiDocsRoutes);
router.use('/v2', servicesV2Routes);

// Calendar integration routes
router.use('/calendar', require('./calendarStub'));
// Outlook calendar OAuth and events

    router.use('/calendar/outlook', require('./outlook'));
// Forms & Docs routes
router.use('/forms', require('./forms'));
// Inventory management routes
router.use('/inventory', require('./inventory'));
// Equipment management routes
router.use('/equipment', require('./equipment'));
router.use('/uploads', require('./uploads'));

// Community & Social routes
router.use('/posts', require('./posts'));
router.use('/comments', require('./comments'));

    router.use('/threads', require('./community/threads'));

    router.use('/events', require('./community/events'));
// Payroll & Benefits routes
router.use('/payroll', require('./payroll'));
// Benefits routes
router.use('/benefits', require('./benefits'));
// Analytics routes
router.use('/analytics', require('./analytics'));

// Scaffolded routes
router.use('/reviews', require('./reviews'));
router.use('/search', require('./search'));
router.use('/bookings', require('./bookings'));
router.use('/providers', require('./providers'));
router.use('/businesses', require('./businesses'));

// Base API info endpoint
router.get('/', (req, res) => {
  // Base API info endpoint
  res.json({
    name: 'Vibewell API',
    version: '1.0.0',
    documentation: '/api/docs',
module.exports = router; 