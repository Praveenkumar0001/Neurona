const Notification = require('../models/Notification');
const { catchAsync, NotFoundError, BadRequestError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * @desc    Get all notifications for logged-in user
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getMyNotifications = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  
  const query = { userId: req.userId };
  
  if (unreadOnly === 'true') {
    query.isRead = false;
  }
  
  const skip = (page - 1) * limit;
  
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);
  
  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({ 
    userId: req.userId, 
    isRead: false 
  });
  
  res.json({
    success: true,
    notifications,
    unreadCount,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalNotifications: total,
      limit: parseInt(limit)
    }
  });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = catchAsync(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    throw new NotFoundError('Notification not found');
  }
  
  // Check authorization
  if (notification.userId.toString() !== req.userId) {
    throw new BadRequestError('You are not authorized to update this notification');
  }
  
  if (!notification.isRead) {
    await notification.markAsRead();
  }
  
  res.json({
    success: true,
    message: 'Notification marked as read'
  });
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
exports.markAllAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    { userId: req.userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
  
  logger.info('All notifications marked as read', { userId: req.userId });
  
  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
exports.deleteNotification = catchAsync(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    throw new NotFoundError('Notification not found');
  }
  
  // Check authorization
  if (notification.userId.toString() !== req.userId) {
    throw new BadRequestError('You are not authorized to delete this notification');
  }
  
  await notification.remove();
  
  logger.info('Notification deleted', { notificationId: notification._id });
  
  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

/**
 * @desc    Delete all read notifications
 * @route   DELETE /api/notifications/clear-read
 * @access  Private
 */
exports.clearReadNotifications = catchAsync(async (req, res) => {
  const result = await Notification.deleteMany({ 
    userId: req.userId, 
    isRead: true 
  });
  
  logger.info('Read notifications cleared', { userId: req.userId, count: result.deletedCount });
  
  res.json({
    success: true,
    message: `${result.deletedCount} notifications cleared`,
    deletedCount: result.deletedCount
  });
});

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
exports.getUnreadCount = catchAsync(async (req, res) => {
  const count = await Notification.countDocuments({ 
    userId: req.userId, 
    isRead: false 
  });
  
  res.json({
    success: true,
    unreadCount: count
  });
});