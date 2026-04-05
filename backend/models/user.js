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
    required: false,
    minlength: 6
  },

  role: {
    type: String,
    enum: ["Doctor", "Nurse", "Staff", "Admin", "Patient"],
    default: "Patient"
  },

  avatarUrl: {
    type: String,
    trim: true,
    default: ""
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
  },

  inviteToken: {
    type: String
  },

  inviteTokenExpires: {
    type: Date
  },

  isInviteAccepted: {
    type: Boolean,
    default: false
  },

  // Patient profile fields (optional for all users, but mainly used for Patient role)
  age: {
    type: Number,
    min: 0,
    max: 150,
    default: null
  },

  gender: {
    type: String,
    enum: [null, "Male", "Female", "Other"],
    default: null
  },

  bloodGroup: {
    type: String,
    enum: [null, "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    default: null
  },

  allergies: {
    type: String,
    trim: true,
    default: ""
  }

}, { timestamps: true });


export default mongoose.model("User", userSchema);