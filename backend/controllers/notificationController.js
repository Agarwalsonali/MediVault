import Notification from "../models/notification.js";
import logger from "../utils/logger.js";
import mongoose from "mongoose";

// Check if MongoDB is connected
const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get notifications for the current user
 * @route GET /api/notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const { limit = 10, offset = 0, unreadOnly = false } = req.query;
    const userId = req.user.id;

    // Check database connection
    if (!isDbConnected()) {
      logger.error("Database not connected when fetching notifications");
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const query = { recipientId: userId };
    if (unreadOnly === "true") {
      query.isRead = false;
    }

    logger.info(`Fetching notifications for user: ${userId}`, { limit, offset, unreadOnly });

    // Add timeout to database queries
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean()
      .maxTimeMS(5000); // 5 second timeout

    const total = await Notification.countDocuments(query).maxTimeMS(5000);
    const unreadCount = await Notification.countDocuments({
      recipientId: userId,
      isRead: false
    }).maxTimeMS(5000);

    logger.info(`Retrieved notifications for user: ${userId}`, { count: notifications.length, total, unreadCount });
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
    logger.error(`Error fetching notifications: ${err.message}`, { 
      stack: err.stack,
      userId: req.user?.id,
      errorName: err.name 
    });
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
    
    // Check database connection
    if (!isDbConnected()) {
      logger.error("Database not connected when fetching unread count");
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    const unreadCount = await Notification.countDocuments({
      recipientId: userId,
      isRead: false
    }).maxTimeMS(5000);

    res.json({
      success: true,
      unreadCount
    });
  } catch (err) {
    logger.error(`Error fetching unread count: ${err.message}`, { 
      stack: err.stack,
      userId: req.user?.id 
    });
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
 * @route PATCH /api/notifications/mark-all-as-read
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    logger.info(`markAllAsRead called - userId: ${userId}, dbConnected: ${isDbConnected()}`);
    
    if (!userId) {
      logger.error("User ID not found in request");
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    // Check database connection
    if (!isDbConnected()) {
      logger.error("Database not connected when trying to mark all notifications as read");
      return res.status(503).json({ success: false, message: "Database not connected" });
    }

    logger.info(`Attempting to mark all notifications as read for user: ${userId}`);

    // First, find the unread notifications to see if they exist
    const unreadNotifications = await Notification.find({ recipientId: userId, isRead: false });
    logger.info(`Found ${unreadNotifications.length} unread notifications for user: ${userId}`);

    // Then update them
    const result = await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );

    logger.info(`Marked ${result.modifiedCount} notifications as read for user: ${userId}`);
    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    logger.error(`Error marking all notifications as read: ${err.message}`, { 
      stack: err.stack,
      userId: req.user?.id,
      errorName: err.name,
      errorMessage: err.message,
      dbConnected: isDbConnected()
    });
    
    // Return more detailed error information for debugging
    res.status(500).json({ 
      success: false, 
      message: "Failed to update notifications",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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
