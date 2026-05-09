import ActivityLog from "../models/activityLog.js";
import logger from "../utils/logger.js";

/**
 * Get activity logs with filters and pagination
 */
export const getActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      userRole,
      resourceType,
      startDate,
      endDate,
      userId,
      userName,
      status,
      sortBy = "timestamp",
      sortOrder = "desc"
    } = req.query;

    // Build filter object
    const filter = {};

    if (action) filter.action = action;
    if (userRole) filter.userRole = userRole;
    if (resourceType) filter.resourceType = resourceType;
    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.timestamp.$lte = end;
      }
    }

    // Text search on userName
    if (userName) {
      filter.userName = { $regex: userName, $options: "i" };
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    const sortField = ["timestamp", "userName", "action", "userRole"].includes(sortBy)
      ? sortBy
      : "timestamp";
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    // Fetch logs
    const logs = await ActivityLog.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "fullName email role")
      .exec();

    // Get total count
    const total = await ActivityLog.countDocuments(filter);

    logger.info("Activity logs retrieved", {
      filters: filter,
      count: logs.length,
      total: total
    });

    res.status(200).json({
      success: true,
      message: "Activity logs retrieved successfully",
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error("Failed to retrieve activity logs", {
      error: error.message
    });
    res.status(500).json({
      success: false,
      message: "Failed to retrieve activity logs",
      error: error.message
    });
  }
};

/**
 * Get activity logs for a specific user
 */
export const getUserActivityLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const logs = await ActivityLog.find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const total = await ActivityLog.countDocuments({ userId });

    res.status(200).json({
      success: true,
      message: "User activity logs retrieved successfully",
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error("Failed to retrieve user activity logs", {
      error: error.message
    });
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user activity logs",
      error: error.message
    });
  }
};

/**
 * Get failed login attempts
 */
export const getFailedLogins = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;

    const filter = { action: "LOGIN_FAILED" };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.timestamp.$lte = end;
      }
    }

    const skip = (page - 1) * limit;

    const failedLogins = await ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "fullName email role failedLoginAttempts lockUntil")
      .exec();

    const total = await ActivityLog.countDocuments(filter);

    // Group by userId to show attempt counts
    const groupedByUser = failedLogins.reduce((acc, log) => {
      const existing = acc.find(item => item.userId._id.toString() === log.userId._id.toString());
      if (existing) {
        existing.attempts += 1;
      } else {
        acc.push({
          userId: log.userId,
          attempts: 1,
          lastAttempt: log.timestamp,
          firstAttempt: log.timestamp
        });
      }
      return acc;
    }, []);

    res.status(200).json({
      success: true,
      message: "Failed login logs retrieved successfully",
      data: {
        logs: failedLogins,
        groupedByUser,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error("Failed to retrieve failed login logs", {
      error: error.message
    });
    res.status(500).json({
      success: false,
      message: "Failed to retrieve failed login logs",
      error: error.message
    });
  }
};

/**
 * Get activity statistics
 */
export const getActivityStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.timestamp.$lte = end;
      }
    }

    // Get stats by action
    const actionStats = await ActivityLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get stats by role
    const roleStats = await ActivityLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$userRole",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get stats by status
    const statusStats = await ActivityLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Failed login count
    const failedLoginCount = await ActivityLog.countDocuments({
      ...filter,
      action: "LOGIN_FAILED"
    });

    // Successful login count
    const successfulLoginCount = await ActivityLog.countDocuments({
      ...filter,
      action: "LOGIN",
      status: "SUCCESS"
    });

    res.status(200).json({
      success: true,
      message: "Activity statistics retrieved successfully",
      data: {
        actionStats,
        roleStats,
        statusStats,
        failedLoginCount,
        successfulLoginCount,
        totalActivities: await ActivityLog.countDocuments(filter)
      }
    });
  } catch (error) {
    logger.error("Failed to retrieve activity statistics", {
      error: error.message
    });
    res.status(500).json({
      success: false,
      message: "Failed to retrieve activity statistics",
      error: error.message
    });
  }
};

/**
 * Export activity logs as CSV
 */
export const exportActivityLogs = async (req, res) => {
  try {
    const {
      action,
      userRole,
      resourceType,
      startDate,
      endDate,
      status
    } = req.query;

    // Build filter object
    const filter = {};
    if (action) filter.action = action;
    if (userRole) filter.userRole = userRole;
    if (resourceType) filter.resourceType = resourceType;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.timestamp.$lte = end;
      }
    }

    // Fetch all matching logs
    const logs = await ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .populate("userId", "fullName email role")
      .exec();

    // Convert to CSV
    const csv = convertToCSV(logs);

    // Set headers for download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="activity-logs.csv"');

    res.send(csv);

    logger.info("Activity logs exported", {
      count: logs.length,
      filters: filter
    });
  } catch (error) {
    logger.error("Failed to export activity logs", {
      error: error.message
    });
    res.status(500).json({
      success: false,
      message: "Failed to export activity logs",
      error: error.message
    });
  }
};

/**
 * Convert logs to CSV format
 */
function convertToCSV(logs) {
  const headers = [
    "Timestamp",
    "User Name",
    "User Role",
    "Action",
    "Resource Type",
    "Resource Name",
    "Status",
    "IP Address",
    "Duration (ms)"
  ];

  const rows = logs.map(log => [
    new Date(log.timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }),
    `"${log.userName}"`,
    log.userRole,
    log.action,
    log.resourceType,
    `"${log.resourceName || ""}"`,
    log.status,
    log.ipAddress || "-",
    log.duration || "-"
  ]);

  return [headers, ...rows].map(row => row.join(",")).join("\n");
}

/**
 * Delete old activity logs (cleanup)
 */
export const deleteOldActivityLogs = async (req, res) => {
  try {
    const { daysToKeep = 90 } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await ActivityLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    logger.info("Old activity logs deleted", {
      deletedCount: result.deletedCount,
      cutoffDate: cutoffDate
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} activity logs older than ${daysToKeep} days`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    logger.error("Failed to delete old activity logs", {
      error: error.message
    });
    res.status(500).json({
      success: false,
      message: "Failed to delete old activity logs",
      error: error.message
    });
  }
};
