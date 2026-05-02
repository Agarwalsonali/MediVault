import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import Report from "../models/report.js";
import {
  sendVerificationOtpEmail,
  sendPasswordResetOtpEmail,
  sendInviteEmail,
  sendSecurityAlertEmail,
} from "../utils/sendEmail.js";
import { generate6DigitOtp } from "../utils/otp.js";
import { validatePassword } from "../utils/passwordValidator.js";
import { authLogger } from "../utils/logger.js";
import { sanitizeString, sanitizeEmail } from "../utils/sanitizer.js";

const STAFF_ROLES = ["Staff", "Nurse"];
const AVATARS_DIR = path.join(process.cwd(), "uploads", "avatars");

export const registerUser = async (req, res) => {
  try {
    let { fullName, email, password, role } = req.body;
    
    // Sanitize inputs
    fullName = sanitizeString(fullName);
    email = sanitizeEmail(email);
    role = sanitizeString(role || "Patient");

    if (role === "Admin") {
      return res.status(403).json({ message: "Admin role cannot be assigned via signup" });
    }

    const userExists = await User.findOne({ email });
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
      email,
      password: hashedPassword,
      role: "Patient",
      isVerified: false,
      isInviteAccepted: true,
      emailOtp,
      emailOtpExpires
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
    let { email, password } = req.body;
    
    // Sanitize inputs
    email = sanitizeEmail(email);

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const timeRemaining = Math.ceil((user.lockUntil - new Date()) / 60000); // minutes
      authLogger.warn(`Login attempt on locked account: ${email}`);
      return res.status(429).json({ 
        message: `Account temporarily locked. Try again in ${timeRemaining} minute(s).`,
        lockedUntil: user.lockUntil
      });
    }

    // Reset lock if it has expired
    if (user.lockUntil && user.lockUntil <= new Date()) {
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
    }

    if (STAFF_ROLES.includes(user.role) && !user.isInviteAccepted) {
      return res.status(403).json({ message: "Please complete account setup from email" });
    }

    if (!user.password) {
      return res.status(403).json({ message: "Please complete account setup from email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed login attempts
      user.failedLoginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();
        
        // Log security warning
        authLogger.warn(`Account locked due to multiple failed login attempts: ${email}`, {
          failedAttempts: user.failedLoginAttempts,
          lockedUntil: user.lockUntil
        });
        
        // Send security alert email
        try {
          await sendSecurityAlertEmail(email, user.fullName);
        } catch (emailError) {
          authLogger.error(`Failed to send security alert email to ${email}`, { error: emailError.message });
        }
        
        return res.status(429).json({ 
          message: "Account temporarily locked due to multiple failed login attempts. Please try again in 15 minutes.",
          lockedUntil: user.lockUntil
        });
      }
      
      await user.save();
      authLogger.warn(`Failed login attempt for user: ${email}`, { 
        attemptNumber: user.failedLoginAttempts 
      });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    // Successful login - reset failed attempts and lock
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();
    
    authLogger.info(`Successful login: ${email}`);

    // Issue JWT token directly - no OTP required for login
    const token = jwt.sign(
      { id: user._id, role: user.role, fullName: user.fullName },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      role: user.role,
      fullName: user.fullName
    });

  } catch (error) {
    authLogger.error("Login error", { error: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
};


export const verifyOTP = async (req, res) => {
  try {
    let { email, otp } = req.body;
    
    // Sanitize inputs
    email = sanitizeEmail(email);
    otp = sanitizeString(otp);

    const user = await User.findOne({ email });
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
    let { email } = req.body;
    
    // Sanitize input
    email = sanitizeEmail(email);

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const passwordResetOtp = generate6DigitOtp();

    user.passwordResetOtp = passwordResetOtp;
    user.passwordResetOtpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendPasswordResetOtpEmail(email, passwordResetOtp);

    return res.json({ message: "Reset OTP sent to email" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const resetPassword = async (req, res) => {
  try {
    let { email, otp, newPassword } = req.body;
    
    // Sanitize inputs
    email = sanitizeEmail(email);
    otp = sanitizeString(otp);

    const user = await User.findOne({ email });
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
    let { email, otp } = req.body;
    
    // Sanitize inputs
    email = sanitizeEmail(email);
    otp = sanitizeString(otp);

    const user = await User.findOne({ email });
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
    let { email } = req.body;
    
    // Sanitize input
    email = sanitizeEmail(email);

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const emailOtp = generate6DigitOtp();
    const emailOtpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    user.emailOtp = emailOtp;
    user.emailOtpExpires = emailOtpExpires;
    await user.save();

    await sendVerificationOtpEmail(email, emailOtp);

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
    let { fullName, email, role } = req.body;

    // Sanitize inputs
    fullName = sanitizeString(fullName);
    email = sanitizeEmail(email);
    role = sanitizeString(role);

    if (!fullName || !email || !role) {
      return res.status(400).json({ message: "fullName, email and role are required" });
    }

    if (!STAFF_ROLES.includes(role)) {
      return res.status(400).json({ message: "Staff role must be Staff or Nurse" });
    }

    const userExists = await User.findOne({ email });
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
      authLogger.info("Staff invite link generated", { email, inviteLink });
    }

    const staffUser = await User.create({
      fullName,
      email,
      role,
      isVerified: true,
      isInviteAccepted: false,
      password: undefined,
      inviteToken,
      inviteTokenExpires,
      emailOtp: null,
      emailOtpExpires: null
    });

    await sendInviteEmail(email, inviteLink);

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
    let { token, password } = req.body;

    // Sanitize token
    token = sanitizeString(token);

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
    let { fullName, email, password } = req.body;

    // Sanitize inputs
    if (fullName) fullName = sanitizeString(fullName);
    if (email) email = sanitizeEmail(email);

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const emailOwner = await User.findOne({ email, _id: { $ne: user._id } });
    if (emailOwner) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    user.fullName = fullName || user.fullName;
    user.email = email;

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

// Get admin dashboard statistics
export const getAdminDashboardStats = async (req, res) => {
  try {
    // Total staff count (Nurse + Staff roles)
    const totalStaff = await User.countDocuments({ 
      role: { $in: ["Nurse", "Staff"] } 
    });

    // New staff this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newStaffThisMonth = await User.countDocuments({
      role: { $in: ["Nurse", "Staff"] },
      createdAt: { $gte: startOfMonth }
    });

    // Total active patients (users with role = Patient)
    const totalPatients = await User.countDocuments({ role: "Patient" });

    // Recent activity (last 10 events: staff created + reports uploaded)
    const recentStaffCreate = await User.find({ 
      role: { $in: ["Nurse", "Staff"] } 
    })
      .select("fullName createdAt role")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentReports = await Report.find()
      .populate("patientId", "name")
      .populate("uploadedBy", "fullName role")
      .select("reportName createdAt uploadedBy patientId")
      .sort({ createdAt: -1 })
      .limit(5);

    // Build activity feed
    const activityFeed = [];

    // Add staff creations
    recentStaffCreate.forEach(staff => {
      activityFeed.push({
        type: "staff_created",
        text: `New ${staff.role} account created: ${staff.fullName}`,
        timestamp: staff.createdAt,
        role: staff.role
      });
    });

    // Add recent reports
    recentReports.forEach(report => {
      activityFeed.push({
        type: "report_uploaded",
        text: `Report uploaded for Patient: ${report.reportName}`,
        timestamp: report.createdAt,
        role: "report"
      });
    });

    // Sort by timestamp and take top 10
    activityFeed.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

    return res.status(200).json({
      message: "Dashboard stats retrieved successfully",
      stats: {
        totalStaff,
        newStaffThisMonth,
        totalPatients,
        recentActivity: activityFeed
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};