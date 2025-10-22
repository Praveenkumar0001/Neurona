// src/routes/doctor.routes.js  (ESM)
import express from 'express';
import { body } from 'express-validator';

// namespace imports interop with both CJS and ESM
import * as doctorController from '../controllers/doctorController.js';
import * as auth from '../middleware/auth.middleware.js';
import * as role from '../middleware/roleCheck.middleware.js';
import * as validation from '../middleware/validation.middleware.js';
// If you actually use uploads here, keep it. Otherwise remove the import.
// import * as upload from '../middleware/upload.middleware.js';

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
router.post(
  '/',
  auth.authenticate,
  role.checkRole('doctor'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('specialty')
      .isIn(['psychiatrist', 'therapist', 'counselor', 'psychologist'])
      .withMessage('Invalid specialty'),
    body('experience').isInt({ min: 0 }).withMessage('Experience must be a positive number'),
    body('fee').isFloat({ min: 0 }).withMessage('Fee must be a positive number'),
    body('qualification').trim().notEmpty().withMessage('Qualification is required'),
    body('registrationNumber').trim().notEmpty().withMessage('Registration number is required'),
  ],
  validation.validate,
  doctorController.createDoctorProfile
);

/**
 * @route   PUT /api/doctors/:id
 * @desc    Update doctor profile
 * @access  Private/Doctor
 */
router.put(
  '/:id',
  auth.authenticate,
  role.checkRole('doctor'),
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio cannot exceed 1000 characters'),
    body('fee').optional().isFloat({ min: 0 }).withMessage('Fee must be a positive number'),
  ],
  validation.validate,
  doctorController.updateDoctorProfile
);

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
router.put(
  '/:id/availability',
  auth.authenticate,
  role.checkRole('doctor'),
  [body('availability').notEmpty().withMessage('Availability data is required')],
  validation.validate,
  doctorController.updateAvailability
);

/**
 * @route   GET /api/doctors/:id/stats
 * @desc    Get doctor statistics
 * @access  Private/Doctor
 */
router.get('/:id/stats', auth.authenticate, role.checkRole('doctor'), doctorController.getDoctorStats);

/**
 * @route   PUT /api/doctors/:id/toggle-status
 * @desc    Toggle doctor active status
 * @access  Private/Doctor
 */
router.put('/:id/toggle-status', auth.authenticate, role.checkRole('doctor'), doctorController.toggleDoctorStatus);

export default router; // <-- crucial for ESM import default
