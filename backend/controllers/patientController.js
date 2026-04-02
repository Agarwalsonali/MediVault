import Patient from "../models/patient.js";

export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ createdBy: req.user.id })
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

    if (!query || query.trim().length === 0) {
      const patients = await Patient.find({ createdBy: req.user.id })
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
      createdBy: req.user.id,
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

    const patient = await Patient.findById(id).select("_id name age gender patientId createdAt");

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
