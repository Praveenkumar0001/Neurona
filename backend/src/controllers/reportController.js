const SymptomReport = require('../models/SymptomReport');
const Doctor = require('../models/Doctor');
const { catchAsync, NotFoundError, BadRequestError } = require('../utils/errorHandler');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

/**
 * @desc    Download report PDF
 * @route   GET /api/reports/:id/pdf
 * @access  Private
 */
exports.downloadReportPDF = catchAsync(async (req, res) => {
  const report = await SymptomReport.findById(req.params.id);
  
  if (!report) {
    throw new NotFoundError('Report not found');
  }
  
  // Check authorization
  const isPatient = report.patientId.toString() === req.userId;
  
  // Check if user is a doctor who has access
  const doctor = await Doctor.findOne({ userId: req.userId });
  const isSharedDoctor = doctor && report.sharedWith.some(
    doctorId => doctorId.toString() === doctor._id.toString()
  );
  
  if (!isPatient && !isSharedDoctor) {
    throw new BadRequestError('You are not authorized to download this report');
  }
  
  // Check if PDF exists
  if (!report.pdfPath || !fs.existsSync(report.pdfPath)) {
    throw new NotFoundError('PDF file not found. Please regenerate the report.');
  }
  
  logger.info('Report PDF downloaded', { reportId: report._id, userId: req.userId });
  
  // Send file
  res.download(report.pdfPath, report.pdfFileName, (err) => {
    if (err) {
      logger.error('PDF download error', { error: err.message, reportId: report._id });
      throw new Error('Error downloading PDF');
    }
  });
});

/**
 * @desc    Share report with doctor
 * @route   POST /api/reports/:id/share
 * @access  Private/Patient
 */
exports.shareReportWithDoctor = catchAsync(async (req, res) => {
  const { doctorId } = req.body;
  const report = await SymptomReport.findById(req.params.id);
  
  if (!report) {
    throw new NotFoundError('Report not found');
  }
  
  // Check authorization
  if (report.patientId.toString() !== req.userId) {
    throw new BadRequestError('You are not authorized to share this report');
  }
  
  // Verify doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }
  
  // Add doctor to sharedWith if not already shared
  if (!report.sharedWith.includes(doctorId)) {
    report.sharedWith.push(doctorId);
    await report.save();
  }
  
  logger.info('Report shared with doctor', { reportId: report._id, doctorId });
  
  res.json({
    success: true,
    message: 'Report shared successfully with doctor'
  });
});

/**
 * @desc    Get reports shared with doctor
 * @route   GET /api/reports/shared
 * @access  Private/Doctor
 */
exports.getSharedReports = catchAsync(async (req, res) => {
  // Get doctor profile
  const doctor = await Doctor.findOne({ userId: req.userId });
  
  if (!doctor) {
    throw new NotFoundError('Doctor profile not found');
  }
  
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  
  const reports = await SymptomReport.find({
    sharedWith: doctor._id
  })
    .populate('patientId', 'profile.name email phone profile.age profile.gender')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);
  
  const total = await SymptomReport.countDocuments({ sharedWith: doctor._id });
  
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
 * @desc    Regenerate report PDF
 * @route   POST /api/reports/:id/regenerate
 * @access  Private
 */
exports.regenerateReportPDF = catchAsync(async (req, res) => {
  const report = await SymptomReport.findById(req.params.id);
  
  if (!report) {
    throw new NotFoundError('Report not found');
  }
  
  // Check authorization
  if (report.patientId.toString() !== req.userId) {
    throw new BadRequestError('You are not authorized to regenerate this report');
  }
  
  const User = require('../models/User');
  const patient = await User.findById(report.patientId);
  
  const { generateReportPDF, deletePDF } = require('../utils/pdfGenerator');
  
  // Delete old PDF if exists
  if (report.pdfPath) {
    deletePDF(report.pdfPath);
  }
  
  // Generate new PDF
  const { filePath, fileName } = await generateReportPDF(report, patient);
  
  report.pdfPath = filePath;
  report.pdfFileName = fileName;
  await report.save();
  
  logger.info('Report PDF regenerated', { reportId: report._id });
  
  res.json({
    success: true,
    message: 'Report PDF regenerated successfully',
    pdfUrl: `/api/reports/${report._id}/pdf`
  });
});