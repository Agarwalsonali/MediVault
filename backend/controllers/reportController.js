import Report from "../models/report.js";
import Patient from "../models/patient.js";
import cloudinary from "../utils/cloudinary.js";
import { reportLogger } from "../utils/logger.js";
import { sanitizeString } from "../utils/sanitizer.js";
import jwt from "jsonwebtoken";
import { encryptFile, decryptFile, prepareEncryptedFile } from "../utils/encryption.js";
import axios from "axios";

// Report type categories for real-world medical context
const VALID_REPORT_TYPES = [
  "Blood Test",
  "Urine Test",
  "X-Ray",
  "MRI Scan",
  "CT Scan",
  "Ultrasound",
  "ECG / EKG",
  "Echocardiogram",
  "Prescription",
  "Discharge Summary",
  "Pathology Report",
  "Radiology Report",
  "Vaccination Record",
  "Allergy Test",
  "COVID-19 Test",
  "Biopsy Report",
  "Dental Record",
  "Ophthalmology Report",
  "Other",
];

const STAFF_OR_ADMIN_ROLES = ["Admin", "Doctor", "Nurse", "Staff"];

const canViewAllPatients = (role) => STAFF_OR_ADMIN_ROLES.includes(role);

const mapUploaderRole = (role) => {
  if (role === "Admin") return "ADMIN";
  if (role === "Patient") return "PATIENT";
  return "STAFF";
};

