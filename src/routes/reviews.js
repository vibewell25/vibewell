import express from 'express';
import { 
  getReviews, 
  getReview, 
  addReview, 
  updateReview, 
  deleteReview 
} from '../controllers/reviewController';

const router = express.Router({ mergeParams: true });

import { protect, authorize } from '../middleware/auth';

router.route('/')
  .get(getReviews)
  .post(protect, authorize('customer'), addReview);

router.route('/:id')
  .get(getReview)
  .put(protect, authorize('customer', 'admin'), updateReview)
  .delete(protect, authorize('customer', 'admin'), deleteReview);

export default router; 