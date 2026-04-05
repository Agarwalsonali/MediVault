import User from "../models/user.js";
import cloudinary from "../utils/cloudinary.js";

/**
 * Get logged-in patient's profile
 * GET /api/profile
 */
export const getPatientProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select(
      "fullName email age gender bloodGroup allergies role isVerified avatar createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if profile is complete
    const isProfileComplete = !!(user.age && user.gender && user.bloodGroup);

    res.status(200).json({
      message: "Profile retrieved successfully",
      profile: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        age: user.age,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        allergies: user.allergies || "",
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatarUrl,
        createdAt: user.createdAt,
        isProfileComplete
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update logged-in patient's profile
 * PUT /api/profile
 */
export const updatePatientProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { age, gender, bloodGroup, allergies } = req.body;

    // Validate age if provided
    if (age !== undefined && age !== null) {
      const ageNum = parseInt(age, 10);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
        return res.status(400).json({
          message: "Age must be a number between 0 and 150"
        });
      }
    }

    // Validate gender if provided
    if (gender !== undefined && gender !== null) {
      const validGenders = ["Male", "Female", "Other"];
      if (!validGenders.includes(gender)) {
        return res.status(400).json({
          message: `Gender must be one of: ${validGenders.join(", ")}`
        });
      }
    }

    // Validate blood group if provided
    if (bloodGroup !== undefined && bloodGroup !== null) {
      const validBloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
      if (!validBloodGroups.includes(bloodGroup)) {
        return res.status(400).json({
          message: `Blood group must be one of: ${validBloodGroups.join(", ")}`
        });
      }
    }

    // Build update object with only provided fields
    const updateData = {};
    if (age !== undefined) updateData.age = age ? parseInt(age, 10) : null;
    if (gender !== undefined) updateData.gender = gender || null;
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup || null;
    if (allergies !== undefined) updateData.allergies = allergies ? allergies.trim() : "";

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select(
      "fullName email age gender bloodGroup allergies role isVerified avatar createdAt"
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if profile is complete
    const isProfileComplete = !!(updatedUser.age && updatedUser.gender && updatedUser.bloodGroup);

    res.status(200).json({
      message: "Profile updated successfully",
      profile: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        age: updatedUser.age,
        gender: updatedUser.gender,
        bloodGroup: updatedUser.bloodGroup,
        allergies: updatedUser.allergies || "",
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        avatar: updatedUser.avatarUrl,
        createdAt: updatedUser.createdAt,
        isProfileComplete
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Upload user avatar
 * POST /api/profile/avatar
 */
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log("🔵 Avatar upload started for user:", userId);
    console.log("📦 File info:", req.file ? { filename: req.file.filename, path: req.file.path } : "No file");

    if (!req.file) {
      console.warn("⚠️ No file provided in request");
      return res.status(400).json({ message: "No file provided" });
    }

    // req.file.path is the Cloudinary secure URL
    const avatarUrl = req.file.path;
    console.log("✅ Avatar URL from Cloudinary:", avatarUrl);

    // Update user avatar
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatarUrl },
      { new: true }
    ).select(
      "fullName email age gender bloodGroup allergies role isVerified avatarUrl createdAt"
    );

    if (!updatedUser) {
      console.error("❌ User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Check if profile is complete
    const isProfileComplete = !!(updatedUser.age && updatedUser.gender && updatedUser.bloodGroup);

    console.log("✅ Avatar uploaded successfully for user:", userId);
    res.status(200).json({
      message: "Avatar uploaded successfully",
      profile: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        age: updatedUser.age,
        gender: updatedUser.gender,
        bloodGroup: updatedUser.bloodGroup,
        allergies: updatedUser.allergies || "",
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        avatar: updatedUser.avatarUrl,
        createdAt: updatedUser.createdAt,
        isProfileComplete
      }
    });
  } catch (error) {
    console.error("❌ uploadAvatar error:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ message: `Upload error: ${error.message}` });
  }
};

/**
 * Delete user avatar
 * DELETE /api/profile/avatar
 */
export const deleteAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log("🔵 Avatar deletion started for user:", userId);

    // Get current user to fetch avatar info
    const user = await User.findById(userId);
    
    if (!user) {
      console.error("❌ User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.avatarUrl) {
      console.warn("⚠️ No avatar to delete for user:", userId);
      return res.status(400).json({ message: "No avatar to delete" });
    }

    // Delete from Cloudinary
    try {
      // Extract public_id from the URL if needed
      const publicId = `avatar-${userId}`;
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" }).catch(() => {});
      console.log("✅ Avatar deleted from Cloudinary");
    } catch (err) {
      console.warn("⚠️ Could not delete avatar from Cloudinary:", err.message);
      // Continue anyway - we still want to update the user
    }

    // Update user to remove avatar URL
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatarUrl: null },
      { new: true }
    ).select(
      "fullName email age gender bloodGroup allergies role isVerified avatarUrl createdAt"
    );

    console.log("✅ Avatar removed successfully for user:", userId);
    res.status(200).json({
      message: "Avatar removed successfully",
      profile: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        age: updatedUser.age,
        gender: updatedUser.gender,
        bloodGroup: updatedUser.bloodGroup,
        allergies: updatedUser.allergies || "",
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        avatar: updatedUser.avatarUrl,
        createdAt: updatedUser.createdAt,
        isProfileComplete: !!(updatedUser.age && updatedUser.gender && updatedUser.bloodGroup)
      }
    });
  } catch (error) {
    console.error("❌ deleteAvatar error:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ message: `Delete error: ${error.message}` });
  }
};

/**
 * Get patient's reports by patient (linked to logged-in patient)
 * GET /api/profile/reports
 */
export const getPatientReports = async (req, res) => {
  try {
    const Report = await import("../models/report.js").then(m => m.default);
    const Patient = await import("../models/patient.js").then(m => m.default);
    
    const userId = req.user.id;

    // Find the patient created by this user
    // Note: This assumes patient model has createdBy field linking to user
    const patient = await Patient.findOne({ createdBy: userId });

    if (!patient) {
      // No patient created by this user, return empty
      return res.status(200).json({
        message: "No reports found",
        count: 0,
        reports: []
      });
    }

    const reports = await Report.find({ patientId: patient._id })
      .select("_id reportName reportType reportDate fileName fileUrl mimeType uploadedBy doctorName notes createdAt")
      .populate("uploadedBy", "fullName")
      .sort({ reportDate: -1 });

    res.status(200).json({
      message: "Reports retrieved successfully",
      count: reports.length,
      reports,
      patientInfo: {
        _id: patient._id,
        name: patient.name,
        patientId: patient.patientId
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
