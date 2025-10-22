// src/controllers/userController.js (ESM)
import User from '../models/User.js';
import { catchAsync, NotFoundError, BadRequestError } from '../utils/errorHandler.js';
import * as upload from '../middleware/upload.middleware.js';
import logger from '../utils/logger.js';

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
export const getUserById = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('User not found');

  res.json({ success: true, user });
});

/**
 * @desc    Update user avatar
 * @route   PUT /api/users/avatar
 * @access  Private
 */
export const updateAvatar = catchAsync(async (req, res) => {
  if (!req.file) throw new BadRequestError('Please upload an image file');

  const user = await User.findById(req.userId);
  if (!user) throw new NotFoundError('User not found');

  // Delete old avatar if exists and not the default
  if (user.profile?.avatar && !user.profile.avatar.includes('ui-avatars.com')) {
    const oldAvatarPath = user.profile.avatar.replace('/uploads/', 'uploads/');
    try {
      upload.deleteFile(oldAvatarPath);
    } catch (e) {
      // non-fatal: log and continue
      logger.warn('Failed to delete old avatar', { userId: user._id, oldAvatarPath, error: e.message });
    }
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
 * @desc    Delete user account (soft delete)
 * @route   DELETE /api/users/account
 * @access  Private
 */
export const deleteAccount = catchAsync(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw new NotFoundError('User not found');

  user.isActive = false;
  await user.save();

  logger.info('User account deactivated', { userId: user._id });

  res.json({ success: true, message: 'Account deactivated successfully' });
});

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = catchAsync(async (req, res) => {
  const pageNum = Math.max(1, Number(req.query.page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const { role, search } = req.query;

  const query = {};
  if (role) query.role = role;
  if (search) query['profile.name'] = { $regex: search, $options: 'i' };

  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(query).limit(limitNum).skip(skip).sort({ createdAt: -1 }),
    User.countDocuments(query)
  ]);

  res.json({
    success: true,
    users,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalUsers: total,
      limit: limitNum
    }
  });
});
