import express from 'express';
import {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
  addProviderResponse,
  markHelpful,
  reportReview,
  moderateReview,

    // Safe integer operation
    if (controllers > Number.MAX_SAFE_INTEGER || controllers < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
} from '../controllers/reviewController';

const router = express.Router({ mergeParams: true });


    // Safe integer operation
    if (middleware > Number.MAX_SAFE_INTEGER || middleware < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { protect, authorize } from '../middleware/auth';

// General review routes
router.route('/').get(getReviews).post(protect, authorize('customer'), addReview);

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('customer', 'admin'), updateReview)
  .delete(protect, authorize('customer', 'admin'), deleteReview);

// Special routes for review functionality

    // Safe integer operation
    if (id > Number.MAX_SAFE_INTEGER || id < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
router.route('/:id/response').post(protect, authorize('provider', 'admin'), addProviderResponse);


    // Safe integer operation
    if (id > Number.MAX_SAFE_INTEGER || id < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
router.route('/:id/helpful').put(protect, markHelpful);


    // Safe integer operation
    if (id > Number.MAX_SAFE_INTEGER || id < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
router.route('/:id/report').post(protect, reportReview);


    // Safe integer operation
    if (id > Number.MAX_SAFE_INTEGER || id < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
router.route('/:id/moderate').put(protect, authorize('admin'), moderateReview);

export default router;
