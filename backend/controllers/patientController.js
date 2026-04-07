import Patient from "../models/patient.js";
import User from "../models/user.js";

const STAFF_OR_ADMIN_ROLES = ["Admin", "Doctor", "Nurse", "Staff"];

const canViewAllPatients = (role) => STAFF_OR_ADMIN_ROLES.includes(role);

const getPatientAccessFilter = (req) => {
  if (canViewAllPatients(req.user?.role)) return {};
  return { createdBy: req.user.id };
};

export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find(getPatientAccessFilter(req))
      .select("_id name age gender patientId createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Patients retrieved successfully",
      count: patients.length,
      patients,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchPatients = async (req, res) => {
  try {
    const { query } = req.query;
    const accessFilter = getPatientAccessFilter(req);

    if (!query || query.trim().length === 0) {
      const patients = await Patient.find(accessFilter)
        .select("_id name age gender patientId")
        .limit(10)
        .sort({ createdAt: -1 });
      return res.status(200).json({
        message: "Patients retrieved",
        patients,
      });
    }

    const searchQuery = query.trim().toLowerCase();
    const patients = await Patient.find({
      ...accessFilter,
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { patientId: { $regex: searchQuery, $options: "i" } },
      ],
    })
      .select("_id name age gender patientId")
      .limit(20)
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Search results",
      count: patients.length,
      patients,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPatient = async (req, res) => {
  try {
    const { name, age, gender } = req.body;

    if (!name || !age || !gender) {
      return res.status(400).json({
        message: "name, age, and gender are required",
      });
    }

    if (!["Male", "Female", "Other"].includes(gender)) {
      return res.status(400).json({
        message: "gender must be Male, Female, or Other",
      });
    }

    if (age < 0 || age > 150) {
      return res.status(400).json({
        message: "age must be between 0 and 150",
      });
    }

    // Generate unique patient ID (format: P-YYYYMMDD-XXXX)
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const patientId = `P-${dateStr}-${randomStr}`;

    const patient = await Patient.create({
      name: name.trim(),
      age: parseInt(age),
      gender,
      patientId,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Patient created successfully",
      patient: {
        _id: patient._id,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        patientId: patient.patientId,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Patient with this ID already exists",
      });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const accessFilter = getPatientAccessFilter(req);

    const patient = await Patient.findOne({ _id: id, ...accessFilter }).select("_id name age gender patientId createdAt");

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({
      message: "Patient retrieved successfully",
      patient,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users with role = "Patient" (for staff to view/select patients)
export const getAllPatientUsers = async (req, res) => {
  try {
    // Only staff/doctor/nurse/admin can view patient users
    if (!canViewAllPatients(req.user?.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const patientUsers = await User.find({ role: "Patient" })
      .select("_id fullName email age gender bloodGroup")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Patient users retrieved successfully",
      count: patientUsers.length,
      patients: patientUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search users with role = "Patient" by ID or name
export const searchPatientUsers = async (req, res) => {
  try {
    // Only staff/doctor/nurse/admin can search patient users
    if (!canViewAllPatients(req.user?.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      const patientUsers = await User.find({ role: "Patient" })
        .select("_id fullName email age gender bloodGroup")
        .limit(10)
        .sort({ createdAt: -1 });
      return res.status(200).json({
        message: "Patient users retrieved",
        count: patientUsers.length,
        patients: patientUsers,
      });
    }

    const searchQuery = query.trim().toLowerCase();
    
    // Search by user ID or full name
    const patientUsers = await User.find({
      role: "Patient",
      $or: [
        { _id: { $regex: searchQuery, $options: "i" } },
        { fullName: { $regex: searchQuery, $options: "i" } },
      ],
    })
      .select("_id fullName email age gender bloodGroup")
      .limit(20)
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Search results",
      count: patientUsers.length,
      patients: patientUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
