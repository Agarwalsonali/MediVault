import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail, sendVerificationOtpEmail } from "../utils/sendEmail.js";

const generate6DigitOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const emailOtp = generate6DigitOtp();
    const emailOtpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "Patient", // default role
      isVerified: false,
      emailVerificationOtp: emailOtp,
      emailVerificationExpires: emailOtpExpires
    });

    await sendVerificationOtpEmail(email, emailOtp);

    res.status(201).json({
      message: "Registered successfully. Please verify your email.",
      email
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    const otp = generate6DigitOtp();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
    await user.save();

    await sendEmail(email, "Your OTP Code", `Your OTP is ${otp}`);

    res.json({ message: "OTP sent to your email" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendEmail(email, "Password Reset OTP", `Your OTP is ${otp}`);

    res.json({ message: "Reset OTP sent to email" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    if (
      !user.emailVerificationOtp ||
      user.emailVerificationOtp !== otp ||
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.emailVerificationOtp = null;
    user.emailVerificationExpires = null;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const resendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const emailOtp = generate6DigitOtp();
    const emailOtpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    user.emailVerificationOtp = emailOtp;
    user.emailVerificationExpires = emailOtpExpires;
    await user.save();

    await sendVerificationOtpEmail(email, emailOtp);

    return res.status(200).json({ message: "Verification OTP resent to your email" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};