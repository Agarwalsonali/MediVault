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
import activityRoutes from "./routes/activityRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import logger from "./utils/logger.js";
import { requestLogger } from "./middleware/requestLogger.js";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'PORT',
  'MONGO_URL', 
  'JWT_SECRET',
  'FRONTEND_URL'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

// Email configuration: either RESEND_API_KEY or EMAIL_USER/EMAIL_PASS
const hasResendKey = !!process.env.RESEND_API_KEY;
const hasGmailConfig = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

if (!hasResendKey && !hasGmailConfig) {
  missingEnvVars.push('EMAIL_USER', 'EMAIL_PASS');
  console.error("❌ FATAL: Email configuration missing. Set either RESEND_API_KEY or EMAIL_USER/EMAIL_PASS");
}

if (missingEnvVars.length > 0) {
  console.error("❌ FATAL: Missing required environment variables:");
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error("\nPlease set these environment variables before starting the server.");
  console.error("Create a .env file in the backend directory with these variables.");
  process.exit(1);
}

console.log("Starting backend server...");
console.log("PORT:", process.env.PORT);
console.log("MONGO_URL:", process.env.MONGO_URL ? "configured" : "NOT SET");
console.log("FRONTEND_URL:", process.env.FRONTEND_URL ? "configured" : "NOT SET");

// Add simple error handlers
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION:", reason);
});

const app = express();
const PORT = process.env.PORT;

console.log("Express app created, setting up middleware...");

// Add request timeout middleware
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    logger.warn('Request timeout', { method: req.method, url: req.originalUrl });
    res.status(504).json({ message: 'Request timeout' });
  });
  next();
});

app.use(express.json());
app.use(requestLogger);
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://medi-vault-amber.vercel.app"
    ],
    credentials: true
  })
);

// Serve static files for uploads
app.use("/uploads", express.static("uploads"));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log("MongoDB Connected");
    logger.info("MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    logger.error("MongoDB connection failed", { error: err.message, stack: err.stack });
    // Don't exit, let the app run in case DB comes back online
  });

//sendEmail("agarwalsonali922@gmail.com", "Test Email", "Hello OTP Test");

console.log("Mounting routes...");

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/notifications", notificationRoutes);
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

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

console.log("All routes mounted, starting server...");

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  logger.info(`Server running on port ${PORT}`);
});