import express from "express";
import multer from "multer";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  uploadPatientReport,
  getLoggedInPatientReports,
  deleteOwnPatientReport,
} from "../controllers/patientReportController.js";

const router = express.Router();

const ALLOWED_FORMATS = ["pdf", "jpg", "jpeg", "png", "webp", "tiff", "tif", "dcm", "doc", "docx"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg", "image/jpg", "image/png", "image/webp",
  "image/tiff",
  "application/dicom",
  "application/octet-stream",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Use memory storage instead of direct Cloudinary upload
// Files stay in memory buffer so we can encrypt before uploading
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = file.originalname.split(".").pop().toLowerCase();
  if (ALLOWED_FORMATS.includes(ext) || ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not supported. Allowed: ${ALLOWED_FORMATS.join(", ")}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
});

router.use(protect, authorizeRoles("Patient"));

router.post("/reports/upload", upload.single("file"), uploadPatientReport);
router.get("/reports", getLoggedInPatientReports);
router.delete("/reports/:id", deleteOwnPatientReport);

export default router;
