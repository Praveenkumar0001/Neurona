// src/controllers/reviewController.js (ESM)
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Doctor from '../models/Doctor.js';
import { catchAsync, NotFoundError, BadRequestError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';
import mongoose from 'mongoose';

/**
 * @desc    Create review for doctor
 * @route   POST /api/reviews
 * @access  Private/Patient
 */
export const createReview = catchAsync(async (req, res) => {
  const { doctorId, bookingId, rating, review, isAnonymous } = req.body;
  const patientId = req.userId;

  if (!doctorId || !bookingId || rating == null) {
    throw new BadRequestError('Doctor ID, booking ID, and rating are required');
  }
  const numericRating = Number(rating);
  if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new BadRequestError('Rating must be between 1 and 5');
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new NotFoundError('Booking not found');
  if (booking.patientId.toString() !== patientId) {
    throw new BadRequestError('You can only review your own bookings');
  }
  if (booking.status !== 'completed') {
    throw new BadRequestError('You can only review completed appointments');
  }

  const existingReview = await Review.findOne({ bookingId });
  if (existingReview) {
    throw new BadRequestError('You have already reviewed this appointment');
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new NotFoundError('Doctor not found');

  const newReview = await Review.create({
    doctorId,
    patientId,
    bookingId,
    rating: numericRating,
    review: review || '',
    isAnonymous: Boolean(isAnonymous),
    isVerified: true,
  });

  logger.info('Review created', { reviewId: newReview._id, doctorId, patientId });

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    review: newReview,
  });
});

/**
 * @desc    Get reviews for a doctor
 * @route   GET /api/reviews/doctor/:doctorId
 * @access  Public
 */
export const getDoctorReviews = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  const reviews = await Review.find({ doctorId: req.params.doctorId })
    .populate('patientId', 'profile.name profile.avatar')
    .sort(sort)
    .limit(limitNum)
    .skip(skip);

  const total = await Review.countDocuments({ doctorId: req.params.doctorId });

  // Rating distribution
  const ratingDistribution = await Review.aggregate([
    { $match: { doctorId: new mongoose.Types.ObjectId(req.params.doctorId) } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  res.json({
    success: true,
    reviews,
    ratingDistribution,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalReviews: total,
      limit: limitNum,
    },
  });
});

/**
 * @desc    Get my reviews (as patient)
 * @route   GET /api/reviews/my-reviews
 * @access  Private/Patient
 */
export const getMyReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ patientId: req.userId })
    .populate('doctorId', 'name specialty profileImage')
    .populate('bookingId', 'bookingDate bookingTime')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    reviews,
  });
});

/**
 * @desc    Update review
 * @route   PUT /api/reviews/:id
 * @access  Private/Patient
 */
export const updateReview = catchAsync(async (req, res) => {
  const { rating, review, isAnonymous } = req.body;

  const existingReview = await Review.findById(req.params.id);
  if (!existingReview) throw new NotFoundError('Review not found');

  if (existingReview.patientId.toString() !== req.userId) {
    throw new BadRequestError('You can only update your own reviews');
  }

  if (rating != null) {
    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      throw new BadRequestError('Rating must be between 1 and 5');
    }
    existingReview.rating = numericRating;
  }
  if (review !== undefined) existingReview.review = review;
  if (isAnonymous !== undefined) existingReview.isAnonymous = Boolean(isAnonymous);

  await existingReview.save();

  logger.info('Review updated', { reviewId: existingReview._id });

  res.json({
    success: true,
    message: 'Review updated successfully',
    review: existingReview,
  });
});

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private/Patient
 */
export const deleteReview = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new NotFoundError('Review not found');

  if (review.patientId.toString() !== req.userId) {
    throw new BadRequestError('You can only delete your own reviews');
  }

  // prefer deleteOne to deprecated remove
  await Review.deleteOne({ _id: review._id });

  logger.info('Review deleted', { reviewId: review._id });

  res.json({
    success: true,
    message: 'Review deleted successfully',
  });
});

/**
 * @desc    Mark review as helpful
 * @route   PUT /api/reviews/:id/helpful
 * @access  Private
 */
export const markReviewHelpful = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new NotFoundError('Review not found');

  review.helpful += 1;
  await review.save();

  res.json({
    success: true,
    message: 'Thank you for your feedback',
    helpful: review.helpful,
  });
});
