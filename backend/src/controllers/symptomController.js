// src/controllers/symptomController.js (ESM)
import SymptomReport from '../models/SymptomReport.js';
import User from '../models/User.js';
import { analyzeSymptoms } from '../utils/aiLogic.js';
import { generateReportPDF, deletePDF } from '../utils/pdfGenerator.js';
import { catchAsync, NotFoundError, BadRequestError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * @desc    Submit symptom assessment
 * @route   POST /api/symptoms/submit
 * @access  Private/Patient
 */
export const submitSymptoms = catchAsync(async (req, res) => {
  const { responses } = req.body;
  const patientId = req.userId;

  if (!responses) {
    throw new BadRequestError('Symptom responses are required');
  }

  // Get patient info
  const patient = await User.findById(patientId);
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  // Analyze symptoms using AI logic
  const analysis = analyzeSymptoms(responses);

  // Create report
  const report = await SymptomReport.create({
    patientId,
    responses,
    analysis,
  });

  // Generate PDF (async fire-and-forget)
  generateReportPDF(report, patient)
    .then(({ filePath, fileName }) => {
      report.pdfPath = filePath;
      report.pdfFileName = fileName;
      return report.save();
    })
    .catch((err) => {
      logger.error('PDF generation failed', { error: err.message, reportId: report._id });
    });

  logger.info('Symptom assessment completed', { reportId: report._id, patientId });

  res.status(201).json({
    success: true,
    message: 'Assessment completed successfully',
    report: {
      id: report._id,
      analysis: report.analysis,
      createdAt: report.createdAt,
      pdfUrl: `/api/reports/${report._id}/pdf`,
    },
  });
});

/**
 * @desc    Get my symptom reports
 * @route   GET /api/symptoms/my-reports
 * @access  Private/Patient
 */
export const getMyReports = catchAsync(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    SymptomReport.find({ patientId: req.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip),
    SymptomReport.countDocuments({ patientId: req.userId }),
  ]);

  res.json({
    success: true,
    reports,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReports: total,
      limit,
    },
  });
});

/**
 * @desc    Get report by ID
 * @route   GET /api/symptoms/reports/:id
 * @access  Private
 */
export const getReportById = catchAsync(async (req, res) => {
  const report = await SymptomReport.findById(req.params.id).populate(
    'patientId',
    'profile.name email phone'
  );

  if (!report) {
    throw new NotFoundError('Report not found');
  }

  // Check authorization (patient or shared doctor)
  const isPatient = report.patientId?._id?.toString() === req.userId;
  const isSharedDoctor = Array.isArray(report.sharedWith)
    ? report.sharedWith.some((doctorId) => doctorId?.toString() === req.userId)
    : false;

  if (!isPatient && !isSharedDoctor) {
    throw new BadRequestError('You are not authorized to view this report');
  }

  res.json({
    success: true,
    report,
  });
});

/**
 * @desc    Delete symptom report
 * @route   DELETE /api/symptoms/reports/:id
 * @access  Private/Patient
 */
export const deleteReport = catchAsync(async (req, res) => {
  const report = await SymptomReport.findById(req.params.id);
  if (!report) {
    throw new NotFoundError('Report not found');
  }

  // Check authorization
  if (report.patientId.toString() !== req.userId) {
    throw new BadRequestError('You are not authorized to delete this report');
  }

  // Delete PDF file if exists
  if (report.pdfPath) {
    try {
      deletePDF(report.pdfPath);
    } catch (e) {
      // non-fatal
      logger.warn('Failed to delete report PDF from disk', {
        reportId: report._id,
        pdfPath: report.pdfPath,
        error: e.message,
      });
    }
  }

  await report.deleteOne();

  logger.info('Report deleted', { reportId: report._id, patientId: req.userId });

  res.json({
    success: true,
    message: 'Report deleted successfully',
  });
});

/**
 * @desc    Get latest report
 * @route   GET /api/symptoms/latest
 * @access  Private/Patient
 */
export const getLatestReport = catchAsync(async (req, res) => {
  const report = await SymptomReport.findOne({ patientId: req.userId }).sort({
    createdAt: -1,
  });

  if (!report) {
    return res.json({
      success: true,
      report: null,
      message: 'No reports found',
    });
  }

  res.json({
    success: true,
    report,
  });
});
