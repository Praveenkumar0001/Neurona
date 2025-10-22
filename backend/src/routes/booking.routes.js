// src/routes/booking.routes.js (ESM)
import express from 'express';
import { body } from 'express-validator';
import * as bookingController from '../controllers/bookingController.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/roleCheck.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/bookings
 * @desc    Create new booking
 * @access  Private/Patient
 */
router.post(
  '/',
  authenticate,
  checkRole('patient'),
  [
    body('doctorId').notEmpty().withMessage('Doctor ID is required'),
    body('bookingDate').notEmpty().isISO8601().withMessage('Valid booking date is required'),
    body('bookingTime')
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage('Booking time must be in HH:MM format'),
  ],
  validate,
  bookingController.createBooking
);

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings for logged-in user
 * @access  Private
 */
router.get('/', authenticate, bookingController.getMyBookings);

/**
 * @route   GET /api/bookings/stats
 * @desc    Get booking statistics
 * @access  Private
 * @note    Must be before "/:id" or it will be treated as id="stats"
 */
router.get('/stats', authenticate, bookingController.getBookingStats);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID
 * @access  Private
 */
router.get('/:id', authenticate, bookingController.getBookingById);

/**
 * @route   PUT /api/bookings/:id/status
 * @desc    Update booking status
 * @access  Private
 */
router.put(
  '/:id/status',
  authenticate,
  [
    body('status')
      .isIn(['confirmed', 'completed', 'cancelled', 'rescheduled', 'no-show'])
      .withMessage('Invalid status'),
    body('cancellationReason').optional().trim(),
  ],
  validate,
  bookingController.updateBookingStatus
);

/**
 * @route   PUT /api/bookings/:id/reschedule
 * @desc    Reschedule booking
 * @access  Private/Patient
 */
router.put(
  '/:id/reschedule',
  authenticate,
  checkRole('patient'),
  [
    body('newDate').notEmpty().isISO8601().withMessage('Valid new date is required'),
    body('newTime')
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage('New time must be in HH:MM format'),
  ],
  validate,
  bookingController.rescheduleBooking
);

/**
 * @route   PUT /api/bookings/:id/prescription
 * @desc    Add prescription to booking
 * @access  Private/Doctor
 */
router.put(
  '/:id/prescription',
  authenticate,
  checkRole('doctor'),
  [
    body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required'),
    body('medications').isArray().withMessage('Medications must be an array'),
    body('advice').trim().notEmpty().withMessage('Advice is required'),
  ],
  validate,
  bookingController.addPrescription
);

/**
 * @route   PUT /api/bookings/:id/notes
 * @desc    Add doctor notes
 * @access  Private/Doctor
 */
router.put(
  '/:id/notes',
  authenticate,
  checkRole('doctor'),
  [body('doctorNotes').trim().notEmpty().withMessage('Notes are required')],
  validate,
  bookingController.addDoctorNotes
);

export default router;
