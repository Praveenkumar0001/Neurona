// src/controllers/doctorController.js (ESM)
import Doctor from '../models/Doctor.js';
import User from '../models/User.js'; 
import { catchAsync, NotFoundError, BadRequestError } from '../utils/errorHandler.js';
import { getPagination, buildPaginationResponse } from '../utils/helpers.js';
import logger from '../utils/logger.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

/**
 * @desc    Get all doctors
 * @route   GET /api/doctors
 * @access  Public
 */
export const getAllDoctors = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    specialty,
    minFee,
    maxFee,
    search,
    sortBy = '-rating',
  } = req.query;

  const query = { isActive: true, isVerified: true };

  // Filter by specialty
  if (specialty) {
    query.specialty = specialty;
  }

  // Filter by fee range
  if (minFee || maxFee) {
    query.fee = {};
    if (minFee) query.fee.$gte = Number(minFee);
    if (maxFee) query.fee.$lte = Number(maxFee);
  }

  // Search by name or bio
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { bio: { $regex: search, $options: 'i' } },
    ];
  }

  const { skip, limit: limitNum } = getPagination(page, limit);

  const doctors = await Doctor.find(query)
    .populate('userId', 'email profile')
    .limit(limitNum)
    .skip(skip)
    .sort(sortBy);

  const total = await Doctor.countDocuments(query);
  const response = buildPaginationResponse(doctors, Number(page) || 1, limitNum, total);

  res.json({ success: true, ...response });
});

/**
 * @desc    Get doctor by ID
 * @route   GET /api/doctors/:id
 * @access  Public
 */
export const getDoctorById = catchAsync(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).populate('userId', 'email profile');

  if (!doctor) throw new NotFoundError('Doctor not found');

  res.json({ success: true, doctor });
});

/**
 * @desc    Create doctor profile
 * @route   POST /api/doctors
 * @access  Private/Doctor
 */
export const createDoctorProfile = catchAsync(async (req, res) => {
  const {
    name,
    specialty,
    subSpecialty,
    experience,
    fee,
    qualification,
    registrationNumber,
    bio,
    languages,
    education,
    availability,
  } = req.body;

  // Check if doctor profile already exists
  const existingDoctor = await Doctor.findOne({ userId: req.userId });
  if (existingDoctor) throw new BadRequestError('Doctor profile already exists');

  // Create doctor profile
  const doctor = await Doctor.create({
    userId: req.userId,
    name,
    specialty,
    subSpecialty,
    experience,
    fee,
    qualification,
    registrationNumber,
    bio,
    languages,
    education,
    availability,
  });

  logger.info('Doctor profile created', { doctorId: doctor._id, userId: req.userId });

  res.status(201).json({
    success: true,
    message: 'Doctor profile created successfully',
    doctor,
  });
});

/**
 * @desc    Update doctor profile
 * @route   PUT /api/doctors/:id
 * @access  Private/Doctor
 */
export const updateDoctorProfile = catchAsync(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw new NotFoundError('Doctor not found');

  // Check authorization
  if (doctor.userId.toString() !== req.userId) {
    throw new BadRequestError('You are not authorized to update this profile');
  }

  const updateFields = [
    'name',
    'specialty',
    'subSpecialty',
    'experience',
    'fee',
    'qualification',
    'bio',
    'languages',
    'education',
    'experienceDetails',
    'availability',
    'profileImage',
  ];

  for (const field of updateFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      doctor[field] = req.body[field];
    }
  }

  await doctor.save();

  logger.info('Doctor profile updated', { doctorId: doctor._id });

  res.json({
    success: true,
    message: 'Doctor profile updated successfully',
    doctor,
  });
});

/**
 * @desc    Get doctor availability
 * @route   GET /api/doctors/:id/availability
 * @access  Public
 */
export const getDoctorAvailability = catchAsync(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw new NotFoundError('Doctor not found');

  res.json({
    success: true,
    availability: doctor.availability,
    nextAvailable: doctor.getNextAvailableSlot?.(),
  });
});

/**
 * @desc    Update doctor availability
 * @route   PUT /api/doctors/:id/availability
 * @access  Private/Doctor
 */
export const updateAvailability = catchAsync(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw new NotFoundError('Doctor not found');

  // Check authorization
  if (doctor.userId.toString() !== req.userId) {
    throw new BadRequestError('You are not authorized to update availability');
  }

  const { availability } = req.body;
  if (!availability) throw new BadRequestError('Availability data is required');

  doctor.availability = availability;
  await doctor.save();

  logger.info('Doctor availability updated', { doctorId: doctor._id });

  res.json({
    success: true,
    message: 'Availability updated successfully',
    availability: doctor.availability,
  });
});

/**
 * @desc    Get doctor statistics
 * @route   GET /api/doctors/:id/stats
 * @access  Private/Doctor
 */
export const getDoctorStats = catchAsync(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw new NotFoundError('Doctor not found');

  // Check authorization
  if (doctor.userId.toString() !== req.userId) {
    throw new BadRequestError('You are not authorized to view these statistics');
  }

  const [totalBookings, completedBookings, upcomingBookings, totalReviews] = await Promise.all([
    Booking.countDocuments({ doctorId: doctor._id }),
    Booking.countDocuments({ doctorId: doctor._id, status: 'completed' }),
    Booking.countDocuments({
      doctorId: doctor._id,
      status: 'confirmed',
      bookingDate: { $gte: new Date() },
    }),
    Review.countDocuments({ doctorId: doctor._id }),
  ]);

  res.json({
    success: true,
    stats: {
      totalBookings,
      completedBookings,
      upcomingBookings,
      totalReviews,
      rating: doctor.rating,
      totalRatings: doctor.totalRatings,
    },
  });
});

/**
 * @desc    Toggle doctor active status
 * @route   PUT /api/doctors/:id/toggle-status
 * @access  Private/Doctor
 */
export const toggleDoctorStatus = catchAsync(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw new NotFoundError('Doctor not found');

  // Check authorization
  if (doctor.userId.toString() !== req.userId) {
    throw new BadRequestError('You are not authorized to change status');
  }

  doctor.isActive = !doctor.isActive;
  await doctor.save();

  logger.info('Doctor status toggled', { doctorId: doctor._id, isActive: doctor.isActive });

  res.json({
    success: true,
    message: `Doctor ${doctor.isActive ? 'activated' : 'deactivated'} successfully`,
    isActive: doctor.isActive,
  });
});
