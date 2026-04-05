import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";
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

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split(".").pop().toLowerCase();
    const resourceType = ["jpg", "jpeg", "png", "webp", "tiff", "tif"].includes(ext) ? "image" : "raw";
    return {
      folder: `medivault/patient-reports/${req.user?.id || "unknown"}`,
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
  limits: { fileSize: 25 * 1024 * 1024 },
});

router.use(protect, authorizeRoles("Patient"));

router.post("/reports/upload", upload.single("file"), uploadPatientReport);
router.get("/reports", getLoggedInPatientReports);
router.delete("/reports/:id", deleteOwnPatientReport);

export default router;
