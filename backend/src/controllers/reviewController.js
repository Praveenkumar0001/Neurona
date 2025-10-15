const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Doctor = require('../models/Doctor');
const { catchAsync, NotFoundError, BadRequestError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * @desc    Create review for doctor
 * @route   POST /api/reviews
 * @access  Private/Patient
 */
exports.createReview = catchAsync(async (req, res) => {
  const { doctorId, bookingId, rating, review, isAnonymous } = req.body;
  const patientId = req.userId;
  
  // Validate required fields
  if (!doctorId || !bookingId || !rating) {
    throw new BadRequestError('Doctor ID, booking ID, and rating are required');
  }
  
  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new BadRequestError('Rating must be between 1 and 5');
  }
  
  // Check if booking exists and is completed
  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    throw new NotFoundError('Booking not found');
  }
  
  if (booking.patientId.toString() !== patientId) {
    throw new BadRequestError('You can only review your own bookings');
  }
  
  if (booking.status !== 'completed') {
    throw new BadRequestError('You can only review completed appointments');
  }
  
  // Check if review already exists for this booking
  const existingReview = await Review.findOne({ bookingId });
  
  if (existingReview) {
    throw new BadRequestError('You have already reviewed this appointment');
  }
  
  // Verify doctor
  const doctor = await Doctor.findById(doctorId);
  
  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }
  
  // Create review
  const newReview = await Review.create({
    doctorId,
    patientId,
    bookingId,
    rating,
    review: review || '',
    isAnonymous: isAnonymous || false,
    isVerified: true
  });
  
  logger.info('Review created', { reviewId: newReview._id, doctorId, patientId });
  
  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    review: newReview
  });
});

/**
 * @desc    Get reviews for a doctor
 * @route   GET /api/reviews/doctor/:doctorId
 * @access  Public
 */
exports.getDoctorReviews = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
  const skip = (page - 1) * limit;
  
  const reviews = await Review.find({ doctorId: req.params.doctorId })
    .populate('patientId', 'profile.name profile.avatar')
    .sort(sort)
    .limit(parseInt(limit))
    .skip(skip);
  
  const total = await Review.countDocuments({ doctorId: req.params.doctorId });
  
  // Calculate rating distribution
  const ratingDistribution = await Review.aggregate([
    { $match: { doctorId: require('mongoose').Types.ObjectId(req.params.doctorId) } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);
  
  res.json({
    success: true,
    reviews,
    ratingDistribution,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalReviews: total,
      limit: parseInt(limit)
    }
  });
});

/**
 * @desc    Get my reviews (as patient)
 * @route   GET /api/reviews/my-reviews
 * @access  Private/Patient
 */
exports.getMyReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ patientId: req.userId })
    .populate('doctorId', 'name specialty profileImage')
    .populate('bookingId', 'bookingDate bookingTime')
    .sort({ createdAt: -1 });
  
  res.json({
    success: true,
    reviews
  });
});

/**
 * @desc    Update review
 * @route   PUT /api/reviews/:id
 * @access  Private/Patient
 */
exports.updateReview = catchAsync(async (req, res) => {
  const { rating, review, isAnonymous } = req.body;
  
  const existingReview = await Review.findById(req.params.id);
  
  if (!existingReview) {
    throw new NotFoundError('Review not found');
  }
  
  // Check authorization
  if (existingReview.patientId.toString() !== req.userId) {
    throw new BadRequestError('You can only update your own reviews');
  }
  
  // Update fields
  if (rating) existingReview.rating = rating;
  if (review !== undefined) existingReview.review = review;
  if (isAnonymous !== undefined) existingReview.isAnonymous = isAnonymous;
  
  await existingReview.save();
  
  logger.info('Review updated', { reviewId: existingReview._id });
  
  res.json({
    success: true,
    message: 'Review updated successfully',
    review: existingReview
  });
});

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private/Patient
 */
exports.deleteReview = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    throw new NotFoundError('Review not found');
  }
  
  // Check authorization
  if (review.patientId.toString() !== req.userId) {
    throw new BadRequestError('You can only delete your own reviews');
  }
  
  await review.remove();
  
  logger.info('Review deleted', { reviewId: review._id });
  
  res.json({
    success: true,
    message: 'Review deleted successfully'
  });
});

/**
 * @desc    Mark review as helpful
 * @route   PUT /api/reviews/:id/helpful
 * @access  Private
 */
exports.markReviewHelpful = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    throw new NotFoundError('Review not found');
  }
  
  review.helpful += 1;
  await review.save();
  
  res.json({
    success: true,
    message: 'Thank you for your feedback',
    helpful: review.helpful
  });
});