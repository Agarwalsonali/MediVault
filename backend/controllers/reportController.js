import Report from "../models/report.js";
import Patient from "../models/patient.js";
import fs from "fs/promises";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "uploads", "reports");

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
};

export const uploadReport = async (req, res) => {
  try {
    const { patientId, reportName, reportType, reportDate, notes } = req.body;

    if (!patientId || !reportName || !reportType || !reportDate) {
      return res.status(400).json({
        message: "patientId, reportName, reportType, and reportDate are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "File is required",
      });
    }

    // Verify patient exists and belongs to current user
    const patient = await Patient.findOne({
      _id: patientId,
      createdBy: req.user.id,
    });

    if (!patient) {
      // Clean up uploaded file if patient not found
      await fs.unlink(req.file.path);
      return res.status(404).json({
        message: "Patient not found or unauthorized",
      });
    }

    await ensureUploadsDir();

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(req.file.originalname);
    const fileName = `${patientId}-${timestamp}${ext}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    // Move file to permanent location
    await fs.rename(req.file.path, filePath);

    // Create report record
    const report = await Report.create({
      patientId,
      uploadedBy: req.user.id,
      reportName: reportName.trim(),
      reportType,
      reportDate: new Date(reportDate),
      fileUrl: `/uploads/reports/${fileName}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      notes: notes ? notes.trim() : "",
    });

    // Populate patient and uploader info
    const populatedReport = await Report.findById(report._id)
      .populate("patientId", "name patientId gender age")
      .populate("uploadedBy", "fullName email");

    res.status(201).json({
      message: "Report uploaded successfully",
      report: populatedReport,
    });
  } catch (error) {
    // Clean up file if error occurs
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (e) {
        console.error("Error deleting temp file:", e);
      }
    }
    res.status(500).json({ message: error.message });
  }
};

export const getReportsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verify patient belongs to current user
    const patient = await Patient.findOne({
      _id: patientId,
      createdBy: req.user.id,
    });

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found or unauthorized",
      });
    }

    const reports = await Report.find({ patientId })
      .select("_id reportName reportType reportDate fileName uploadedBy createdAt")
      .populate("uploadedBy", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Reports retrieved successfully",
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .populate("patientId", "name patientId gender age")
      .populate("uploadedBy", "fullName email");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Verify authorization
    if (report.uploadedBy._id.toString() !== req.user.id && 
        report.patientId.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json({
      message: "Report retrieved successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Verify authorization
    if (report.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete file
    const filePath = path.join(process.cwd(), report.fileUrl.substring(1)); // Remove leading /
    try {
      await fs.unlink(filePath);
    } catch (e) {
      console.error("Error deleting file:", e);
    }

    // Delete report from database
    await Report.deleteOne({ _id: id });

    res.status(200).json({
      message: "Report deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
