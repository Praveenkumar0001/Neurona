// src/routes/review.routes.js  (ESM)
import express from 'express';
import { body } from 'express-validator';

// Namespace imports interop with both CJS and ESM modules
import * as reviewController from '../controllers/reviewController.js';
import * as auth from '../middleware/auth.middleware.js';
import * as role from '../middleware/roleCheck.middleware.js';
import * as validation from '../middleware/validation.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/reviews
 * @desc    Create review for doctor
 * @access  Private/Patient
 */
router.post(
  '/',
  auth.authenticate,
  role.checkRole('patient'),
  [
    body('doctorId').notEmpty().withMessage('Doctor ID is required'),
    body('bookingId').notEmpty().withMessage('Booking ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('review').optional().trim().isLength({ max: 500 }).withMessage('Review cannot exceed 500 characters'),
  ],
  validation.validate,
  reviewController.createReview
);

/**
 * @route   GET /api/reviews/doctor/:doctorId
 * @desc    Get reviews for a doctor
 * @access  Public
 */
router.get('/doctor/:doctorId', reviewController.getDoctorReviews);

/**
 * @route   GET /api/reviews/my-reviews
 * @desc    Get my reviews (as patient)
 * @access  Private/Patient
 */
router.get('/my-reviews', auth.authenticate, role.checkRole('patient'), reviewController.getMyReviews);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update review
 * @access  Private/Patient
 */
router.put(
  '/:id',
  auth.authenticate,
  role.checkRole('patient'),
  [
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('review').optional().trim().isLength({ max: 500 }).withMessage('Review cannot exceed 500 characters'),
  ],
  validation.validate,
  reviewController.updateReview
);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete review
 * @access  Private/Patient
 */
router.delete('/:id', auth.authenticate, role.checkRole('patient'), reviewController.deleteReview);

/**
 * @route   PUT /api/reviews/:id/helpful
 * @desc    Mark review as helpful
 * @access  Private
 */
router.put('/:id/helpful', auth.authenticate, reviewController.markReviewHelpful);

export default router; // <-- critical for ESM default import
