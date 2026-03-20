import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true,
    minlength: 6
  },

  role: {
    type: String,
    enum: ["Doctor", "Nurse", "Admin", "Patient"],
    default: "Patient"
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  // Email verification (OTP after signup)
  emailOtp: {
    type: String
  },

  emailOtpExpires: {
    type: Date
  },

  // Login 2FA OTP (OTP after password when is2FAEnabled === true)
  loginOtp: {
    type: String
  },

  loginOtpExpires: {
    type: Date
  },

  is2FAEnabled: {
    type: Boolean,
    default: true
  },

  // Password reset OTP (separate so it doesn't conflict with login 2FA)
  passwordResetOtp: {
    type: String
  },

  passwordResetOtpExpires: {
    type: Date
  }

}, { timestamps: true });


export default mongoose.model("User", userSchema);