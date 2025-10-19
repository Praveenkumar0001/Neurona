const express = require('express');
const { body } = require('express-validator');
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/roleCheck.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * @route   GET /api/reports/:id/pdf
 * @desc    Download report PDF
 * @access  Private
 */
router.get('/:id/pdf', authenticate, reportController.downloadReportPDF);

/**
 * @route   POST /api/reports/:id/regenerate
 * @desc    Regenerate report PDF
 * @access  Private/Patient
 */
router.post('/:id/regenerate', authenticate, checkRole('patient'), reportController.regenerateReportPDF);

/**
 * @route   POST /api/reports/:id/share
 * @desc    Share report with doctor
 * @access  Private/Patient
 */
router.post('/:id/share', authenticate, checkRole('patient'), [
  body('doctorId')
    .notEmpty()
    .withMessage('Doctor ID is required')
], validate, reportController.shareReportWithDoctor);

/**
 * @route   GET /api/reports/shared
 * @desc    Get reports shared with doctor
 * @access  Private/Doctor
 */
router.get('/shared', authenticate, checkRole('doctor'), reportController.getSharedReports);

module.exports = router;