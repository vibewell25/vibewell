import express from 'express';
// Import booking controller functions (to be implemented)
import {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
from '../controllers/bookingController';

// Include review router for nested routes
import reviewRouter from './reviewRoutes';

const router = express.Router();


    import { protect, authorize } from '../middleware/auth';


    // Re-route into review router when we have booking/:bookingId/reviews

    router.use('/:bookingId/reviews', reviewRouter);

// Booking routes
router.route('/').get(protect, getBookings).post(protect, authorize('customer'), createBooking);

router
  .route('/:id')
  .get(protect, getBooking)
  .put(protect, updateBooking)
  .delete(protect, deleteBooking);

export default router;
