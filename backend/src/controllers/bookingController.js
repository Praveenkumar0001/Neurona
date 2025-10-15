const Booking = require('../models/Booking');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const SymptomReport = require('../models/SymptomReport');
const Notification = require('../models/Notification');
const { sendBookingConfirmation, sendDoctorBookingNotification } = require('../utils/emailService');
const { catchAsync, NotFoundError, BadRequestError } = require('../utils/errorHandler');
const { getDayName, isFutureDate } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * @desc    Create new booking
 * @route   POST /api/bookings
 * @access  Private/Patient
 */
exports.createBooking = catchAsync(async (req, res) => {
  const { doctorId, bookingDate, bookingTime, reportId, notes } = req.body;
  const patientId = req.userId;
  
  // Validate required fields
  if (!doctorId || !bookingDate || !bookingTime) {
    throw new BadRequestError('Doctor, date, and time are required');
  }
  
  // Validate date is in future
  if (!isFutureDate(bookingDate)) {
    throw new BadRequestError('Booking date must be in the future');
  }
  
  // Get doctor details
  const doctor = await Doctor.findById(doctorId).populate('userId');
  
  if (!doctor) {
    throw new NotFoundError('Doctor not found');
  }
  
  if (!doctor.isActive) {
    throw new BadRequestError('Doctor is currently not accepting bookings');
  }
  
  // Check if slot is available
  const dayName = getDayName(bookingDate);
  const availableSlots = doctor.availability[dayName];
  
  if (!availableSlots || !availableSlots.includes(bookingTime)) {
    throw new BadRequestError('Selected time slot is not available');
  }
  
  // Check for existing booking in the same slot
  const existingBooking = await Booking.findOne({
    doctorId,
    bookingDate: new Date(bookingDate),
    bookingTime,
    status: { $in: ['pending', 'confirmed'] }
  });
  
  if (existingBooking) {
    throw new BadRequestError('This slot is already booked. Please choose another time.');
  }
  
  // Get patient details
  const patient = await User.findById(patientId);
  
  // Create booking
  const booking = await Booking.create({
    patientId,
    doctorId,
    reportId,
    bookingDate: new Date(bookingDate),
    bookingTime,
    notes,
    amount: doctor.fee,
    status: 'confirmed'
  });
  
  // Share report with doctor if reportId provided
  if (reportId) {
    const report = await SymptomReport.findById(reportId);
    if (report && !report.sharedWith.includes(doctorId)) {
      report.sharedWith.push(doctorId);
      await report.save();
    }
  }
  
  // Update doctor booking count
  doctor.totalBookings += 1;
  await doctor.save();
  
  // Send confirmation emails
  Promise.all([
    sendBookingConfirmation(booking, doctor, patient),
    sendDoctorBookingNotification(booking, doctor, patient)
  ]).catch(err => {
    logger.error('Email notification failed', { error: err.message, bookingId: booking._id });
  });
  
  // Create notifications
  Promise.all([
    Notification.createNotification({
      userId: patientId,
      type: 'booking',
      title: 'Booking Confirmed',
      message: `Your appointment with Dr. ${doctor.name} is confirmed for ${new Date(bookingDate).toLocaleDateString()} at ${bookingTime}`,
      relatedId: booking._id,
      relatedModel: 'Booking',
      priority: 'high'
    }),
    Notification.createNotification({
      userId: doctor.userId._id,
      type: 'booking',
      title: 'New Appointment',
      message: `New appointment booked by ${patient.profile.name} for ${new Date(bookingDate).toLocaleDateString()} at ${bookingTime}`,
      relatedId: booking._id,
      relatedModel: 'Booking',
      priority: 'high'
    })
  ]).catch(err => {
    logger.error('Notification creation failed', { error: err.message, bookingId: booking._id });
  });
  
  logger.info('Booking created', { bookingId: booking._id, patientId, doctorId });
  
  res.status(201).json({
    success: true,
    message: 'Booking created successfully! Confirmation email sent.',
    booking: {
      id: booking._id,
      doctor: {
        name: doctor.name,
        specialty: doctor.specialty,
        profileImage: doctor.profileImage
      },
      date: booking.bookingDate,
      time: booking.bookingTime,
      amount: booking.amount,
      status: booking.status
    }
  });
});

/**
 * @desc    Get all bookings for logged-in user
 * @route   GET /api/bookings
 * @access  Private
 */
