// src/controllers/notificationController.js (ESM)
import Notification from '../models/Notification.js';
import { catchAsync, NotFoundError, BadRequestError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';

/**
 * @desc    Get all notifications for logged-in user
 * @route   GET /api/notifications
 * @access  Private
 */
export const getMyNotifications = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const query = { userId: req.userId };
  if (unreadOnly === 'true') query.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).limit(limitNum).skip(skip),
    Notification.countDocuments(query),
    Notification.countDocuments({ userId: req.userId, isRead: false }),
  ]);

  res.json({
    success: true,
    notifications,
    unreadCount,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalNotifications: total,
      limit: limitNum,
    },
  });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = catchAsync(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw new NotFoundError('Notification not found');

  if (notification.userId.toString() !== req.userId) {
    throw new BadRequestError('You are not authorized to update this notification');
  }

  if (!notification.isRead) await notification.markAsRead();

  res.json({ success: true, message: 'Notification marked as read' });
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    { userId: req.userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  logger.info('All notifications marked as read', { userId: req.userId });

  res.json({ success: true, message: 'All notifications marked as read' });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = catchAsync(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw new NotFoundError('Notification not found');

  if (notification.userId.toString() !== req.userId) {
    throw new BadRequestError('You are not authorized to delete this notification');
  }

  await Notification.deleteOne({ _id: notification._id });

  logger.info('Notification deleted', { notificationId: notification._id });

  res.json({ success: true, message: 'Notification deleted successfully' });
});

/**
 * @desc    Delete all read notifications
 * @route   DELETE /api/notifications/clear-read
 * @access  Private
 */
export const clearReadNotifications = catchAsync(async (req, res) => {
  const result = await Notification.deleteMany({ userId: req.userId, isRead: true });

  logger.info('Read notifications cleared', { userId: req.userId, count: result.deletedCount });

  res.json({
    success: true,
    message: `${result.deletedCount} notifications cleared`,
    deletedCount: result.deletedCount,
  });
});

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
export const getUnreadCount = catchAsync(async (req, res) => {
  const count = await Notification.countDocuments({ userId: req.userId, isRead: false });
  res.json({ success: true, unreadCount: count });
});
