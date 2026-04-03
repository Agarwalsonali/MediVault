import Contact from "../models/contact.js";
import { sendEmail } from "../utils/sendEmail.js";

const ALLOWED_ROLES = ["Patient", "Staff"];
const ALLOWED_ISSUE_TYPES = ["Bug", "Feedback", "Report Issue", "Other"];

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

    const adminEmail = process.env.CONTACT_ADMIN_EMAIL?.trim();
    if (adminEmail) {
      try {
        const subject = `[MediVault Support] ${normalizedIssueType} from ${normalizedName}`;
        const text = `New support request received.\n\nName: ${normalizedName}\nEmail: ${normalizedEmail}\nRole: ${normalizedRole}\nIssue Type: ${normalizedIssueType}\n\nMessage:\n${normalizedMessage}`;
        const html = `
          <h2>New Support Request</h2>
          <p><strong>Name:</strong> ${normalizedName}</p>
          <p><strong>Email:</strong> ${normalizedEmail}</p>
          <p><strong>Role:</strong> ${normalizedRole}</p>
          <p><strong>Issue Type:</strong> ${normalizedIssueType}</p>
          <p><strong>Message:</strong></p>
          <p>${normalizedMessage.replace(/\n/g, "<br />")}</p>
        `;

        await sendEmail(adminEmail, subject, text, html);
      } catch (emailError) {
        console.error("Contact admin notification failed:", emailError.message);
      }
    }

    return res.status(201).json({ message: "Support request submitted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
