import express from "express";
import {
  getActivityLogs,
  getUserActivityLogs,
  getFailedLogins,
  getActivityStats,
  exportActivityLogs,
  deleteOldActivityLogs
} from "../controllers/activityController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication and admin role
router.use(protect, isAdmin);

// Get all activity logs with filters
router.get("/", getActivityLogs);

// Get activity statistics
router.get("/stats", getActivityStats);

// Get failed login attempts
router.get("/failed-logins", getFailedLogins);

// Get activity logs for a specific user
router.get("/user/:userId", getUserActivityLogs);

// Export activity logs as CSV
router.get("/export/csv", exportActivityLogs);

// Delete old activity logs
router.delete("/cleanup", deleteOldActivityLogs);

export default router;
