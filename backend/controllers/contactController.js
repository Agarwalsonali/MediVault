import Contact from "../models/contact.js";
import { sendSupportRequestNotificationEmail } from "../utils/sendEmail.js";

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
    const { name, email, role, issueType, message } = req.body;

    const normalizedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedRole = role?.trim();
    const normalizedIssueType = issueType?.trim();
    const normalizedMessage = message?.trim();

    if (!normalizedName || !normalizedEmail || !normalizedRole || !normalizedIssueType || !normalizedMessage) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!ALLOWED_ROLES.includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role. Use Patient or Staff." });
    }

    if (!ALLOWED_ISSUE_TYPES.includes(normalizedIssueType)) {
      return res.status(400).json({ message: "Invalid issue type." });
    }

    await Contact.create({
      name: normalizedName,
      email: normalizedEmail,
      role: normalizedRole,
      issueType: normalizedIssueType,
      message: normalizedMessage,
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
        name: normalizedName,
        email: normalizedEmail,
        role: normalizedRole,
        issueType: normalizedIssueType,
        message: normalizedMessage,
        submittedAt: new Date().toLocaleString(),
      });
    } catch (emailError) {
      console.error("Contact admin notification failed:", emailError.message);
      return res.status(502).json({
        message: "Message saved, but admin notification email failed. Please try again.",
      });
    }

    return res.status(201).json({ message: "Support request submitted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
