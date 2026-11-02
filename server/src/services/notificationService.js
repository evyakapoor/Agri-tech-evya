import { Notification } from '../models/Notification.js';

export const createNotification = async ({ userId, title, message, type = 'System', link = '' }) => {
  try {
    return await Notification.create({
      user: userId,
      title,
      message,
      type,
      link,
      read: false,
    });
  } catch (err) {
    console.error(`[NotificationService] Error creating notification: ${err.message}`);
    return null;
  }
};
