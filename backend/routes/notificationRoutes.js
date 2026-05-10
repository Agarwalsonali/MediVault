import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from "../controllers/notificationController.js";

const router = express.Router();

// All notification routes require authentication
router.use(protect);

/**
 * GET /api/notifications
 * Get notifications for the current user
 * Query params: limit (default 10), offset (default 0), unreadOnly (default false)
 */
router.get("/", getNotifications);

/**
 * GET /api/notifications/unread/count
 * Get count of unread notifications
 */
router.get("/unread/count", getUnreadCount);

/**
 * PATCH /api/notifications/:id/read
 * Mark a specific notification as read
 */
router.patch("/:id/read", markAsRead);

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all unread notifications as read
 */
router.patch("/mark-all/read", markAllAsRead);

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete("/:id", deleteNotification);

export default router;
