import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";
import {
  uploadReport,
  getReportsByPatient,
  getReportById,
  getAllReports,
  deleteReport,
  downloadReport,
  shareReport,
  getSharedReport,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All medical file types supported
const ALLOWED_FORMATS = [
  "pdf",        // Lab reports, prescriptions, discharge summaries
  "jpg", "jpeg","png", "webp",  // X-rays, scans, photos
  "tiff", "tif",               // High-res medical imaging
  "dcm",                        // DICOM format (radiology)
  "doc", "docx",               // Typed prescriptions/reports
];

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg", "image/jpg", "image/png", "image/webp",
  "image/tiff",
  "application/dicom",
  "application/octet-stream", // .dcm files
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Cloudinary storage — files go to cloud, MongoDB gets the URL
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split(".").pop().toLowerCase();
    // PDFs and docs as raw, images as image
    const resourceType = ["jpg","jpeg","png","webp","tiff","tif"].includes(ext)
      ? "image"
      : "raw";

    return {
      folder: `medivault/reports/${req.body.patientId || "general"}`,
      resource_type: resourceType,
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`,
      use_filename: true,
    };
  },
});

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
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB for X-rays / DICOM
});

// Public route - get shared report by token (no auth required)
router.get("/shared/:token", getSharedReport);

router.use(protect);

router.post("/", upload.single("file"), uploadReport);
router.get("/", getAllReports);
router.get("/download/:id", downloadReport);
router.post("/:id/share", shareReport);
router.get("/patient/:patientId", getReportsByPatient);
router.get("/:id", getReportById);
router.delete("/:id", deleteReport);

export default router;