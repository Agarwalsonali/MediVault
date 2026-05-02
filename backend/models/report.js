import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    patientId:  { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uploadedByRole: {
      type: String,
      enum: ["ADMIN", "STAFF", "PATIENT"],
      default: "STAFF",
      required: true,
    },
    uploaded_by: {
      type: String,
      enum: ["ADMIN", "STAFF", "PATIENT"],
      default: "STAFF",
      required: true,
    },
    verified: {
      type: Boolean,
      default: true,
    },
    reportName: { type: String, required: true },
    reportType: { type: String, default: "Other" },
    reportDate: { type: Date, default: Date.now },
    doctorName: { type: String, default: "" },
    notes:      { type: String, default: "" },
    fileUrl:    { type: String, required: true },  // ← Cloudinary HTTPS link
    publicId:   { type: String, default: "" },      // ← Cloudinary public_id
    fileName:   { type: String, required: true },
    fileSize:   { type: Number },
    mimeType:   { type: String },
    
    // Encryption metadata
    encryptionIv: {
      type: String,
      default: null,                                 // ← Hex string (16 bytes) of IV used for encryption
    },
    isEncrypted: {
      type: Boolean,
      default: true,                                 // ← Whether file is encrypted
    },
  },
  { timestamps: true }
);

// Rule:
// PATIENT uploads are always unverified.
// ADMIN/STAFF uploads are always verified.
reportSchema.pre("validate", function setVerificationByUploaderRole() {
  if (!this.uploaded_by && this.uploadedByRole) {
    this.uploaded_by = this.uploadedByRole;
  }

  if (!this.uploadedByRole && this.uploaded_by) {
    this.uploadedByRole = this.uploaded_by;
  }

  // Keep both fields synchronized
  if (this.uploadedByRole) {
    this.uploaded_by = this.uploadedByRole;
  } else if (this.uploaded_by) {
    this.uploadedByRole = this.uploaded_by;
  }

  if (this.uploadedByRole === "PATIENT") {
    this.verified = false;
  } else if (this.uploadedByRole === "ADMIN" || this.uploadedByRole === "STAFF") {
    this.verified = true;
  }
});

export default mongoose.model("Report", reportSchema);