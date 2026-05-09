import ActivityLog from "../models/activityLog.js";
import logger from "./logger.js";

/**
 * Log an activity to the database
 * @param {Object} activityData - The activity data
 * @param {string} activityData.userId - User ID
 * @param {string} activityData.userName - User name
 * @param {string} activityData.userRole - User role
 * @param {string} activityData.action - Action type
 * @param {string} [activityData.resourceType] - Resource type
 * @param {string} [activityData.resourceId] - Resource ID
 * @param {string} [activityData.resourceName] - Resource name
 * @param {Object} [activityData.details] - Additional details
 * @param {string} [activityData.ipAddress] - IP address
 * @param {string} [activityData.userAgent] - User agent
 * @param {string} [activityData.status] - Status (SUCCESS/FAILED/PENDING)
 * @param {string} [activityData.errorMessage] - Error message if failed
 * @param {number} [activityData.duration] - Duration in milliseconds
 */
export const logActivity = async (activityData) => {
  try {
    const activity = new ActivityLog({
      userId: activityData.userId,
      userName: activityData.userName,
      userRole: activityData.userRole,
      action: activityData.action,
      resourceType: activityData.resourceType || "SYSTEM",
      resourceId: activityData.resourceId || null,
      resourceName: activityData.resourceName || null,
      details: activityData.details || {},
      ipAddress: activityData.ipAddress || null,
      userAgent: activityData.userAgent || null,
      status: activityData.status || "SUCCESS",
      errorMessage: activityData.errorMessage || null,
      duration: activityData.duration || null,
      timestamp: new Date()
    });

    await activity.save();

    logger.info(`Activity logged: ${activityData.action} by ${activityData.userName}`, {
      userId: activityData.userId,
      action: activityData.action,
      resourceType: activityData.resourceType,
      status: activityData.status
    });

    return activity;
  } catch (error) {
    logger.error("Failed to log activity", {
      error: error.message,
      activityData: activityData
    });
  }
};

/**
 * Log activity with request context
 */
export const logActivityWithRequest = async (req, activityData) => {
  return logActivity({
    ...activityData,
    ipAddress: req.ip || req.socket?.remoteAddress || "unknown",
    userAgent: req.get("user-agent") || "unknown"
  });
};

export default {
  logActivity,
  logActivityWithRequest
};
