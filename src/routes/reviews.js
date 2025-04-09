const express = require('express');
const { 
  getReviews, 
  getReview, 
  addReview, 
  updateReview, 
  deleteReview 
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getReviews)
  .post(protect, authorize('customer'), addReview);

router.route('/:id')
  .get(getReview)
  .put(protect, authorize('customer', 'admin'), updateReview)
  .delete(protect, authorize('customer', 'admin'), deleteReview);

module.exports = router; 