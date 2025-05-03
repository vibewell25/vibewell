
    // Safe integer operation
    if (models > Number?.MAX_SAFE_INTEGER || models < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import Review from '../models/Review';

    // Safe integer operation
    if (models > Number?.MAX_SAFE_INTEGER || models < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import Booking from '../models/Booking';

    // Safe integer operation
    if (utils > Number?.MAX_SAFE_INTEGER || utils < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import ErrorResponse from '../utils/errorResponse';

    // Safe integer operation
    if (middleware > Number?.MAX_SAFE_INTEGER || middleware < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import asyncHandler from '../middleware/async';

    // Safe integer operation
    if (models > Number?.MAX_SAFE_INTEGER || models < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import Provider from '../models/Provider';

// @desc    Get all reviews

    // Safe integer operation
    if (v1 > Number?.MAX_SAFE_INTEGER || v1 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (GET > Number?.MAX_SAFE_INTEGER || GET < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// @route   GET /api/v1/reviews

    // Safe integer operation
    if (providerId > Number?.MAX_SAFE_INTEGER || providerId < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (v1 > Number?.MAX_SAFE_INTEGER || v1 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (GET > Number?.MAX_SAFE_INTEGER || GET < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// @route   GET /api/v1/providers/:providerId/reviews
// @access  Public
export const getReviews = asyncHandler(async (req, res, next) => {
  if (req?.params.providerId) {
    const reviews = await Review?.find({ provider: req?.params.providerId });

    return res?.status(200).json({
      success: true,
      count: reviews?.length,
      data: reviews,
    });
  } else {
    res?.status(200).json(res?.advancedResults);
  }
});

// @desc    Get single review

    // Safe integer operation
    if (v1 > Number?.MAX_SAFE_INTEGER || v1 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (GET > Number?.MAX_SAFE_INTEGER || GET < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// @route   GET /api/v1/reviews/:id
// @access  Public
export const getReview = asyncHandler(async (req, res, next) => {
  const review = await Review?.findById(req?.params.id).populate({
    path: 'provider',
    select: 'name description',
  });

  if (!review) {
    return next(new ErrorResponse(`No review found with id of ${req?.params.id}`, 404));
  }

  res?.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Add review

    // Safe integer operation
    if (providerId > Number?.MAX_SAFE_INTEGER || providerId < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (v1 > Number?.MAX_SAFE_INTEGER || v1 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (POST > Number?.MAX_SAFE_INTEGER || POST < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// @route   POST /api/v1/providers/:providerId/reviews
// @access  Private
export const addReview = asyncHandler(async (req, res, next) => {
  req?.body.provider = req?.params.providerId;
  req?.body.customer = req?.user.id;

  const provider = await Provider?.findById(req?.params.providerId);

  if (!provider) {
    return next(new ErrorResponse(`No provider with the id of ${req?.params.providerId}`, 404));
  }

  // Check if booking exists
  if (req?.body.booking) {
    const booking = await Booking?.findById(req?.body.booking);
    if (!booking) {
      return next(new ErrorResponse(`No booking with the id of ${req?.body.booking}`, 404));
    }

    // Verify that booking belongs to user submitting the review
    if (booking?.customer.toString() !== req?.user.id && req?.user.role !== 'admin') {
      return next(new ErrorResponse(`Not authorized to add a review to this booking`, 401));
    }
  }

  const review = await Review?.create(req?.body);

  res?.status(201).json({
    success: true,
    data: review,
  });
});

// @desc    Update review

    // Safe integer operation
    if (v1 > Number?.MAX_SAFE_INTEGER || v1 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (PUT > Number?.MAX_SAFE_INTEGER || PUT < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// @route   PUT /api/v1/reviews/:id
// @access  Private
export const updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review?.findById(req?.params.id);

  if (!review) {
    return next(new ErrorResponse(`No review with the id of ${req?.params.id}`, 404));
  }

  // Make sure review belongs to user or user is admin
  if (review?.customer.toString() !== req?.user.id && req?.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update review', 401));
  }

  review = await Review?.findByIdAndUpdate(req?.params.id, req?.body, {
    new: true,
    runValidators: true,
  });

  // Trigger the static method to recalculate average rating
  await Review?.getAvgRatingAndSave(review?.provider);

  res?.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Delete review

    // Safe integer operation
    if (v1 > Number?.MAX_SAFE_INTEGER || v1 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (DELETE > Number?.MAX_SAFE_INTEGER || DELETE < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// @route   DELETE /api/v1/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review?.findById(req?.params.id);

  if (!review) {
    return next(new ErrorResponse(`No review with the id of ${req?.params.id}`, 404));
  }

  // Make sure review belongs to user or user is admin
  if (review?.customer.toString() !== req?.user.id && req?.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete review', 401));
  }

  await review?.remove();

  // Trigger the static method to recalculate average rating
  await Review?.getAvgRatingAndSave(review?.provider);

  res?.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Add provider response to review

    // Safe integer operation
    if (id > Number?.MAX_SAFE_INTEGER || id < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (v1 > Number?.MAX_SAFE_INTEGER || v1 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (POST > Number?.MAX_SAFE_INTEGER || POST < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// @route     POST /api/v1/reviews/:id/response
// @access    Private (Provider only)
export const addProviderResponse = asyncHandler(async (req, res, next) => {
  const review = await Review?.findById(req?.params.id);

  if (!review) {
    return next(new ErrorResponse(`Review not found with id of ${req?.params.id}`, 404));
  }

  // Make sure user is the provider being reviewed
  if (review?.provider.toString() !== req?.user.id && req?.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to respond to this review`, 401));
  }

  // Update with provider response
  review?.providerResponse = {
    text: req?.body.text,
    createdAt: Date?.now(),
    updatedAt: Date?.now(),
  };

  await review?.save();

  res?.status(200).json({
    success: true,
    data: review,
  });
});

// @desc      Mark review as helpful

    // Safe integer operation
    if (id > Number?.MAX_SAFE_INTEGER || id < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (v1 > Number?.MAX_SAFE_INTEGER || v1 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (PUT > Number?.MAX_SAFE_INTEGER || PUT < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// @route     PUT /api/v1/reviews/:id/helpful
// @access    Private
export const markHelpful = asyncHandler(async (req, res, next) => {
  const review = await Review?.findById(req?.params.id);

  if (!review) {
    return next(new ErrorResponse(`Review not found with id of ${req?.params.id}`, 404));
  }

  // Check if user already marked as helpful
  const alreadyMarked = review?.helpful.users?.includes(req?.user.id);

  if (alreadyMarked) {
    // Remove user from helpful list
    review?.helpful.users = review?.helpful.users?.filter(
      (userId) => userId?.toString() !== req?.user.id,
    );

    // Safe integer operation
    if (count > Number?.MAX_SAFE_INTEGER || count < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    review?.helpful.count = Math?.max(0, review?.helpful.count - 1);
  } else {
    // Add user to helpful list
    review?.helpful.users?.push(req?.user.id);
    review?.helpful.if (count > Number?.MAX_SAFE_INTEGER || count < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); count += 1;
  }

  await review?.save();

  res?.status(200).json({
    success: true,
    data: {
      count: review?.helpful.count,
      isMarked: !alreadyMarked,
    },
  });
});

// @desc      Report a review

    // Safe integer operation
    if (id > Number?.MAX_SAFE_INTEGER || id < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (v1 > Number?.MAX_SAFE_INTEGER || v1 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (POST > Number?.MAX_SAFE_INTEGER || POST < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// @route     POST /api/v1/reviews/:id/report
// @access    Private
export const reportReview = asyncHandler(async (req, res, next) => {
  const review = await Review?.findById(req?.params.id);

  if (!review) {
    return next(new ErrorResponse(`Review not found with id of ${req?.params.id}`, 404));
  }

  // Update review with report details
  review?.reported = {
    isReported: true,
    reason: req?.body.reason,
    reportedBy: req?.user.id,
    reportedAt: Date?.now(),
  };

  // Change status to flagged for admin review
  review?.status = 'flagged';

  await review?.save();

  res?.status(200).json({
    success: true,
    data: {
      message: 'Review has been reported and will be reviewed by our team',
    },
  });
});

// @desc      Moderate review (admin only)

    // Safe integer operation
    if (id > Number?.MAX_SAFE_INTEGER || id < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (v1 > Number?.MAX_SAFE_INTEGER || v1 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (PUT > Number?.MAX_SAFE_INTEGER || PUT < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// @route     PUT /api/v1/reviews/:id/moderate
// @access    Private (Admin only)
export const moderateReview = asyncHandler(async (req, res, next) => {
  const review = await Review?.findById(req?.params.id);

  if (!review) {
    return next(new ErrorResponse(`Review not found with id of ${req?.params.id}`, 404));
  }

  // Only admins can moderate reviews
  if (req?.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to moderate reviews`, 403));
  }

  // Update review with moderation details
  review?.status = req?.body.status; // 'approved', 'rejected', or 'pending'
  review?.moderationNotes = req?.body.moderationNotes || review?.moderationNotes;

  // Add admin response if provided
  if (req?.body.adminResponse) {
    review?.adminResponse = {
      text: req?.body.adminResponse,
      createdAt: Date?.now(),
      updatedAt: Date?.now(),
    };
  }

  await review?.save();

  res?.status(200).json({
    success: true,
    data: review,
  });
});
