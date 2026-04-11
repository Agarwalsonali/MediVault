import Report from "../models/report.js";
import Patient from "../models/patient.js";
import cloudinary from "../utils/cloudinary.js";
import { reportLogger } from "../utils/logger.js";
import { sanitizeString } from "../utils/sanitizer.js";

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

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    // Verify patient exists and user has access
    let patientFilter = { _id: patientId };
    if (!canViewAllPatients(req.user?.role)) {
      // Non-staff users can only upload for their own patients
      patientFilter.createdBy = req.user.id;
    }
    
    const patient = await Patient.findOne(patientFilter);
    if (!patient) {
      // Delete the already-uploaded Cloudinary file
      if (req.file.filename) {
        await cloudinary.uploader.destroy(req.file.filename, { resource_type: "raw" }).catch(() => {});
        await cloudinary.uploader.destroy(req.file.filename, { resource_type: "image" }).catch(() => {});
      }
      return res.status(404).json({ message: "Patient not found or unauthorized" });
    }

    // req.file.path is the Cloudinary secure URL (set by multer-storage-cloudinary)
    const fileUrl = req.file.path;         // e.g. https://res.cloudinary.com/...
    const publicId = req.file.filename;    // cloudinary public_id for deletion later

    const uploaderRole = mapUploaderRole(req.user?.role);

    const report = await Report.create({
      patientId,
      uploadedBy: req.user.id,
      uploadedByRole: uploaderRole,
      uploaded_by: uploaderRole,
      verified: req.user?.role === "Admin" || req.user?.role === "Doctor" || req.user?.role === "Nurse" || req.user?.role === "Staff",
      reportName: reportName.trim(),
      reportType,
      reportDate: new Date(reportDate),
      doctorName: doctorName ? doctorName.trim() : "",
      notes: notes ? notes.trim() : "",
      fileUrl,        // ← Cloudinary HTTPS link stored in MongoDB
      publicId,       // ← for deletion from Cloudinary
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    const populatedReport = await Report.findById(report._id)
      .populate("patientId", "name patientId gender age")
      .populate("uploadedBy", "fullName email");

    res.status(201).json({
      message: "Report uploaded successfully",
      report: populatedReport,
    });
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
      // Staff can see all reports
      query = Report.find();
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

    // Return the file URL and metadata (frontend will handle the download)
    res.status(200).json({
      message: "Download authorized",
      download: {
        _id: report._id,
        fileName: report.fileName,
        fileUrl: report.fileUrl,
        reportName: report.reportName,
        mimeType: report.mimeType,
        fileSize: report.fileSize
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { VALID_REPORT_TYPES };