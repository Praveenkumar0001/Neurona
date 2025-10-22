// src/routes/report.routes.js  (ESM)
import express from 'express';
import { body } from 'express-validator';

// namespace imports interop with both CJS and ESM modules
import * as reportController from '../controllers/reportController.js';
import * as auth from '../middleware/auth.middleware.js';
import * as role from '../middleware/roleCheck.middleware.js';
import * as validation from '../middleware/validation.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/reports/:id/pdf
 * @desc    Download report PDF
 * @access  Private
 */
router.get('/:id/pdf', auth.authenticate, reportController.downloadReportPDF);

/**
 * @route   POST /api/reports/:id/regenerate
 * @desc    Regenerate report PDF
 * @access  Private/Patient
 */
router.post(
  '/:id/regenerate',
  auth.authenticate,
  role.checkRole('patient'),
  reportController.regenerateReportPDF
);

/**
 * @route   POST /api/reports/:id/share
 * @desc    Share report with doctor
 * @access  Private/Patient
 */
router.post(
  '/:id/share',
  auth.authenticate,
  role.checkRole('patient'),
  [body('doctorId').notEmpty().withMessage('Doctor ID is required')],
  validation.validate,
  reportController.shareReportWithDoctor
);

/**
 * @route   GET /api/reports/shared
 * @desc    Get reports shared with doctor
 * @access  Private/Doctor
 */
router.get('/shared', auth.authenticate, role.checkRole('doctor'), reportController.getSharedReports);

export default router; // 👈 critical for: import reportRoutes from './routes/report.routes.js';
