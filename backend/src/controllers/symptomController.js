const SymptomReport = require('../models/SymptomReport');
const User = require('../models/User');
const { analyzeSymptoms } = require('../utils/aiLogic');
const { generateReportPDF } = require('../utils/pdfGenerator');
const { catchAsync, NotFoundError, BadRequestError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * @desc    Submit symptom assessment
 * @route   POST /api/symptoms/submit
 * @access  Private/Patient
 */
exports.submitSymptoms = catchAsync(async (req, res) => {
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
    analysis
  });
  
  // Generate PDF in background
  generateReportPDF(report, patient)
    .then(({ filePath, fileName }) => {
      report.pdfPath = filePath;
      report.pdfFileName = fileName;
      return report.save();
    })
    .catch(err => {
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
      pdfUrl: `/api/reports/${report._id}/pdf`
    }
  });
});

/**
 * @desc    Get my symptom reports
 * @route   GET /api/symptoms/my-reports
 * @access  Private/Patient
 */
exports.getMyReports = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  
  const reports = await SymptomReport.find({ 
    patientId: req.userId 
  })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);
  
  const total = await SymptomReport.countDocuments({ patientId: req.userId });
  
  res.json({
    success: true,
    reports,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalReports: total,
      limit: parseInt(limit)
    }
  });
});

/**
 * @desc    Get report by ID
 * @route   GET /api/symptoms/reports/:id
 * @access  Private
 */
exports.getReportById = catchAsync(async (req, res) => {
  const report = await SymptomReport.findById(req.params.id)
    .populate('patientId', 'profile.name email phone');
  
  if (!report) {
    throw new NotFoundError('Report not found');
  }
  
  // Check authorization (patient or shared doctor)
  const isPatient = report.patientId._id.toString() === req.userId;
  const isSharedDoctor = report.sharedWith.some(
    doctorId => doctorId.toString() === req.userId
  );
  
  if (!isPatient && !isSharedDoctor) {
    throw new BadRequestError('You are not authorized to view this report');
  }
  
  res.json({
    success: true,
    report
  });
});

/**
 * @desc    Delete symptom report
 * @route   DELETE /api/symptoms/reports/:id
 * @access  Private/Patient
 */
exports.deleteReport = catchAsync(async (req, res) => {
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
    const { deletePDF } = require('../utils/pdfGenerator');
    deletePDF(report.pdfPath);
  }
  
  await report.remove();
  
  logger.info('Report deleted', { reportId: report._id, patientId: req.userId });
  
  res.json({
    success: true,
    message: 'Report deleted successfully'
  });
});

/**
 * @desc    Get latest report
 * @route   GET /api/symptoms/latest
 * @access  Private/Patient
 */
exports.getLatestReport = catchAsync(async (req, res) => {
  const report = await SymptomReport.findOne({ 
    patientId: req.userId 
  }).sort({ createdAt: -1 });
  
  if (!report) {
    return res.json({
      success: true,
      report: null,
      message: 'No reports found'
    });
  }
  
  res.json({
    success: true,
    report
  });
});