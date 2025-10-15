const User = require('../models/User');
const { catchAsync, NotFoundError, BadRequestError } = require('../utils/errorHandler');
const { deleteFile } = require('../middleware/upload.middleware');
const logger = require('../utils/logger');

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
exports.getUserById = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  res.json({
    success: true,
    user
  });
});

/**
 * @desc    Update user avatar
 * @route   PUT /api/users/avatar
 * @access  Private
 */
exports.updateAvatar = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError('Please upload an image file');
  }
  
  const user = await User.findById(req.userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Delete old avatar if exists and not default
  if (user.profile.avatar && !user.profile.avatar.includes('ui-avatars.com')) {
    const oldAvatarPath = user.profile.avatar.replace('/uploads/', 'uploads/');
    deleteFile(oldAvatarPath);
  }
  
  // Update avatar path
  user.profile.avatar = `/uploads/${req.file.filename}`;
  await user.save();
  
  logger.info('Avatar updated', { userId: user._id });
  
  res.json({
    success: true,
    message: 'Avatar updated successfully',
    avatar: user.profile.avatar
  });
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/account
 * @access  Private
 */
exports.deleteAccount = catchAsync(async (req, res) => {
  const user = await User.findById(req.userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Soft delete - deactivate account
  user.isActive = false;
  await user.save();
  
  logger.info('User account deactivated', { userId: user._id });
  
  res.json({
    success: true,
    message: 'Account deactivated successfully'
  });
});

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, role, search } = req.query;
  
  const query = {};
  
  if (role) {
    query.role = role;
  }
  
  if (search) {
    query['profile.name'] = { $regex: search, $options: 'i' };
  }
  
  const skip = (page - 1) * limit;
  
  const users = await User.find(query)
    .limit(parseInt(limit))
    .skip(skip)
    .sort({ createdAt: -1 });
  
  const total = await User.countDocuments(query);
  
  res.json({
    success: true,
    users,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      limit: parseInt(limit)
    }
  });
});