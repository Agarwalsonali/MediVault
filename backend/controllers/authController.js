import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  sendVerificationOtpEmail,
  sendLoginOtpEmail,
  sendPasswordResetOtpEmail,
} from "../utils/sendEmail.js";
import { generate6DigitOtp } from "../utils/otp.js";

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const emailOtp = generate6DigitOtp();
    const emailOtpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    await User.create({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "Patient", // default role
      isVerified: false,
      emailOtp,
      emailOtpExpires
    });

    await sendVerificationOtpEmail(normalizedEmail, emailOtp);

    res.status(201).json({
      message: "Registered successfully. Please verify your email.",
      email: normalizedEmail
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    // Enforce OTP-based 2FA after password for every user.
    user.is2FAEnabled = true;

    const loginOtp = generate6DigitOtp();
    user.loginOtp = loginOtp;
    user.loginOtpExpires = Date.now() + 5 * 60 * 1000; // 5 mins
    await user.save();

    await sendLoginOtpEmail(normalizedEmail, loginOtp);

    return res.json({
      message: "Login OTP sent to your email",
      twoFactorRequired: true,
      fullName: user.fullName,
      role: user.role
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    const storedLoginOtp = user?.loginOtp ?? user?.otp;
    const storedLoginOtpExpires = user?.loginOtpExpires ?? user?.otpExpires;
    if (
      !user ||
      !storedLoginOtp ||
      storedLoginOtp !== otp ||
      !storedLoginOtpExpires ||
      storedLoginOtpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.loginOtp = null;
    user.loginOtpExpires = null;
    await user.save();
    // Also clear legacy OTP fields if they existed from the old schema
    await User.updateOne(
      { _id: user._id },
      { $unset: { otp: 1, otpExpires: 1 } }
    );

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      fullName: user.fullName
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "User not found" });

    const passwordResetOtp = generate6DigitOtp();

    user.passwordResetOtp = passwordResetOtp;
    user.passwordResetOtpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendPasswordResetOtpEmail(normalizedEmail, passwordResetOtp);

    return res.json({ message: "Reset OTP sent to email" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    const storedPasswordResetOtp = user?.passwordResetOtp ?? user?.otp;
    const storedPasswordResetOtpExpires = user?.passwordResetOtpExpires ?? user?.otpExpires;
    if (
      !user ||
      !storedPasswordResetOtp ||
      storedPasswordResetOtp !== otp ||
      !storedPasswordResetOtpExpires ||
      storedPasswordResetOtpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.passwordResetOtp = null;
    user.passwordResetOtpExpires = null;
    await user.save();
    // Also clear legacy reset OTP fields if they existed from the old schema
    await User.updateOne(
      { _id: user._id },
      { $unset: { otp: 1, otpExpires: 1 } }
    );

    return res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(200).json({ message: "Email already verified" });
    }

    if (
      !user.emailOtp ||
      user.emailOtp !== otp ||
      !user.emailOtpExpires ||
      user.emailOtpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

  
    user.isVerified = true;
    user.emailOtp = null;
    user.emailOtpExpires = null;

    await user.save();

    return res.status(200).json({
      message: "Email verified successfully"
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const resendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const emailOtp = generate6DigitOtp();
    const emailOtpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    user.emailOtp = emailOtp;
    user.emailOtpExpires = emailOtpExpires;
    await user.save();

    await sendVerificationOtpEmail(normalizedEmail, emailOtp);

    return res.status(200).json({ message: "Verification OTP resent to your email" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};