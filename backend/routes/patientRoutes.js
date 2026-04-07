import express from "express";
import {
  getAllPatients,
  searchPatients,
  createPatient,
  getPatientById,
  getAllPatientUsers,
  searchPatientUsers,
} from "../controllers/patientController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all patient routes with authentication
router.use(protect);

// Get all patients
router.get("/", getAllPatients);

// Search patients by name or ID
router.get("/search", searchPatients);

// Get all users with role = "Patient"
router.get("/users/all", getAllPatientUsers);

// Search users with role = "Patient" by ID or name
router.get("/users/search", searchPatientUsers);

// Get specific patient
router.get("/:id", getPatientById);

// Create new patient
router.post("/", createPatient);

export default router;
