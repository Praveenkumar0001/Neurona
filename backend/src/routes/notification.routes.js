const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for logged-in user
 * @access  Private
 */
router.get('/', authenticate, notificationController.getMyNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', authenticate, notificationController.getUnreadCount);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', authenticate, notificationController.markAsRead);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', authenticate, notificationController.markAllAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id', authenticate, notificationController.deleteNotification);

/**
 * @route   DELETE /api/notifications/clear-read
 * @desc    Delete all read notifications
 * @access  Private
 */
router.delete('/clear-read', authenticate, notificationController.clearReadNotifications);

module.exports = router;