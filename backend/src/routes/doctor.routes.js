const express = require('express');
const { body } = require('express-validator');
const doctorController = require('../controllers/doctorController');
const { authenticate } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/roleCheck.middleware');
const { validate } = require('../middleware/validation.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

const router = express.Router();

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors
 * @access  Public
 */
router.get('/', doctorController.getAllDoctors);

/**
 * @route   GET /api/doctors/:id
 * @desc    Get doctor by ID
 * @access  Public
 */
router.get('/:id', doctorController.getDoctorById);

/**
 * @route   POST /api/doctors
 * @desc    Create doctor profile
 * @access  Private/Doctor
 */
router.post('/', authenticate, checkRole('doctor'), [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('specialty')
    .isIn(['psychiatrist', 'therapist', 'counselor', 'psychologist'])
    .withMessage('Invalid specialty'),
  body('experience')
    .isInt({ min: 0 })
    .withMessage('Experience must be a positive number'),
  body('fee')
    .isFloat({ min: 0 })
    .withMessage('Fee must be a positive number'),
  body('qualification')
    .trim()
    .notEmpty()
    .withMessage('Qualification is required'),
  body('registrationNumber')
    .trim()
    .notEmpty()
    .withMessage('Registration number is required')
], validate, doctorController.createDoctorProfile);

/**
 * @route   PUT /api/doctors/:id
 * @desc    Update doctor profile
 * @access  Private/Doctor
 */
router.put('/:id', authenticate, checkRole('doctor'), [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters'),
  body('fee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fee must be a positive number')
], validate, doctorController.updateDoctorProfile);

/**
 * @route   GET /api/doctors/:id/availability
 * @desc    Get doctor availability
 * @access  Public
 */
router.get('/:id/availability', doctorController.getDoctorAvailability);

/**
 * @route   PUT /api/doctors/:id/availability
 * @desc    Update doctor availability
 * @access  Private/Doctor
 */
router.put('/:id/availability', authenticate, checkRole('doctor'), [
  body('availability')
    .notEmpty()
    .withMessage('Availability data is required')
], validate, doctorController.updateAvailability);

/**
 * @route   GET /api/doctors/:id/stats
 * @desc    Get doctor statistics
 * @access  Private/Doctor
 */
router.get('/:id/stats', authenticate, checkRole('doctor'), doctorController.getDoctorStats);

/**
 * @route   PUT /api/doctors/:id/toggle-status
 * @desc    Toggle doctor active status
 * @access  Private/Doctor
 */
router.put('/:id/toggle-status', authenticate, checkRole('doctor'), doctorController.toggleDoctorStatus);

module.exports = router;