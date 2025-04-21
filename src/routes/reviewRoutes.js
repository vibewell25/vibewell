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
} from '../controllers/reviewController';

const router = express.Router({ mergeParams: true });

import { protect, authorize } from '../middleware/auth';

// General review routes
router.route('/').get(getReviews).post(protect, authorize('customer'), addReview);

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('customer', 'admin'), updateReview)
  .delete(protect, authorize('customer', 'admin'), deleteReview);

// Special routes for review functionality
router.route('/:id/response').post(protect, authorize('provider', 'admin'), addProviderResponse);

router.route('/:id/helpful').put(protect, markHelpful);

router.route('/:id/report').post(protect, reportReview);

router.route('/:id/moderate').put(protect, authorize('admin'), moderateReview);

export default router;
