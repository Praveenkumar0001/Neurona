// src/controllers/reportController.js (ESM)
import fs from 'fs';
import path from 'path';
import SymptomReport from '../models/SymptomReport.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { catchAsync, NotFoundError, BadRequestError } from '../utils/errorHandler.js';
import { generateReportPDF, deletePDF } from '../utils/pdfGenerator.js';
import logger from '../utils/logger.js';

/**
 * @desc    Download report PDF
 * @route   GET /api/reports/:id/pdf
 * @access  Private
 */
export const downloadReportPDF = catchAsync(async (req, res) => {
  const report = await SymptomReport.findById(req.params.id);
  if (!report) throw new NotFoundError('Report not found');

  // Auth: patient or shared doctor
  const isPatient = report.patientId.toString() === req.userId;

  const doctor = await Doctor.findOne({ userId: req.userId });
  const isSharedDoctor =
    !!doctor &&
    Array.isArray(report.sharedWith) &&
    report.sharedWith.some((dId) => dId.toString() === doctor._id.toString());

  if (!isPatient && !isSharedDoctor) {
    throw new BadRequestError('You are not authorized to download this report');
  }

  if (!report.pdfPath || !fs.existsSync(report.pdfPath)) {
    throw new NotFoundError('PDF file not found. Please regenerate the report.');
  }

  logger.info('Report PDF downloaded', { reportId: report._id, userId: req.userId });

  res.download(report.pdfPath, report.pdfFileName, (err) => {
    if (err) {
      logger.error('PDF download error', { error: err.message, reportId: report._id });
    }
  });
});

/**
 * @desc    Share report with doctor
 * @route   POST /api/reports/:id/share
 * @access  Private/Patient
 */
export const shareReportWithDoctor = catchAsync(async (req, res) => {
  const { doctorId } = req.body;
  const report = await SymptomReport.findById(req.params.id);
  if (!report) throw new NotFoundError('Report not found');

  if (report.patientId.toString() !== req.userId) {
    throw new BadRequestError('You are not authorized to share this report');
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new NotFoundError('Doctor not found');

  if (!report.sharedWith.map(String).includes(String(doctorId))) {
    report.sharedWith.push(doctorId);
    await report.save();
  }

  logger.info('Report shared with doctor', { reportId: report._id, doctorId });

  res.json({ success: true, message: 'Report shared successfully with doctor' });
});

/**
 * @desc    Get reports shared with doctor
 * @route   GET /api/reports/shared
 * @access  Private/Doctor
 */
export const getSharedReports = catchAsync(async (req, res) => {
  const doctor = await Doctor.findOne({ userId: req.userId });
  if (!doctor) throw new NotFoundError('Doctor profile not found');

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    SymptomReport.find({ sharedWith: doctor._id })
      .populate('patientId', 'profile.name email phone profile.age profile.gender')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip),
    SymptomReport.countDocuments({ sharedWith: doctor._id }),
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
 * @desc    Regenerate report PDF
 * @route   POST /api/reports/:id/regenerate
 * @access  Private
 */
export const regenerateReportPDF = catchAsync(async (req, res) => {
  const report = await SymptomReport.findById(req.params.id);
  if (!report) throw new NotFoundError('Report not found');

  if (report.patientId.toString() !== req.userId) {
    throw new BadRequestError('You are not authorized to regenerate this report');
  }

  const patient = await User.findById(report.patientId);

  // Delete old PDF if exists
  if (report.pdfPath) {
    try {
      deletePDF(report.pdfPath);
    } catch (e) {
      logger.warn('Failed to delete old report PDF', {
        reportId: report._id,
        pdfPath: report.pdfPath,
        error: e.message,
      });
    }
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
    pdfUrl: `/api/reports/${report._id}/pdf`,
  });
});
