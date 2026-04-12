import Report from "../models/report.js";
import Patient from "../models/patient.js";
import User from "../models/user.js";
import cloudinary from "../utils/cloudinary.js";

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

const generatePatientId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `P-${dateStr}-${randomStr}`;
};

const getOrCreateSelfPatientRecord = async (userId) => {
  const existing = await Patient.findOne({ createdBy: userId });
  if (existing) return existing;

  const user = await User.findById(userId).select("fullName age gender");
  if (!user) return null;

  let patientId = generatePatientId();
  // Best-effort collision handling
  for (let i = 0; i < 3; i += 1) {
    const conflict = await Patient.findOne({ patientId }).select("_id");
    if (!conflict) break;
    patientId = generatePatientId();
  }

  return Patient.create({
    name: user.fullName || "Patient",
    age: Number.isFinite(user.age) && user.age >= 0 ? user.age : 0,
    gender: user.gender || "Other",
    patientId,
    createdBy: userId,
  });
};

/**
 * POST /api/patient/reports/upload
 * Patient uploads own report
 */
export const uploadPatientReport = async (req, res) => {
  try {
    if (req.user?.role !== "Patient") {
      if (req.file?.filename) {
        await cloudinary.uploader.destroy(req.file.filename, { resource_type: "raw" }).catch(() => {});
        await cloudinary.uploader.destroy(req.file.filename, { resource_type: "image" }).catch(() => {});
      }
      return res.status(403).json({ message: "Only patients can upload with this endpoint" });
    }

    const { reportName, reportType, reportDate, notes, doctorName } = req.body;

    if (!reportName || !reportName.trim()) {
      if (req.file?.filename) {
        await cloudinary.uploader.destroy(req.file.filename, { resource_type: "raw" }).catch(() => {});
        await cloudinary.uploader.destroy(req.file.filename, { resource_type: "image" }).catch(() => {});
      }
      return res.status(400).json({ message: "Report Name is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File upload is required" });
    }

    const patient = await getOrCreateSelfPatientRecord(req.user.id);
    if (!patient) {
      if (req.file?.filename) {
        await cloudinary.uploader.destroy(req.file.filename, { resource_type: "raw" }).catch(() => {});
        await cloudinary.uploader.destroy(req.file.filename, { resource_type: "image" }).catch(() => {});
      }
      return res.status(404).json({ message: "Patient record not found" });
    }

    const normalizedType = reportType && reportType.trim() ? reportType.trim() : "Other";
    if (!VALID_REPORT_TYPES.includes(normalizedType)) {
      if (req.file?.filename) {
        await cloudinary.uploader.destroy(req.file.filename, { resource_type: "raw" }).catch(() => {});
        await cloudinary.uploader.destroy(req.file.filename, { resource_type: "image" }).catch(() => {});
      }
      return res.status(400).json({ message: "Invalid report type" });
    }

    let parsedDate = new Date();
    if (reportDate) {
      parsedDate = new Date(reportDate);
      if (Number.isNaN(parsedDate.getTime())) {
        if (req.file?.filename) {
          await cloudinary.uploader.destroy(req.file.filename, { resource_type: "raw" }).catch(() => {});
          await cloudinary.uploader.destroy(req.file.filename, { resource_type: "image" }).catch(() => {});
        }
        return res.status(400).json({ message: "Invalid report date" });
      }
    }

    const report = await Report.create({
      patientId: patient._id,
      uploadedBy: req.user.id,
      uploadedByRole: "PATIENT",
      uploaded_by: "PATIENT",
      verified: false,
      reportName: reportName.trim(),
      reportType: normalizedType,
      reportDate: parsedDate,
      notes: notes ? notes.trim() : "",
      doctorName: doctorName ? doctorName.trim() : "",
      fileUrl: req.file.path,
      publicId: req.file.filename,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    const populated = await Report.findById(report._id)
      .select("_id reportName reportType reportDate notes fileUrl fileName fileSize mimeType uploadedByRole uploaded_by verified createdAt")
      .populate("uploadedBy", "fullName role");

    return res.status(201).json({
      message: "Report uploaded successfully",
      report: populated,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/patient/reports
 * List all reports for logged-in patient
 */
export const getLoggedInPatientReports = async (req, res) => {
  try {
    if (req.user?.role !== "Patient") {
      return res.status(403).json({ message: "Only patients can access this endpoint" });
    }

    const patient = await Patient.findOne({ createdBy: req.user.id }).select("_id name patientId");
    if (!patient) {
      return res.status(200).json({ message: "No reports found", count: 0, reports: [] });
    }

    const reports = await Report.find({ patientId: patient._id })
      .select("_id reportName reportType reportDate notes fileUrl fileName fileSize mimeType uploadedBy uploadedByRole uploaded_by verified doctorName createdAt")
      .populate("uploadedBy", "fullName role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Reports retrieved successfully",
      count: reports.length,
      reports,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /api/patient/reports/:id
 * Optional enhancement: patient can delete self-uploaded report
 */
export const deleteOwnPatientReport = async (req, res) => {
  try {
    if (req.user?.role !== "Patient") {
      return res.status(403).json({ message: "Only patients can access this endpoint" });
    }

    const patient = await Patient.findOne({ createdBy: req.user.id }).select("_id");
    if (!patient) {
      return res.status(404).json({ message: "Patient record not found" });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Check if this report belongs to the patient's record
    const isOwnerPatient = report.patientId.toString() === patient._id.toString();

    if (!isOwnerPatient) {
      return res.status(403).json({ message: "You can only delete reports from your own patient record" });
    }

    // Delete from Cloudinary
    if (report.publicId) {
      await cloudinary.uploader.destroy(report.publicId, { resource_type: "image" }).catch(() => {});
      await cloudinary.uploader.destroy(report.publicId, { resource_type: "raw" }).catch(() => {});
    }

    await Report.deleteOne({ _id: report._id });

    return res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
