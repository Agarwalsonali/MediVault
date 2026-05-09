import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  userName: {
    type: String,
    required: true
  },

  userRole: {
    type: String,
    enum: ["Admin", "Doctor", "Nurse", "Staff", "Patient"],
    required: true
  },

  action: {
    type: String,
    enum: [
      "LOGIN",
      "LOGOUT",
      "LOGIN_FAILED",
      "ACCOUNT_LOCKED",
      "ACCOUNT_UNLOCKED",
      "PASSWORD_RESET",
      "PROFILE_UPDATE",
      "UPLOAD_FILE",
      "DELETE_FILE",
      "DOWNLOAD_FILE",
      "SHARE_REPORT",
      "CREATE_STAFF",
      "DELETE_STAFF",
      "UPDATE_STAFF",
      "UPDATE_PATIENT",
      "DELETE_PATIENT",
      "EMAIL_VERIFIED",
      "INVITE_SENT",
      "OTP_VERIFIED"
    ],
    required: true,
    index: true
  },

  resourceType: {
    type: String,
    enum: ["USER", "REPORT", "PATIENT", "STAFF", "CONTACT", "SYSTEM"],
    default: "SYSTEM"
  },

  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },

  resourceName: {
    type: String,
    default: null
  },

  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  ipAddress: {
    type: String,
    default: null
  },

  userAgent: {
    type: String,
    default: null
  },

  status: {
    type: String,
    enum: ["SUCCESS", "FAILED", "PENDING"],
    default: "SUCCESS"
  },

  errorMessage: {
    type: String,
    default: null
  },

  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },

  duration: {
    type: Number,
    default: null  // milliseconds
  }
}, { timestamps: false });

// Create indexes for common queries
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ userRole: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ resourceType: 1, resourceId: 1 });

export default mongoose.model("ActivityLog", activityLogSchema);
