import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import {
  sendVerificationOtpEmail,
  sendLoginOtpEmail,
  sendPasswordResetOtpEmail,
  sendInviteEmail,
} from "../utils/sendEmail.js";
import { generate6DigitOtp } from "../utils/otp.js";
import { validatePassword } from "../utils/passwordValidator.js";
import { authLogger } from "../utils/logger.js";

const STAFF_ROLES = ["Staff", "Nurse"];
const AVATARS_DIR = path.join(process.cwd(), "uploads", "avatars");

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    if (role === "Admin") {
      return res.status(403).json({ message: "Admin role cannot be assigned via signup" });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: "Password does not meet requirements",
        errors: passwordValidation.errors 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const emailOtp = generate6DigitOtp();
    const emailOtpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    await User.create({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "Patient",
      isVerified: false,
      isInviteAccepted: true,
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

    if (STAFF_ROLES.includes(user.role) && !user.isInviteAccepted) {
      return res.status(403).json({ message: "Please complete account setup from email" });
    }

    if (!user.password) {
      return res.status(403).json({ message: "Please complete account setup from email" });
    }

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
      { id: user._id, role: user.role, fullName: user.fullName },
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

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: "Password does not meet requirements",
        errors: passwordValidation.errors 
      });
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

export const createStaffAccount = async (req, res) => {
  try {
    const { fullName, email, role } = req.body;

    if (!fullName || !email || !role) {
      return res.status(400).json({ message: "fullName, email and role are required" });
    }

    if (!STAFF_ROLES.includes(role)) {
      return res.status(400).json({ message: "Staff role must be Staff or Nurse" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const frontendBaseUrl = process.env.FRONTEND_URL?.trim();
    if (!frontendBaseUrl) {
      return res.status(500).json({ message: "FRONTEND_URL is not configured on server" });
    }

    const inviteLink = `${frontendBaseUrl.replace(/\/+$/, "")}/set-password?token=${inviteToken}`;
    if (String(process.env.LOG_INVITE_LINK || "false").toLowerCase() === "true") {
      authLogger.info("Staff invite link generated", { email: normalizedEmail, inviteLink });
    }

    const staffUser = await User.create({
      fullName,
      email: normalizedEmail,
      role,
      isVerified: true,
      isInviteAccepted: false,
      password: undefined,
      inviteToken,
      inviteTokenExpires,
      emailOtp: null,
      emailOtpExpires: null
    });

    await sendInviteEmail(normalizedEmail, inviteLink);

    return res.status(201).json({
      message: `${role} account created and invite email sent successfully`,
      user: {
        id: staffUser._id,
        fullName: staffUser.fullName,
        email: staffUser.email,
        role: staffUser.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const setPasswordFromInvite = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "token and password are required" });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: "Password does not meet requirements",
        errors: passwordValidation.errors 
      });
    }

    const user = await User.findOne({ inviteToken: token });
    if (!user) {
      return res.status(400).json({ message: "Invalid invite token" });
    }

    if (!user.inviteTokenExpires || user.inviteTokenExpires < new Date()) {
      return res.status(400).json({ message: "Invite token has expired" });
    }

    if (user.isInviteAccepted) {
      return res.status(400).json({ message: "Invite has already been used" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.isInviteAccepted = true;
    user.inviteToken = null;
    user.inviteTokenExpires = null;
    await user.save();

    return res.status(200).json({ message: "Password set successfully. You can now login." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("fullName email role avatarUrl");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || "",
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailOwner = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
    if (emailOwner) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    user.fullName = fullName?.trim() || user.fullName;
    user.email = normalizedEmail;

    if (password && password.trim()) {
      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          message: "Password does not meet requirements",
          errors: passwordValidation.errors 
        });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || "",
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const uploadMyProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(404).json({ message: "User not found" });
    }

    await fs.mkdir(AVATARS_DIR, { recursive: true });

    const ext = path.extname(req.file.originalname || "").toLowerCase() || ".jpg";
    const fileName = `${user._id}-${Date.now()}${ext}`;
    const destinationPath = path.join(AVATARS_DIR, fileName);

    await fs.rename(req.file.path, destinationPath);

    if (user.avatarUrl && user.avatarUrl.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(process.cwd(), user.avatarUrl.replace(/^\//, ""));
      await fs.unlink(oldPath).catch(() => {});
    }

    user.avatarUrl = `/uploads/avatars/${fileName}`;
    await user.save();

    return res.status(200).json({
      message: "Profile image updated successfully",
      avatarUrl: user.avatarUrl,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    return res.status(500).json({ message: error.message });
  }
};

export const removeMyProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.avatarUrl && user.avatarUrl.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(process.cwd(), user.avatarUrl.replace(/^\//, ""));
      await fs.unlink(oldPath).catch(() => {});
    }

    user.avatarUrl = "";
    await user.save();

    return res.status(200).json({
      message: "Profile image removed successfully",
      avatarUrl: "",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: "",
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getStaffList = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: STAFF_ROLES } })
      .select("fullName email role createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({ staff });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateStaffMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, role } = req.body;

    if (!fullName || !email || !role) {
      return res.status(400).json({ message: "fullName, email and role are required" });
    }

    if (!STAFF_ROLES.includes(role)) {
      return res.status(400).json({ message: "Role must be Staff or Nurse" });
    }

    const staff = await User.findById(id);
    if (!staff) {
      return res.status(404).json({ message: "Staff user not found" });
    }

    if (!STAFF_ROLES.includes(staff.role)) {
      return res.status(400).json({ message: "Only Nurse or Staff users can be updated" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const duplicate = await User.findOne({ email: normalizedEmail, _id: { $ne: staff._id } });
    if (duplicate) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    staff.fullName = fullName.trim();
    staff.email = normalizedEmail;
    staff.role = role;

    await staff.save();

    return res.status(200).json({
      message: "Staff updated successfully",
      user: {
        id: staff._id,
        fullName: staff.fullName,
        email: staff.email,
        role: staff.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteStaffMember = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await User.findById(id);
    if (!staff) {
      return res.status(404).json({ message: "Staff user not found" });
    }

    if (!STAFF_ROLES.includes(staff.role)) {
      return res.status(400).json({ message: "Only Nurse or Staff users can be deleted" });
    }

    await User.deleteOne({ _id: staff._id });

    return res.status(200).json({ message: "Staff deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};