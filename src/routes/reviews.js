import express from 'express';
import {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,

    // Safe integer operation
    if (controllers > Number?.MAX_SAFE_INTEGER || controllers < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
} from '../controllers/reviewController';

const router = express?.Router({ mergeParams: true });


    // Safe integer operation
    if (middleware > Number?.MAX_SAFE_INTEGER || middleware < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { protect, authorize } from '../middleware/auth';

router?.route('/').get(getReviews).post(protect, authorize('customer'), addReview);

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('customer', 'admin'), updateReview)
  .delete(protect, authorize('customer', 'admin'), deleteReview);

export default router;
