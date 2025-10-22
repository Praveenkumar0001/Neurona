// src/controllers/bookingController.js (ESM)
import Booking from '../models/Booking.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import SymptomReport from '../models/SymptomReport.js';
import Notification from '../models/Notification.js';
import { sendBookingConfirmation, sendDoctorBookingNotification } from '../utils/emailService.js';
import { catchAsync, NotFoundError, BadRequestError } from '../utils/errorHandler.js';
import { getDayName, isFutureDate } from '../utils/helpers.js';
import logger from '../utils/logger.js';

/**
 * @desc    Create new booking
 * @route   POST /api/bookings
 * @access  Private/Patient
 */
export const createBooking = catchAsync(async (req, res) => {
  const { doctorId, bookingDate, bookingTime, reportId, notes } = req.body;
  const patientId = req.userId;

  if (!doctorId || !bookingDate || !bookingTime) {
    throw new BadRequestError('Doctor, date, and time are required');
  }

  if (!isFutureDate(bookingDate)) {
    throw new BadRequestError('Booking date must be in the future');
  }

  const doctor = await Doctor.findById(doctorId).populate('userId');
  if (!doctor) throw new NotFoundError('Doctor not found');
  if (!doctor.isActive) throw new BadRequestError('Doctor is currently not accepting bookings');

  const dayName = getDayName(bookingDate);
  const availableSlots = doctor.availability[dayName];
  if (!availableSlots || !availableSlots.includes(bookingTime)) {
    throw new BadRequestError('Selected time slot is not available');
  }

  const existingBooking = await Booking.findOne({
    doctorId,
    bookingDate: new Date(bookingDate),
    bookingTime,
    status: { $in: ['pending', 'confirmed'] },
  });
  if (existingBooking) {
    throw new BadRequestError('This slot is already booked. Please choose another time.');
  }

  const patient = await User.findById(patientId);

  const booking = await Booking.create({
    patientId,
    doctorId,
    reportId,
    bookingDate: new Date(bookingDate),
    bookingTime,
    notes,
    amount: doctor.fee,
    status: 'confirmed',
  });

  if (reportId) {
    const report = await SymptomReport.findById(reportId);
    if (report && !report.sharedWith.includes(doctorId)) {
      report.sharedWith.push(doctorId);
      await report.save();
    }
  }

  doctor.totalBookings += 1;
  await doctor.save();

  // fire-and-forget email notifications
  Promise.all([
    sendBookingConfirmation(booking, doctor, patient),
    sendDoctorBookingNotification(booking, doctor, patient),
  ]).catch((err) => {
    logger.error('Email notification failed', { error: err.message, bookingId: booking._id });
  });

  // in-app notifications
  Promise.all([
    Notification.createNotification({
      userId: patientId,
      type: 'booking',
      title: 'Booking Confirmed',
      message: `Your appointment with Dr. ${doctor.name} is confirmed for ${new Date(bookingDate).toLocaleDateString()} at ${bookingTime}`,
      relatedId: booking._id,
      relatedModel: 'Booking',
      priority: 'high',
    }),
    Notification.createNotification({
      userId: doctor.userId._id,
      type: 'booking',
      title: 'New Appointment',
      message: `New appointment booked by ${patient.profile.name} for ${new Date(bookingDate).toLocaleDateString()} at ${bookingTime}`,
      relatedId: booking._id,
      relatedModel: 'Booking',
      priority: 'high',
    }),
  ]).catch((err) => {
    logger.error('Notification creation failed', { error: err.message, bookingId: booking._id });
  });

  logger.info('Booking created', { bookingId: booking._id, patientId, doctorId });

  res.status(201).json({
    success: true,
    message: 'Booking created successfully! Confirmation email sent.',
    booking: {
      id: booking._id,
      doctor: { name: doctor.name, specialty: doctor.specialty, profileImage: doctor.profileImage },
      date: booking.bookingDate,
      time: booking.bookingTime,
      amount: booking.amount,
      status: booking.status,
    },
  });
});