export const uploadReport = async (req, res) => {
  try {
    let { patientId, reportName, reportType, reportDate, notes, doctorName } = req.body;

    // Sanitize string inputs
    reportName = sanitizeString(reportName);
    reportType = sanitizeString(reportType);
    notes = sanitizeString(notes);
    doctorName = sanitizeString(doctorName);

    if (!patientId || !reportName || !reportType || !reportDate) {
      return res.status(400).json({
        message: "patientId, reportName, reportType, and reportDate are required",
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "File is required" });
    }

    // Verify patient exists and user has access
    let patient = null;
    const isStaff = canViewAllPatients(req.user?.role);

    // Try to find patient by ID first
    patient = await Patient.findById(patientId);

    // If not found and user is staff, try to find patient by createdBy (User ID)
    if (!patient && isStaff) {
      patient = await Patient.findOne({ createdBy: patientId });
    }

    // If still not found and user is NOT staff, find patient by ID with createdBy filter
    if (!patient && !isStaff) {
      patient = await Patient.findOne({ _id: patientId, createdBy: req.user.id });
    }
    if (!patient) {
      return res.status(404).json({ message: "Patient not found or unauthorized" });
    }

    try {
      // Encrypt file buffer
      reportLogger.info("Encrypting file before upload", {
        originalFileName: req.file.originalname,
        originalSize: req.file.size,
        patientId: patient._id
      });

      const { encryptedBuffer, iv } = encryptFile(req.file.buffer);

      // Upload encrypted file to Cloudinary
      reportLogger.info("Uploading encrypted file to Cloudinary", {
        fileName: req.file.originalname,
        encryptedSize: encryptedBuffer.length
      });

      // Always use 'raw' resource type for encrypted files (no longer valid images)
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `medivault/reports/${patient._id}`,
            resource_type: "raw",
            public_id: `${Date.now()}-${req.file.originalname.replace(/\s+/g, "_")}`,
            use_filename: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(encryptedBuffer);
      });

      const fileUrl = uploadResult.secure_url;
      const publicId = uploadResult.public_id;

      const uploaderRole = mapUploaderRole(req.user?.role);

      // Create report with encryption metadata
      const report = await Report.create({
        patientId: patient._id,
        uploadedBy: req.user.id,
        uploadedByRole: uploaderRole,
        uploaded_by: uploaderRole,
        verified: req.user?.role === "Admin" || req.user?.role === "Doctor" || req.user?.role === "Nurse" || req.user?.role === "Staff",
        reportName: reportName.trim(),
        reportType,
        reportDate: new Date(reportDate),
        doctorName: doctorName ? doctorName.trim() : "",
        notes: notes ? notes.trim() : "",
        fileUrl,
        publicId,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        encryptionIv: iv,
        isEncrypted: true
      });

      const populatedReport = await Report.findById(report._id)
        .populate("patientId", "name patientId gender age")
        .populate("uploadedBy", "fullName email");

      reportLogger.info("Report uploaded and encrypted successfully", {
        reportId: report._id,
        fileName: report.fileName,
        encrypted: true,
        ivStored: !!iv
      });

      res.status(201).json({
        message: "Report uploaded and encrypted successfully",
        report: populatedReport,
      });

    } catch (encryptionError) {
      reportLogger.error("Encryption or upload failed", {
        error: encryptionError.message,
        stack: encryptionError.stack,
        fileName: req.file.originalname
      });

      return res.status(500).json({
        message: "Failed to encrypt and upload file",
        error: encryptionError.message
      });
    }

  } catch (error) {
    reportLogger.error("uploadReport error", { error: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
};

export const getReportsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findOne({ _id: patientId, createdBy: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found or unauthorized" });
    }

    const reports = await Report.find({ patientId })
      .select("_id reportName reportType reportDate fileName fileUrl mimeType uploadedBy uploadedByRole uploaded_by verified doctorName notes createdAt")
      .populate("uploadedBy", "fullName")
      .sort({ reportDate: -1 });

    res.status(200).json({ message: "Reports retrieved successfully", count: reports.length, reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("patientId", "name patientId gender age")
      .populate("uploadedBy", "fullName email");

    if (!report) return res.status(404).json({ message: "Report not found" });

    res.status(200).json({ message: "Report retrieved successfully", report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const isStaff = ["Admin", "Doctor", "Nurse", "Staff"].includes(req.user?.role);
    
    let query;
    if (isStaff) {
      // Staff can see only STAFF/ADMIN uploaded reports, NOT patient-uploaded reports
      query = Report.find({ uploadedByRole: { $in: ["STAFF", "ADMIN"] } });
    } else {
      // Non-staff users can only see reports for their own patients
      const userPatients = await Patient.find({ createdBy: req.user.id }).select("_id");
      const patientIds = userPatients.map(p => p._id);
      query = Report.find({ patientId: { $in: patientIds } });
    }

    const reports = await query
      .select("_id reportName reportType reportDate fileName fileUrl uploadedBy uploadedByRole verified doctorName createdAt")
      .populate("patientId", "name patientId gender age")
      .populate("uploadedBy", "fullName email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ 
      message: "Reports retrieved successfully", 
      count: reports.length, 
      reports 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (report.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete from Cloudinary
    if (report.publicId) {
      await cloudinary.uploader.destroy(report.publicId, { resource_type: "image" }).catch(() => {});
      await cloudinary.uploader.destroy(report.publicId, { resource_type: "raw" }).catch(() => {});
    }

    await Report.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const downloadReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate("patientId");
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Security check: User must be the uploader OR the patient who owns this report
    const isUploader = report.uploadedBy.toString() === req.user.id;
    const isPatientOwner = report.patientId && report.patientId.createdBy?.toString() === req.user.id;

    if (!isUploader && !isPatientOwner) {
      return res.status(403).json({ message: "Unauthorized: You don't have access to this report" });
    }

    // If file is encrypted, download, decrypt, and send
    if (report.isEncrypted && report.encryptionIv) {
      try {
        reportLogger.info("Downloading and decrypting file", {
          reportId: report._id,
          fileName: report.fileName
        });

        // Download encrypted file from Cloudinary
        const response = await axios.get(report.fileUrl, {
          responseType: "arraybuffer",
          timeout: 30000
        });

        const encryptedBuffer = Buffer.from(response.data);

        // Decrypt file
        const decryptedBuffer = decryptFile(encryptedBuffer, report.encryptionIv);

        // Set response headers for file download
        res.setHeader("Content-Type", report.mimeType || "application/octet-stream");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${encodeURIComponent(report.fileName)}"`
        );
        res.setHeader("Content-Length", decryptedBuffer.length);
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        reportLogger.info("File decrypted and sent successfully", {
          reportId: report._id,
          originalSize: report.fileSize,
          decryptedSize: decryptedBuffer.length
        });

        return res.send(decryptedBuffer);

      } catch (decryptionError) {
        reportLogger.error("Failed to decrypt and download file", {
          error: decryptionError.message,
          reportId: report._id,
          stack: decryptionError.stack
        });

        return res.status(500).json({
          message: "Failed to decrypt file",
          error: decryptionError.message
        });
      }
    }

    // Fallback: If file is not encrypted, return URL (legacy support)
    reportLogger.warn("Downloading unencrypted file (legacy)", {
      reportId: report._id,
      fileName: report.fileName
    });

    res.status(200).json({
      message: "Download authorized",
      download: {
        _id: report._id,
        fileName: report.fileName,
        fileUrl: report.fileUrl,
        reportName: report.reportName,
        mimeType: report.mimeType,
        fileSize: report.fileSize,
        isEncrypted: report.isEncrypted
      }
    });

  } catch (error) {
    reportLogger.error("downloadReport error", { error: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
};

// Share report with doctor - generates secure 30-minute link
export const shareReport = async (req, res) => {
  try {
    // Populate patient with createdBy user reference
    const report = await Report.findById(req.params.id)
      .populate({
        path: "patientId",
        populate: { path: "createdBy" }
      });
    
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Security: Only the report uploader OR the patient who owns the report can share it
    const isUploader = report.uploadedBy.toString() === req.user.id;
    const isPatientOwner = report.patientId?.createdBy?._id.toString() === req.user.id;

    if (!isUploader && !isPatientOwner) {
      return res.status(403).json({ message: "Unauthorized: Only uploader or patient can share" });
    }

    // Generate share token (30 minutes expiry)
    const shareToken = jwt.sign(
      {
        reportId: report._id.toString(),
        role: "doctor-access",
        type: "report-share"
      },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    // Build share link
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
    const shareLink = `${frontendUrl}/shared-report/${shareToken}`;

    reportLogger.info(`Report ${report._id} shared by ${req.user.id}`);

    res.status(200).json({
      message: "Report share link generated",
      shareLink,
      expiresIn: "30 minutes"
    });
  } catch (error) {
    reportLogger.error(`Share report error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Access shared report - verifies token and returns report data
export const getSharedReport = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ 
        message: err.name === "TokenExpiredError" ? "Link expired" : "Invalid link" 
      });
    }

    // Check token type
    if (decoded.type !== "report-share" || decoded.role !== "doctor-access") {
      return res.status(401).json({ message: "Invalid link" });
    }

    // Fetch report
    const report = await Report.findById(decoded.reportId)
      .select("_id reportName reportType reportDate fileName fileUrl fileSize mimeType doctorName uploadedBy patientId")
      .populate("patientId", "name age gender")
      .populate("uploadedBy", "fullName email");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    reportLogger.info(`Shared report ${report._id} accessed`);

    res.status(200).json({
      message: "Report accessed successfully",
      report: {
        _id: report._id,
        reportName: report.reportName,
        reportType: report.reportType,
        reportDate: report.reportDate,
        fileName: report.fileName,
        fileUrl: report.fileUrl,
        fileSize: report.fileSize,
        mimeType: report.mimeType,
        doctorName: report.doctorName,
        uploadedBy: report.uploadedBy,
        patientId: report.patientId
      }
    });
  } catch (error) {
    reportLogger.error(`Get shared report error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Download decrypted shared report file - public endpoint
export const downloadSharedReport = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ 
        message: err.name === "TokenExpiredError" ? "Link expired" : "Invalid link" 
      });
    }

    // Check token type
    if (decoded.type !== "report-share" || decoded.role !== "doctor-access") {
      return res.status(401).json({ message: "Invalid link" });
    }

    // Fetch report
    const report = await Report.findById(decoded.reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // If file is encrypted, download and decrypt
    if (report.isEncrypted && report.encryptionIv) {
      try {
        reportLogger.info("Downloading and decrypting shared file", {
          reportId: report._id,
          fileName: report.fileName
        });

        // Download encrypted file from Cloudinary
        const response = await axios.get(report.fileUrl, {
          responseType: "arraybuffer",
          timeout: 30000
        });

        const encryptedBuffer = Buffer.from(response.data);

        // Decrypt file
        const decryptedBuffer = decryptFile(encryptedBuffer, report.encryptionIv);

        // Set response headers for file download
        res.setHeader("Content-Type", report.mimeType || "application/octet-stream");
        res.setHeader(
          "Content-Disposition",
          `inline; filename="${encodeURIComponent(report.fileName)}"`
        );
        res.setHeader("Content-Length", decryptedBuffer.length);
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        reportLogger.info("Shared file decrypted and sent successfully", {
          reportId: report._id,
          fileName: report.fileName,
          decryptedSize: decryptedBuffer.length
        });

        return res.send(decryptedBuffer);

      } catch (decryptionError) {
        reportLogger.error("Failed to decrypt shared file", {
          error: decryptionError.message,
          reportId: report._id,
          stack: decryptionError.stack
        });

        return res.status(500).json({
          message: "Failed to decrypt file",
          error: decryptionError.message
        });
      }
    }

    // Fallback: If file is not encrypted, redirect to Cloudinary URL
    reportLogger.warn("Accessing unencrypted shared file (legacy)", {
      reportId: report._id,
      fileName: report.fileName
    });

    res.redirect(report.fileUrl);

  } catch (error) {
    reportLogger.error("Download shared report error", { error: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
};

export { VALID_REPORT_TYPES };