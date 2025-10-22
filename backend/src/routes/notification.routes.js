// src/routes/notification.routes.js
import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import * as auth from '../middleware/auth.middleware.js';

const router = express.Router();

/** GET /api/notifications */
router.get('/', auth.authenticate, notificationController.getMyNotifications);

/** GET /api/notifications/unread-count */
router.get('/unread-count', auth.authenticate, notificationController.getUnreadCount);

/** PUT /api/notifications/:id/read */
router.put('/:id/read', auth.authenticate, notificationController.markAsRead);

/** PUT /api/notifications/read-all */
router.put('/read-all', auth.authenticate, notificationController.markAllAsRead);

/** DELETE /api/notifications/:id */
router.delete('/:id', auth.authenticate, notificationController.deleteNotification);

/** DELETE /api/notifications/clear-read */
router.delete('/clear-read', auth.authenticate, notificationController.clearReadNotifications);

export default router; 