/**
 * @desc    Get all bookings for logged-in user
 * @route   GET /api/bookings
 * @access  Private
 */
export const getMyBookings = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 10, upcoming } = req.query;

  const query = {};
  const doctor = await Doctor.findOne({ userId: req.userId });

  if (doctor) {
    query.doctorId = doctor._id;
  } else {
    query.patientId = req.userId;
  }

  if (status) query.status = status;

  if (upcoming === 'true') {
    query.bookingDate = { $gte: new Date() };
    query.status = 'confirmed';
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  const bookings = await Booking.find(query)
    .populate('patientId', 'profile.name email phone profile.avatar')
    .populate('doctorId', 'name specialty profileImage fee')
    .populate('reportId', 'analysis')
    .sort({ bookingDate: -1, bookingTime: 1 })
    .limit(limitNum)
    .skip(skip);

  const total = await Booking.countDocuments(query);

  res.json({
    success: true,
    bookings,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalBookings: total,
      limit: limitNum,
    },
  });
});

/**
 * @desc    Get booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private
 */
export const getBookingById = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('patientId', 'profile.name email phone profile.avatar profile.age profile.gender')
    .populate('doctorId', 'name specialty qualification experience profileImage fee')
    .populate('reportId');

  if (!booking) throw new NotFoundError('Booking not found');

  const doctor = await Doctor.findOne({ userId: req.userId });
  const isPatient = booking.patientId._id.toString() === req.userId;
  const isDoctor = doctor && booking.doctorId._id.toString() === doctor._id.toString();

  if (!isPatient && !isDoctor) {
    throw new BadRequestError('You are not authorized to view this booking');
  }

  res.json({ success: true, booking });
});

/**
 * @desc    Update booking status
 * @route   PUT /api/bookings/:id/status
 * @access  Private
 */
export const updateBookingStatus = catchAsync(async (req, res) => {
  const { status, cancellationReason } = req.body;

  const booking = await Booking.findById(req.params.id)
    .populate('patientId', 'profile.name email')
    .populate('doctorId', 'name');

  if (!booking) throw new NotFoundError('Booking not found');

  const doctor = await Doctor.findOne({ userId: req.userId });
  const isPatient = booking.patientId._id.toString() === req.userId;
  const isDoctor = doctor && booking.doctorId._id.toString() === doctor._id.toString();

  if (!isPatient && !isDoctor) {
    throw new BadRequestError('You are not authorized to update this booking');
  }

  const validStatuses = ['confirmed', 'completed', 'cancelled', 'rescheduled', 'no-show'];
  if (!validStatuses.includes(status)) throw new BadRequestError('Invalid status');

  booking.status = status;

  if (status === 'cancelled') {
    booking.cancellationReason = cancellationReason;
    booking.cancelledBy = isPatient ? 'patient' : 'doctor';
    booking.cancellationDate = new Date();
  }

  if (status === 'completed') {
    booking.completedAt = new Date();
    const doctorProfile = await Doctor.findById(booking.doctorId._id);
    if (doctorProfile) {
      doctorProfile.completedSessions += 1;
      await doctorProfile.save();
    }
  }

  await booking.save();

  const notificationUserId = isPatient ? doctor.userId : booking.patientId._id;
  const notificationMessage =
    status === 'cancelled'
      ? `Appointment on ${new Date(booking.bookingDate).toLocaleDateString()} at ${booking.bookingTime} has been cancelled`
      : `Appointment status updated to ${status}`;

  Notification.createNotification({
    userId: notificationUserId,
    type: status === 'cancelled' ? 'cancellation' : 'booking',
    title: 'Booking Status Update',
    message: notificationMessage,
    relatedId: booking._id,
    relatedModel: 'Booking',
    priority: 'high',
  }).catch((err) => {
    logger.error('Notification creation failed', { error: err.message });
  });

  logger.info('Booking status updated', { bookingId: booking._id, status });

  res.json({ success: true, message: 'Booking status updated successfully', booking });
});

/**
 * @desc    Add prescription to booking
 * @route   PUT /api/bookings/:id/prescription
 * @access  Private/Doctor
 */
