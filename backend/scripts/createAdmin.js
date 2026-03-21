import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/user.js";

dotenv.config();

const requiredEnv = ["MONGO_URL", "ADMIN_FULL_NAME", "ADMIN_EMAIL", "ADMIN_PASSWORD"];

const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const fullName = process.env.ADMIN_FULL_NAME.trim();
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    const replaceExisting = String(process.env.ADMIN_REPLACE_EXISTING || "false").toLowerCase() === "true";

    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.role === "Admin") {
        console.log("Admin account already exists for this email.");
        return;
      }

      if (!replaceExisting) {
        console.log(`A non-admin user already exists with email ${email}. No changes made.`);
        console.log("Set ADMIN_REPLACE_EXISTING=true to delete and recreate this user as Admin.");
        return;
      } else {
        await User.deleteOne({ _id: existing._id });
        console.log(`Deleted existing non-admin user with email ${email}.`);
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "Admin",
      isVerified: true,
      emailOtp: null,
      emailOtpExpires: null,
    });

    console.log(`Admin user created successfully for ${email}`);
  } catch (error) {
    console.error(`Failed to create admin: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
