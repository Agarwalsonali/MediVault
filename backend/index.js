import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { sendEmail } from "./utils/sendEmail.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import patientReportRoutes from "./routes/patientReportRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import logger from "./utils/logger.js";
import { requestLogger } from "./middleware/requestLogger.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(requestLogger);
app.use(
  cors({
    origin: [
      "http://localhost:5173",
    ],
    credentials: true
  })
);

// Serve static files for uploads
app.use("/uploads", express.static("uploads"));

mongoose.connect(process.env.MONGO_URL)
  .then(() => logger.info("MongoDB Connected"))
  .catch((err) => logger.error("MongoDB connection failed", { error: err.message, stack: err.stack }));

//sendEmail("agarwalsonali922@gmail.com", "Test Email", "Hello OTP Test");

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/patient", patientReportRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/profile", profileRoutes);

app.use((err, req, res, next) => {
  logger.error("Unhandled application error", {
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: err.stack,
  });

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));