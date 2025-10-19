const express = require('express');
const { body } = require('express-validator');
const symptomController = require('../controllers/symptomController');
const { authenticate } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/roleCheck.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * @route   POST /api/symptoms/submit
 * @desc    Submit symptom assessment
 * @access  Private/Patient
 */
router.post('/submit', authenticate, checkRole('patient'), [
  body('responses')
    .notEmpty()
    .withMessage('Symptom responses are required'),
  body('responses.mood')
    .isIn(['happy', 'neutral', 'sad', 'anxious', 'depressed', 'hopeless'])
    .withMessage('Invalid mood value'),
  body('responses.energy')
    .isInt({ min: 1, max: 5 })
    .withMessage('Energy must be between 1 and 5'),
  body('responses.anxiety')
    .isInt({ min: 1, max: 5 })
    .withMessage('Anxiety must be between 1 and 5')
], validate, symptomController.submitSymptoms);

/**
 * @route   GET /api/symptoms/my-reports
 * @desc    Get my symptom reports
 * @access  Private/Patient
 */
router.get('/my-reports', authenticate, checkRole('patient'), symptomController.getMyReports);

/**
 * @route   GET /api/symptoms/latest
 * @desc    Get latest symptom report
 * @access  Private/Patient
 */
router.get('/latest', authenticate, checkRole('patient'), symptomController.getLatestReport);

/**
 * @route   GET /api/symptoms/reports/:id
 * @desc    Get report by ID
 * @access  Private
 */
router.get('/reports/:id', authenticate, symptomController.getReportById);

/**
 * @route   DELETE /api/symptoms/reports/:id
 * @desc    Delete symptom report
 * @access  Private/Patient
 */
router.delete('/reports/:id', authenticate, checkRole('patient'), symptomController.deleteReport);

module.exports = router;