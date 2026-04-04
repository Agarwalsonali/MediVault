import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    patientId:  { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reportName: { type: String, required: true },
    reportType: { type: String, required: true },
    reportDate: { type: Date, required: true },
    doctorName: { type: String, default: "" },
    notes:      { type: String, default: "" },
    fileUrl:    { type: String, required: true },  // ← Cloudinary HTTPS link
    publicId:   { type: String, default: "" },      // ← Cloudinary public_id
    fileName:   { type: String, required: true },
    fileSize:   { type: Number },
    mimeType:   { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);