exports.getMyBookings = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 10, upcoming } = req.query;
  
  const query = {};
  
  // Check if user is patient or doctor
  const doctor = await Doctor.findOne({ userId: req.userId });
  
  if (doctor) {
    query.doctorId = doctor._id;
  } else {
    query.patientId = req.userId;
  }
  
  // Filter by status
  if (status) {
    query.status = status;
  }
  
  // Filter upcoming bookings
  if (upcoming === 'true') {
    query.bookingDate = { $gte: new Date() };
    query.status = 'confirmed';
  }
  
  const skip = (page - 1) * limit;
  
  const bookings = await Booking.find(query)
    .populate('patientId', 'profile.name email phone profile.avatar')
    .populate('doctorId', 'name specialty profileImage fee')
    .populate('reportId', 'analysis')
    .sort({ bookingDate: -1, bookingTime: 1 })
    .limit(parseInt(limit))
    .skip(skip);
  
  const total = await Booking.countDocuments(query);
  
  res.json({
    success: true,
    bookings,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalBookings: total,
      limit: parseInt(limit)
    }
  });
});

/**
 * @desc    Get booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private
 */
exports.getBookingById = catchAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('patientId', 'profile.name email phone profile.avatar profile.age profile.gender')
    .populate('doctorId', 'name specialty qualification experience profileImage fee')
    .populate('reportId');
  
  if (!booking) {
    throw new NotFoundError('Booking not found');
  }
  
  // Check authorization
  const doctor = await Doctor.findOne({ userId: req.userId });
  const isPatient = booking.patientId._id.toString() === req.userId;
  const isDoctor = doctor && booking.doctorId._id.toString() === doctor._id.toString();
  
  if (!isPatient && !isDoctor) {
    throw new BadRequestError('You are not authorized to view this booking');
  }
  
  res.json({
    success: true,
    booking
  });
});

/**
 * @desc    Update booking status
 * @route   PUT /api/bookings/:id/status
 * @access  Private
 */
exports.updateBookingStatus = catchAsync(async (req, res) => {
  const { status, cancellationReason } = req.body;
  
  const booking = await Booking.findById(req.params.id)
    .populate('patientId', 'profile.name email')
    .populate('doctorId', 'name');
  
  if (!booking) {
    throw new NotFoundError('Booking not found');
  }
  
  // Check authorization
  const doctor = await Doctor.findOne({ userId: req.userId });
  const isPatient = booking.patientId._id.toString() === req.userId;
  const isDoctor = doctor && booking.doctorId._id.toString() === doctor._id.toString();
  
  if (!isPatient && !isDoctor) {
    throw new BadRequestError('You are not authorized to update this booking');
  }
  
  // Validate status transition
  const validStatuses = ['confirmed', 'completed', 'cancelled', 'rescheduled', 'no-show'];
  if (!validStatuses.includes(status)) {
    throw new BadRequestError('Invalid status');
  }
  
  booking.status = status;
  
  if (status === 'cancelled') {
    booking.cancellationReason = cancellationReason;
    booking.cancelledBy = isPatient ? 'patient' : 'doctor';
    booking.cancellationDate = new Date();
  }
  
  if (status === 'completed') {
    booking.completedAt = new Date();
    
    // Update doctor's completed sessions
    const doctorProfile = await Doctor.findById(booking.doctorId._id);
    if (doctorProfile) {
      doctorProfile.completedSessions += 1;
      await doctorProfile.save();
    }
  }
  
  await booking.save();
  
  // Create notification for the other party
  const notificationUserId = isPatient ? doctor.userId : booking.patientId._id;
  const notificationMessage = status === 'cancelled' 
    ? `Appointment on ${new Date(booking.bookingDate).toLocaleDateString()} at ${booking.bookingTime} has been cancelled`
    : `Appointment status updated to ${status}`;
  
  Notification.createNotification({
    userId: notificationUserId,
    type: status === 'cancelled' ? 'cancellation' : 'booking',
    title: 'Booking Status Update',
    message: notificationMessage,
    relatedId: booking._id,
    relatedModel: 'Booking',
    priority: 'high'
  }).catch(err => {
    logger.error('Notification creation failed', { error: err.message });
  });
  
  logger.info('Booking status updated', { bookingId: booking._id, status });
  
  res.json({
    success: true,
    message: 'Booking status updated successfully',
    booking
  });
});

/**
 * @desc    Add prescription to booking
 * @route   PUT /api/bookings/:id/prescription
 * @access  Private/Doctor
 */