export const addPrescription = catchAsync(async (req, res) => {
  const { medications, diagnosis, advice, testsRecommended } = req.body;

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new NotFoundError('Booking not found');

  const doctor = await Doctor.findOne({ userId: req.userId });
  if (!doctor || booking.doctorId.toString() !== doctor._id.toString()) {
    throw new BadRequestError('You are not authorized to add prescription to this booking');
  }

  if (booking.status !== 'completed') {
    throw new BadRequestError('Prescription can only be added to completed bookings');
  }

  booking.prescription = { medications, diagnosis, advice, testsRecommended };
  await booking.save();

  logger.info('Prescription added', { bookingId: booking._id, doctorId: doctor._id });

  res.json({ success: true, message: 'Prescription added successfully', prescription: booking.prescription });
});

/**
 * @desc    Add doctor notes to booking
 * @route   PUT /api/bookings/:id/notes
 * @access  Private/Doctor
 */
export const addDoctorNotes = catchAsync(async (req, res) => {
  const { doctorNotes } = req.body;

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new NotFoundError('Booking not found');

  const doctor = await Doctor.findOne({ userId: req.userId });
  if (!doctor || booking.doctorId.toString() !== doctor._id.toString()) {
    throw new BadRequestError('You are not authorized to add notes to this booking');
  }

  booking.doctorNotes = doctorNotes;
  await booking.save();

  logger.info('Doctor notes added', { bookingId: booking._id, doctorId: doctor._id });

  res.json({ success: true, message: 'Notes added successfully', doctorNotes: booking.doctorNotes });
});

/**
 * @desc    Reschedule booking
 * @route   PUT /api/bookings/:id/reschedule
 * @access  Private
 */
export const rescheduleBooking = catchAsync(async (req, res) => {
  const { newDate, newTime } = req.body;

  if (!newDate || !newTime) throw new BadRequestError('New date and time are required');

  const booking = await Booking.findById(req.params.id).populate('doctorId');
  if (!booking) throw new NotFoundError('Booking not found');

  if (booking.patientId.toString() !== req.userId) {
    throw new BadRequestError('Only the patient can reschedule the booking');
  }

  if (!isFutureDate(newDate)) {
    throw new BadRequestError('New booking date must be in the future');
  }

  const dayName = getDayName(newDate);
  const availableSlots = booking.doctorId.availability[dayName];
  if (!availableSlots || !availableSlots.includes(newTime)) {
    throw new BadRequestError('Selected time slot is not available');
  }

  const conflictingBooking = await Booking.findOne({
    doctorId: booking.doctorId._id,
    bookingDate: new Date(newDate),
    bookingTime: newTime,
    status: { $in: ['pending', 'confirmed'] },
    _id: { $ne: booking._id },
  });
  if (conflictingBooking) throw new BadRequestError('This slot is already booked');

  booking.bookingDate = new Date(newDate);
  booking.bookingTime = newTime;
  booking.status = 'rescheduled';
  await booking.save();

  logger.info('Booking rescheduled', { bookingId: booking._id, newDate, newTime });

  res.json({ success: true, message: 'Booking rescheduled successfully', booking });
});

/**
 * @desc    Get booking statistics
 * @route   GET /api/bookings/stats
 * @access  Private
 */
export const getBookingStats = catchAsync(async (req, res) => {
  const query = {};
  const doctor = await Doctor.findOne({ userId: req.userId });

  if (doctor) query.doctorId = doctor._id;
  else query.patientId = req.userId;

  const [totalBookings, completedBookings, upcomingBookings, cancelledBookings] = await Promise.all([
    Booking.countDocuments(query),
    Booking.countDocuments({ ...query, status: 'completed' }),
    Booking.countDocuments({ ...query, status: 'confirmed', bookingDate: { $gte: new Date() } }),
    Booking.countDocuments({ ...query, status: 'cancelled' }),
  ]);

  res.json({
    success: true,
    stats: { totalBookings, completedBookings, upcomingBookings, cancelledBookings },
  });
});
