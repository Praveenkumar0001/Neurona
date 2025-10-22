// src/routes/symptom.routes.js  (ESM)
import express from 'express';
import { body } from 'express-validator';

// Namespace imports interop with CJS or ESM controllers/middlewares
import * as symptomController from '../controllers/symptomController.js';
import * as auth from '../middleware/auth.middleware.js';
import * as role from '../middleware/roleCheck.middleware.js';
import * as validation from '../middleware/validation.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/symptoms/submit
 * @desc    Submit symptom assessment
 * @access  Private/Patient
 */
router.post(
  '/submit',
  auth.authenticate,
  role.checkRole('patient'),
  [
    body('responses').notEmpty().withMessage('Symptom responses are required'),
    body('responses.mood')
      .isIn(['happy', 'neutral', 'sad', 'anxious', 'depressed', 'hopeless'])
      .withMessage('Invalid mood value'),
    body('responses.energy')
      .isInt({ min: 1, max: 5 })
      .withMessage('Energy must be between 1 and 5'),
    body('responses.anxiety')
      .isInt({ min: 1, max: 5 })
      .withMessage('Anxiety must be between 1 and 5'),
  ],
  validation.validate,
  symptomController.submitSymptoms
);

/**
 * @route   GET /api/symptoms/my-reports
 * @desc    Get my symptom reports
 * @access  Private/Patient
 */
router.get('/my-reports', auth.authenticate, role.checkRole('patient'), symptomController.getMyReports);

/**
 * @route   GET /api/symptoms/latest
 * @desc    Get latest symptom report
 * @access  Private/Patient
 */
router.get('/latest', auth.authenticate, role.checkRole('patient'), symptomController.getLatestReport);

/**
 * @route   GET /api/symptoms/reports/:id
 * @desc    Get report by ID
 * @access  Private
 */
router.get('/reports/:id', auth.authenticate, symptomController.getReportById);

/**
 * @route   DELETE /api/symptoms/reports/:id
 * @desc    Delete symptom report
 * @access  Private/Patient
 */
router.delete('/reports/:id', auth.authenticate, role.checkRole('patient'), symptomController.deleteReport);

export default router;
