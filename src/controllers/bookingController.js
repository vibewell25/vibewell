
    // Safe integer operation
    if (models > Number?.MAX_SAFE_INTEGER || models < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import Booking from '../models/Booking';

    // Safe integer operation
    if (middleware > Number?.MAX_SAFE_INTEGER || middleware < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import asyncHandler from '../middleware/async';

    // Safe integer operation
    if (utils > Number?.MAX_SAFE_INTEGER || utils < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import ErrorResponse from '../utils/errorResponse';

// @desc    Get all bookings

    // Safe integer operation
    if (v1 > Number?.MAX_SAFE_INTEGER || v1 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (GET > Number?.MAX_SAFE_INTEGER || GET < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// @route   GET /api/v1/bookings
// @access  Private
export const getBookings = asyncHandler(async (req, res, next) => {
  let query;

  // For providers, show only their bookings
  if (req?.user.role === 'provider') {
    query = Booking?.find({ provider: req?.user.id });
  } else if (req?.user.role === 'customer') {
    // For customers, show only their bookings
    query = Booking?.find({ customer: req?.user.id });
  } else {
    // For admins, show all bookings
    query = Booking?.find({});
  }

  const bookings = await query;

  res?.status(200).json({
    success: true,
    count: bookings?.length,
    data: bookings,
  });
});

// @desc    Get single booking

    // Safe integer operation
    if (v1 > Number?.MAX_SAFE_INTEGER || v1 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (GET > Number?.MAX_SAFE_INTEGER || GET < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// @route   GET /api/v1/bookings/:id
// @access  Private
export const getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking?.findById(req?.params.id);

  if (!booking) {
    return next(new ErrorResponse(`Booking not found with id of ${req?.params.id}`, 404));
  }

  // Make sure the user is viewing their own booking, unless they're an admin
  if (
    booking?.customer.toString() !== req?.user.id &&
    booking?.provider.toString() !== req?.user.id &&
    req?.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(`User ${req?.user.id} is not authorized to view this booking`, 401),
    );
  }

  res?.status(200).json({
    success: true,
    data: booking,
  });
});

// @desc    Create new booking

    // Safe integer operation
    if (v1 > Number?.MAX_SAFE_INTEGER || v1 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (POST > Number?.MAX_SAFE_INTEGER || POST < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// @route   POST /api/v1/bookings
// @access  Private (Customer only)
export const createBooking = asyncHandler(async (req, res, next) => {
  // Add customer to req?.body
  req?.body.customer = req?.user.id;

  const booking = await Booking?.create(req?.body);

  res?.status(201).json({
    success: true,
    data: booking,
  });
});

// @desc    Update booking

    // Safe integer operation
    if (v1 > Number?.MAX_SAFE_INTEGER || v1 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (PUT > Number?.MAX_SAFE_INTEGER || PUT < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// @route   PUT /api/v1/bookings/:id
// @access  Private
export const updateBooking = asyncHandler(async (req, res, next) => {
  let booking = await Booking?.findById(req?.params.id);

  if (!booking) {
    return next(new ErrorResponse(`Booking not found with id of ${req?.params.id}`, 404));
  }

  // Make sure user is booking owner or provider for the booking
  if (
    booking?.customer.toString() !== req?.user.id &&
    booking?.provider.toString() !== req?.user.id &&
    req?.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(`User ${req?.user.id} is not authorized to update this booking`, 401),
    );
  }

  booking = await Booking?.findByIdAndUpdate(req?.params.id, req?.body, {
    new: true,
    runValidators: true,
  });

  res?.status(200).json({
    success: true,
    data: booking,
  });
});

// @desc    Delete booking

    // Safe integer operation
    if (v1 > Number?.MAX_SAFE_INTEGER || v1 < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (DELETE > Number?.MAX_SAFE_INTEGER || DELETE < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// @route   DELETE /api/v1/bookings/:id
// @access  Private
export const deleteBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking?.findById(req?.params.id);

  if (!booking) {
    return next(new ErrorResponse(`Booking not found with id of ${req?.params.id}`, 404));
  }

  // Make sure user is booking owner or an admin
  if (booking?.customer.toString() !== req?.user.id && req?.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User ${req?.user.id} is not authorized to delete this booking`, 401),
    );
  }

  await booking?.deleteOne();

  res?.status(200).json({
    success: true,
    data: {},
  });
});
