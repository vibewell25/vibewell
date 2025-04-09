const express = require('express');
// Import booking controller functions (to be implemented)
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking
} = require('../controllers/bookingController');

// Include review router for nested routes
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Re-route into review router when we have booking/:bookingId/reviews
router.use('/:bookingId/reviews', reviewRouter);

// Booking routes
router.route('/')
  .get(protect, getBookings)
  .post(protect, authorize('customer'), createBooking);

router.route('/:id')
  .get(protect, getBooking)
  .put(protect, updateBooking)
  .delete(protect, deleteBooking);

module.exports = router; 