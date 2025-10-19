
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/emailService');
const { sendSMS } = require('../utils/smsService');

class NotificationService {
  async createNotification(notificationData) {
    const notification = new Notification(notificationData);
    await notification.save();

    logger.info('Notification created in service', { notificationId: notification._id });
    return notification;
  }

  async getNotificationsByUser(userId) {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
  }

  async markAsRead(id) {
    return await Notification.findByIdAndUpdate(
      id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  async deleteNotification(id) {
    return await Notification.findByIdAndDelete(id);
  }

  async getUnreadCount(userId) {
    return await Notification.countDocuments({ userId, isRead: false });
  }
}

module.exports = new NotificationService();