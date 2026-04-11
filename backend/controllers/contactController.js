import Contact from "../models/contact.js";
import { sendSupportRequestNotificationEmail } from "../utils/sendEmail.js";
import { contactLogger } from "../utils/logger.js";
import { sanitizeString, sanitizeEmail } from "../utils/sanitizer.js";

const ALLOWED_ROLES = ["Patient", "Staff"];
const ALLOWED_ISSUE_TYPES = ["Bug", "Feedback", "Report Issue", "Other"];

const resolveAdminRecipients = () => {
  const configured = [
    process.env.CONTACT_ADMIN_EMAIL,
    process.env.ADMIN_EMAIL,
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return [...new Set(configured)];
};

export const createContactMessage = async (req, res) => {
  try {
    let { name, email, role, issueType, message } = req.body;

    // Sanitize all inputs
    name = sanitizeString(name);
    email = sanitizeEmail(email);
    role = sanitizeString(role);
    issueType = sanitizeString(issueType);
    message = sanitizeString(message);

    if (!name || !email || !role || !issueType || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Use Patient or Staff." });
    }

    if (!ALLOWED_ISSUE_TYPES.includes(issueType)) {
      return res.status(400).json({ message: "Invalid issue type." });
    }

    await Contact.create({
      name,
      email,
      role,
      issueType,
      message,
    });

    const recipients = resolveAdminRecipients();
    if (recipients.length === 0) {
      return res.status(500).json({
        message: "Support inbox is not configured on server.",
      });
    }

    try {
      await sendSupportRequestNotificationEmail({
        to: recipients.join(","),
        name,
        email,
        role,
        issueType,
        message,
        submittedAt: new Date().toLocaleString(),
      });
    } catch (emailError) {
      contactLogger.error("Contact admin notification failed", { error: emailError.message });
      return res.status(502).json({
        message: "Message saved, but admin notification email failed. Please try again.",
      });
    }

    return res.status(201).json({ message: "Support request submitted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
