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

  emailVerificationOtp: {
    type: String
  },

  emailVerificationExpires: {
    type: Date
  },

   otp: {
        type: String
    },

    otpExpires: {
        type: Date
    }

}, { timestamps: true });


export default mongoose.model("User", userSchema);