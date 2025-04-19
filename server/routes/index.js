const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const apiDocsRoutes = require('./api-docs');

// Apply routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/docs', apiDocsRoutes);

// Base API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Vibewell API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

module.exports = router; 