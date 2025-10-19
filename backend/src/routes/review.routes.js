const express = require('express');
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/roleCheck.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * @route   POST /api/reviews
 * @desc    Create review for doctor
 * @access  Private/Patient
 */
router.post('/', authenticate, checkRole('patient'), [
  body('doctorId')
    .notEmpty()
    .withMessage('Doctor ID is required'),
  body('bookingId')
    .notEmpty()
    .withMessage('Booking ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review cannot exceed 500 characters')
], validate, reviewController.createReview);

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
router.get('/my-reviews', authenticate, checkRole('patient'), reviewController.getMyReviews);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update review
 * @access  Private/Patient
 */
router.put('/:id', authenticate, checkRole('patient'), [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review cannot exceed 500 characters')
], validate, reviewController.updateReview);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete review
 * @access  Private/Patient
 */
router.delete('/:id', authenticate, checkRole('patient'), reviewController.deleteReview);

/**
 * @route   PUT /api/reviews/:id/helpful
 * @desc    Mark review as helpful
 * @access  Private
 */
router.put('/:id/helpful', authenticate, reviewController.markReviewHelpful);

module.exports = router;