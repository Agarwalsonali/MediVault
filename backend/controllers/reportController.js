import Report from "../models/report.js";
import Patient from "../models/patient.js";
import cloudinary from "../utils/cloudinary.js";

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

export const uploadReport = async (req, res) => {
  try {
    const { patientId, reportName, reportType, reportDate, notes, doctorName } = req.body;

    if (!patientId || !reportName || !reportType || !reportDate) {
      return res.status(400).json({
        message: "patientId, reportName, reportType, and reportDate are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    // Verify patient belongs to current user
    const patient = await Patient.findOne({ _id: patientId, createdBy: req.user.id });
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

    const report = await Report.create({
      patientId,
      uploadedBy: req.user.id,
      reportName:  reportName.trim(),
      reportType,
      reportDate:  new Date(reportDate),
      doctorName:  doctorName ? doctorName.trim() : "",
      notes:       notes ? notes.trim() : "",
      fileUrl,        // ← Cloudinary HTTPS link stored in MongoDB
      publicId,       // ← for deletion from Cloudinary
      fileName:    req.file.originalname,
      fileSize:    req.file.size,
      mimeType:    req.file.mimetype,
    });

    const populatedReport = await Report.findById(report._id)
      .populate("patientId", "name patientId gender age")
      .populate("uploadedBy", "fullName email");

    res.status(201).json({
      message: "Report uploaded successfully",
      report: populatedReport,
    });
  } catch (error) {
    console.error("uploadReport error:", error);
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
      .select("_id reportName reportType reportDate fileName fileUrl mimeType uploadedBy doctorName notes createdAt")
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

export { VALID_REPORT_TYPES };