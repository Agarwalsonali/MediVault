import Notification from "../models/notification.js";
import logger from "../utils/logger.js";

/**
 * Get notifications for the current user
 * @route GET /api/notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const { limit = 10, offset = 0, unreadOnly = false } = req.query;
    const userId = req.user.id;

    const query = { recipientId: userId };
    if (unreadOnly === "true") {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipientId: userId,
      isRead: false
    });

    logger.info(`Retrieved notifications for user: ${userId}`);
    res.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        unreadCount
      }
    });
  } catch (err) {
    logger.error(`Error fetching notifications: ${err.message}`);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

/**
 * Get unread notification count
 * @route GET /api/notifications/unread/count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await Notification.countDocuments({
      recipientId: userId,
      isRead: false
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (err) {
    logger.error(`Error fetching unread count: ${err.message}`);
    res.status(500).json({ success: false, message: "Failed to fetch unread count" });
  }
};

/**
 * Mark notification as read
 * @route PATCH /api/notifications/:id/read
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    logger.info(`Notification marked as read: ${id}`);
    res.json({
      success: true,
      data: notification
    });
  } catch (err) {
    logger.error(`Error marking notification as read: ${err.message}`);
    res.status(500).json({ success: false, message: "Failed to update notification" });
  }
};

/**
 * Mark all notifications as read
 * @route PATCH /api/notifications/mark-all-read
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );

    logger.info(`Marked ${result.modifiedCount} notifications as read for user: ${userId}`);
    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`
    });
  } catch (err) {
    logger.error(`Error marking all notifications as read: ${err.message}`);
    res.status(500).json({ success: false, message: "Failed to update notifications" });
  }
};

/**
 * Delete a notification
 * @route DELETE /api/notifications/:id
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipientId: userId
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    logger.info(`Notification deleted: ${id}`);
    res.json({
      success: true,
      message: "Notification deleted"
    });
  } catch (err) {
    logger.error(`Error deleting notification: ${err.message}`);
    res.status(500).json({ success: false, message: "Failed to delete notification" });
  }
};

/**
 * Create a notification (internal utility)
 * Used by other controllers when activities occur
 */
export const createNotification = async (recipientId, type, title, message, actionUrl = null, relatedData = {}) => {
  try {
    const user = await require("../models/user.js").default.findById(recipientId).select("role");
    if (!user) {
      logger.warn(`User not found for notification: ${recipientId}`);
      return null;
    }

    const notification = new (require("../models/notification.js").default)({
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
    logger.info(`Notification created for user ${recipientId}: ${type}`);
    return notification;
  } catch (err) {
    logger.error(`Error creating notification: ${err.message}`);
    return null;
  }
};
