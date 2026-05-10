import Notification from "../models/notification.js";
import User from "../models/user.js";
import logger from "./logger.js";

/**
 * Create a notification for a user
 * @param {string} recipientId - User ID to receive notification
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} actionUrl - Optional URL to navigate to (e.g., '/patient-dashboard/reports')
 * @param {object} relatedData - Optional { resourceId, resourceType }
 */
export const createNotification = async (recipientId, type, title, message, actionUrl = null, relatedData = {}) => {
  try {
    const user = await User.findById(recipientId).select("role");
    if (!user) {
      logger.warn(`User not found for notification: ${recipientId}`);
      return null;
    }

    const notification = new Notification({
      recipientId,
      recipientRole: user.role,
      type,
      title,
      message,
      actionUrl,
      relatedResourceId: relatedData.resourceId || null,
      relatedResourceType: relatedData.resourceType || null
    });

    await notification.save();
    logger.info(`Notification created: ${type} for user ${recipientId}`);
    return notification;
  } catch (err) {
    logger.error(`Error creating notification: ${err.message}`);
    return null;
  }
};

/**
 * Create notifications for multiple users (batch)
 */
export const createBulkNotifications = async (recipientIds, type, title, message, actionUrl = null, relatedData = {}) => {
  try {
    if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
      return [];
    }

    const users = await User.find({ _id: { $in: recipientIds } }).select("_id role");
    if (users.length === 0) {
      logger.warn(`No users found for bulk notification`);
      return [];
    }

    const notifications = users.map(user => ({
      recipientId: user._id,
      recipientRole: user.role,
      type,
      title,
      message,
      actionUrl,
      relatedResourceId: relatedData.resourceId || null,
      relatedResourceType: relatedData.resourceType || null
    }));

    const result = await Notification.insertMany(notifications);
    logger.info(`${result.length} bulk notifications created: ${type}`);
    return result;
  } catch (err) {
    logger.error(`Error creating bulk notifications: ${err.message}`);
    return [];
  }
};

export default {
  createNotification,
  createBulkNotifications
};