exports.addPrescription = catchAsync(async (req, res) => {
  const { medications, diagnosis, advice, testsRecommended } = req.body;
  
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    throw new NotFoundError('Booking not found');
  }
  
  // Check authorization (only doctor can add prescription)
  const doctor = await Doctor.findOne({ userId: req.userId });
  if (!doctor || booking.doctorId.toString() !== doctor._id.toString()) {
    throw new BadRequestError('You are not authorized to add prescription to this booking');
  }
  
  // Check if booking is completed
  if (booking.status !== 'completed') {
    throw new BadRequestError('Prescription can only be added to completed bookings');
  }
  
  booking.prescription = {
    medications,
    diagnosis,
    advice,
    testsRecommended
  };
  
  await booking.save();
  
  logger.info('Prescription added', { bookingId: booking._id, doctorId: doctor._id });
  
  res.json({
    success: true,
    message: 'Prescription added successfully',
    prescription: booking.prescription
  });
});

/**
 * @desc    Add doctor notes to booking
 * @route   PUT /api/bookings/:id/notes
 * @access  Private/Doctor
 */
exports.addDoctorNotes = catchAsync(async (req, res) => {
  const { doctorNotes } = req.body;
  
  const booking = await Booking.findById(req.params.id);
  
  if (!booking) {
    throw new NotFoundError('Booking not found');
  }
  
  // Check authorization
  const doctor = await Doctor.findOne({ userId: req.userId });
  if (!doctor || booking.doctorId.toString() !== doctor._id.toString()) {
    throw new BadRequestError('You are not authorized to add notes to this booking');
  }
  
  booking.doctorNotes = doctorNotes;
  await booking.save();
  
  logger.info('Doctor notes added', { bookingId: booking._id, doctorId: doctor._id });
  
  res.json({
    success: true,
    message: 'Notes added successfully',
    doctorNotes: booking.doctorNotes
  });
});

/**
 * @desc    Reschedule booking
 * @route   PUT /api/bookings/:id/reschedule
 * @access  Private
 */
exports.rescheduleBooking = catchAsync(async (req, res) => {
  const { newDate, newTime } = req.body;
  
  if (!newDate || !newTime) {
    throw new BadRequestError('New date and time are required');
  }
  
  const booking = await Booking.findById(req.params.id)
    .populate('doctorId');
  
  if (!booking) {
    throw new NotFoundError('Booking not found');
  }
  
  // Check authorization (patient only)
  if (booking.patientId.toString() !== req.userId) {
    throw new BadRequestError('Only the patient can reschedule the booking');
  }
  
  // Validate new date is in future
  if (!isFutureDate(newDate)) {
    throw new BadRequestError('New booking date must be in the future');
  }
  
  // Check if new slot is available
  const dayName = getDayName(newDate);
  const availableSlots = booking.doctorId.availability[dayName];
  
  if (!availableSlots || !availableSlots.includes(newTime)) {
    throw new BadRequestError('Selected time slot is not available');
  }
  
  // Check for conflicts
  const conflictingBooking = await Booking.findOne({
    doctorId: booking.doctorId._id,
    bookingDate: new Date(newDate),
    bookingTime: newTime,
    status: { $in: ['pending', 'confirmed'] },
    _id: { $ne: booking._id }
  });
  
  if (conflictingBooking) {
    throw new BadRequestError('This slot is already booked');
  }
  
  booking.bookingDate = new Date(newDate);
  booking.bookingTime = newTime;
  booking.status = 'rescheduled';
  await booking.save();
  
  logger.info('Booking rescheduled', { bookingId: booking._id, newDate, newTime });
  
  res.json({
    success: true,
    message: 'Booking rescheduled successfully',
    booking
  });
});

/**
 * @desc    Get booking statistics
 * @route   GET /api/bookings/stats
 * @access  Private
 */
exports.getBookingStats = catchAsync(async (req, res) => {
  const query = {};
  
  // Check if user is doctor or patient
  const doctor = await Doctor.findOne({ userId: req.userId });
  
  if (doctor) {
    query.doctorId = doctor._id;
  } else {
    query.patientId = req.userId;
  }
  
  const totalBookings = await Booking.countDocuments(query);
  const completedBookings = await Booking.countDocuments({ ...query, status: 'completed' });
  const upcomingBookings = await Booking.countDocuments({ 
    ...query, 
    status: 'confirmed',
    bookingDate: { $gte: new Date() }
  });
  const cancelledBookings = await Booking.countDocuments({ ...query, status: 'cancelled' });
  
  res.json({
    success: true,
    stats: {
      totalBookings,
      completedBookings,
      upcomingBookings,
      cancelledBookings
    }
  });
});