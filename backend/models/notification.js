import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  recipientRole: {
    type: String,
    enum: ["Admin", "Doctor", "Nurse", "Staff", "Patient"],
    required: true,
    index: true
  },

  type: {
    type: String,
    enum: [
      // Patient notifications
      "REPORT_UPLOADED",
      "REPORT_SHARED",
      "REPORT_DELETED",
      
      // Staff notifications
      "NEW_PATIENT_REPORT",
      "PATIENT_UPLOADED_REPORT",
      "REPORT_SHARED_WITH_YOU",
      
      // Admin notifications
      "NEW_STAFF_CREATED",
      "STAFF_DELETED",
      "STAFF_UPDATED",
      "SUSPICIOUS_LOGIN",
      "ACCOUNT_LOCKED",
      "FAILED_LOGIN_ATTEMPTS",
      
      // System notifications
      "SYSTEM_ALERT",
      "MAINTENANCE",
      "VERIFICATION_REQUIRED"
    ],
    required: true,
    index: true
  },

  title: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  actionUrl: {
    type: String,
    default: null
  },

  relatedResourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },

  relatedResourceType: {
    type: String,
    enum: ["Report", "User", "Patient", "Activity"],
    default: null
  },

  isRead: {
    type: Boolean,
    default: false,
    index: true
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 2592000 // Auto-delete after 30 days
  }
});

export default mongoose.model("Notification", notificationSchema);
