import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";
import {
  getPatientProfile,
  updatePatientProfile,
  getPatientReports,
  uploadAvatar,
  deleteAvatar
} from "../controllers/profileController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { profileLogger } from "../utils/logger.js";

const router = express.Router();

// Cloudinary storage for avatar images
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const userId = req.user?.id || 'unknown';
    return {
      folder: "medivault/avatars",
      resource_type: "image",
      public_id: `avatar-${userId}-${Date.now()}`,
      use_filename: false, // Don't use original filename, use our public_id
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      overwrite: true, // Allow overwriting
    };
  },
});

const avatarFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpg, png, gif, webp)"), false);
  }
};

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max for avatars
});

// Protect all profile routes with authentication
router.use(protect);

/**
 * GET /api/profile - Get logged-in patient's profile
 * Accessible by: Patient role and other roles
 */
router.get("/", getPatientProfile);

/**
 * PUT /api/profile - Update logged-in patient's profile
 * Accessible by: Patient role and other roles
 */
router.put("/", updatePatientProfile);

/**
 * POST /api/profile/avatar - Upload user avatar
 * Accessible by: All authenticated users
 */
router.post("/avatar", (req, res, next) => {
  avatarUpload.single("avatar")(req, res, (err) => {
    if (err) {
      profileLogger.error("Avatar upload middleware error", { error: err.message });
      return res.status(400).json({ message: `Upload failed: ${err.message}` });
    }
    next();
  });
}, uploadAvatar);

/**
 * DELETE /api/profile/avatar - Delete user avatar
 * Accessible by: All authenticated users
 */
router.delete("/avatar", deleteAvatar);

/**
 * GET /api/profile/reports - Get patient's reports 
 * Accessible by: Patient role and other roles
 */
router.get("/reports", getPatientReports);

export default router;
