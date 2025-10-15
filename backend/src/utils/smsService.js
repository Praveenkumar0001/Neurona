const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { catchAsync, BadRequestError, UnauthorizedError, NotFoundError } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const crypto = require('crypto');

/**
 * @desc    Register new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
exports.signup = catchAsync(async (req, res) => {
  const { email, phone, password, role, name, age, gender } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ 
    $or: [{ email }, { phone }] 
  });
  
  if (existingUser) {
    throw new BadRequestError('User already exists with this email or phone');
  }
  
  // Create user
  const user = await User.create({
    email,
    phone,
    password,
    role: role || 'patient',
    profile: {
      name,
      age,
      gender
    }
  });
  
  // Generate token
  const token = generateToken(user._id);
  
  // Send welcome email (don't wait for it)
  sendWelcomeEmail(user).catch(err => {
    logger.error('Welcome email failed', { error: err.message, userId: user._id });
  });
  
  logger.info('User registered successfully', { userId: user._id, email, role: user.role });
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: {
      id: user._id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      name: user.profile.name
    }
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }
  
  // Find user and include password
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }
  
  // Check if user is active
  if (!user.isActive) {
    throw new UnauthorizedError('Your account has been deactivated. Please contact support.');
  }
  
  // Check password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }
  
  // Update last login
  user.updateLastLogin().catch(err => {
    logger.error('Failed to update last login', { error: err.message, userId: user._id });
  });
  
  // Generate token
  const token = generateToken(user._id);
  
  logger.info('User logged in successfully', { userId: user._id, email });
  
  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      name: user.profile.name,
      avatar: user.profile.avatar
    }
  });
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getCurrentUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  res.json({
    success: true,
    user
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = catchAsync(async (req, res) => {
  const { name, age, gender, address, city, state, pincode } = req.body;
  
  const user = await User.findById(req.userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Update profile fields
  if (name) user.profile.name = name;
  if (age) user.profile.age = age;
  if (gender) user.profile.gender = gender;
  if (address) user.profile.address = address;
  if (city) user.profile.city = city;
  if (state) user.profile.state = state;
  if (pincode) user.profile.pincode = pincode;
  
  await user.save();
  
  logger.info('User profile updated', { userId: user._id });
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    user
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    throw new BadRequestError('Please provide current and new password');
  }
  
  // Get user with password
  const user = await User.findById(req.userId).select('+password');
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  
  if (!isPasswordValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  logger.info('Password changed successfully', { userId: user._id });
  
  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * @desc    Request password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    throw new BadRequestError('Please provide email');
  }
  
  const user = await User.findOne({ email });
  
  if (!user) {
    // Don't reveal if user exists or not
    return res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.'
    });
  }
  
  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });
  
  // Send reset email
  try {
    await sendPasswordResetEmail(user, resetToken);
    
    logger.info('Password reset email sent', { userId: user._id, email });
    
    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    throw new Error('Error sending password reset email. Please try again.');
  }
});

/**
 * @desc    Reset password
 * @route   PUT /api/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  
  if (!password) {
    throw new BadRequestError('Please provide new password');
  }
  
  // Hash token to compare with stored hash
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  // Find user with valid reset token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    throw new BadRequestError('Invalid or expired reset token');
  }
  
  // Update password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  
  logger.info('Password reset successful', { userId: user._id });
  
  res.json({
    success: true,
    message: 'Password reset successful. You can now login with your new password.'
  });
});

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = catchAsync(async (req, res) => {
  logger.info('User logged out', { userId: req.userId });
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});