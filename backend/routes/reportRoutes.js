import express from "express";
import multer from "multer";
import path from "path";
import {
  uploadReport,
  getReportsByPatient,
  getReportById,
  deleteReport,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/temp/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, PNG, and JPG are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Protect all report routes with authentication
router.use(protect);

// Upload report
router.post("/", upload.single("file"), uploadReport);

// Get reports for a patient
router.get("/patient/:patientId", getReportsByPatient);

// Get specific report
router.get("/:id", getReportById);

// Delete report
router.delete("/:id", deleteReport);

export default router;
