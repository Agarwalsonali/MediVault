import nodemailer from 'nodemailer'

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

export const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"MediVault" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });
    console.log("Email sent successfully to", to);
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
};

/* ─────────────────────────────────────────
   SHARED EMAIL WRAPPER
   All emails share this base shell.
───────────────────────────────────────── */
function emailShell({ preheader = '', body = '' }) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>MediVault</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #f1f5f9; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    img { max-width: 100%; height: auto; }
    .email-body { background: #f1f5f9; padding: 40px 16px; }
    .container { max-width: 560px; margin: 0 auto; }
    .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(10,22,40,0.08); width: 100%; }
    .header { background: #0a1628; padding: 28px 32px; }
    .header-inner { display: flex; align-items: center; gap: 12px; }
    .logo-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0d9488, #2dd4bf);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      box-shadow: 0 0 18px rgba(13,148,136,0.25);
    }
    .logo-text { font-size: 21px; font-weight: 600; color: #ffffff; letter-spacing: -0.3px; }
    .content { padding: 36px 32px 28px; }
    .email-title { font-size: 22px; font-weight: 600; color: #0a1628; text-align: center; margin-bottom: 10px; letter-spacing: -0.3px; }
    .email-sub { font-size: 14.5px; color: #64748b; text-align: center; line-height: 1.65; margin-bottom: 28px; }
    .otp-wrap { margin: 28px 0 14px; text-align: center; overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .otp-table { margin: 0 auto; border-collapse: separate; border-spacing: 0; }
    .otp-cell { padding: 0 4px; }
    .otp-digit {
      width: 48px;
      height: 60px;
      background: #f0fdfa;
      border: 2px solid #0d9488;
      border-radius: 10px;
      font-size: 28px;
      font-weight: 700;
      color: #0a1628;
      text-align: center;
      line-height: 56px;
      font-family: 'Courier New', monospace;
      letter-spacing: 0;
      display: block;
    }
    .divider { height: 1px; background: #e2e8f0; margin: 24px 0; }
    .footer { padding: 20px 32px 28px; text-align: center; }
    .footer-text { font-size: 12px; color: #94a3b8; line-height: 1.7; }
    .footer-links { margin-top: 12px; }
    .footer-links a { color: #64748b; text-decoration: none; font-size: 12px; margin: 0 8px; }
    @media (max-width: 600px) {
      .email-body { padding: 22px 10px; }
      .container { max-width: 100%; }
      .card { border-radius: 14px; }
      .content { padding: 24px 16px 20px; }
      .header { padding: 18px 14px; }
      .header-inner { gap: 8px; }
      .logo-icon { width: 30px; height: 30px; border-radius: 8px; }
      .logo-icon svg { width: 16px; height: 16px; }
      .logo-text { font-size: 18px; }
      .footer { padding: 16px 16px 22px; }
      .email-title { font-size: 20px; }
      .email-sub { font-size: 13.5px; margin-bottom: 22px; }
      .otp-wrap { margin: 22px 0 12px; }
      .otp-cell { padding: 0 3px; }
      .otp-digit { width: 40px; height: 52px; font-size: 24px; line-height: 48px; border-radius: 9px; }
      .footer-links a { display: inline-block; margin: 0 6px 6px; }
    }
  </style>
</head>
  <!-- Preheader (hidden preview text) -->
  <span style="display:none;font-size:1px;color:#f1f5f9;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${preheader}
  </span>

  <div class="email-body">
    <div class="container">
      <div class="card">

        <!-- Header -->
        <div class="header">
          <div class="header-inner">
            <span class="logo-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 12h4l2-5 4 10 2-5h4"/>
              </svg>
            </span>
            <span class="logo-text">MediVault</span>
          </div>
        </div>

        <!-- Body -->
        <div class="content">
          ${body}
        </div>

      </div>

      <!-- Footer -->
      <div class="footer">
        <p class="footer-text">
          You're receiving this email because you have a MediVault account.<br/>
          If you didn't request this, you can safely ignore this email.
        </p>
        <div class="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Help Centre</a>
        </div>
        <p style="margin-top:14px; font-size:11px; color:#cbd5e1;">
          © ${new Date().getFullYear()} MediVault. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/* ─────────────────────────────────────────
   OTP DIGIT BLOCK RENDERER
   Renders each digit in a styled box —
   like premium fintech/banking OTP emails.
───────────────────────────────────────── */
function otpDigitBoxes(otp) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="otp-table">
      <tr>
        ${String(otp).split('').map(digit => `
          <td class="otp-cell">
            <span class="otp-digit">${digit}</span>
          </td>
        `).join('')}
      </tr>
    </table>
  `;
}

/* ─────────────────────────────────────────
   1. EMAIL VERIFICATION OTP
───────────────────────────────────────── */
export const sendVerificationOtpEmail = async (email, otp) => {
  const subject = "Verify your MediVault account";
  const text = `Your MediVault email verification code is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.`;

  const html = emailShell({
    preheader: `Your verification code is ${otp} — expires in 10 minutes`,
    body: `
      <h1 class="email-title">Verify your email address</h1>
      <p class="email-sub">
        Enter this code in MediVault to verify your account.<br/>
        It expires in <strong style="color:#0f172a;">10 minutes</strong>.
      </p>

      <!-- OTP Digit Boxes -->
      <div class="otp-wrap">
        ${otpDigitBoxes(otp)}
      </div>

      <div class="divider"></div>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td>
            <div style="background:#f8fafc; border-radius:10px; padding:14px 16px; border-left:3px solid #0d9488;">
              <p style="font-size:13px; color:#64748b; line-height:1.6; margin:0;">
                <strong style="color:#0f172a;">🔒 Security tip:</strong> MediVault will never ask for your OTP via phone, chat, or email. Never share this code with anyone.
              </p>
            </div>
          </td>
        </tr>
      </table>

      <p style="font-size:13px; color:#94a3b8; text-align:center; margin-top:22px; line-height:1.6;">
        Didn't create a MediVault account? You can ignore this email safely.
      </p>
    `
  });

  return sendEmail(email, subject, text, html);
};

/* ─────────────────────────────────────────
   2. LOGIN OTP
───────────────────────────────────────── */
export const sendLoginOtpEmail = async (email, otp) => {
  const subject = "Your MediVault login code";
  const text = `Your MediVault login code is: ${otp}\n\nThis code expires in 5 minutes. Do not share it with anyone.`;

  const html = emailShell({
    preheader: `Your login code is ${otp} — expires in 5 minutes`,
    body: `
      <h1 class="email-title">Your login verification code</h1>
      <p class="email-sub">
        Use this code to complete your sign-in to MediVault.<br/>
        Valid for <strong style="color:#0f172a;">5 minutes only</strong>.
      </p>

      <!-- OTP Digit Boxes -->
      <div class="otp-wrap">
        ${otpDigitBoxes(otp)}
      </div>

      <div class="divider"></div>

      <!-- Time warning -->
      <div style="background:#fff7ed; border-radius:10px; padding:14px 16px; border-left:3px solid #d97706;">
        <p style="font-size:13px; color:#92400e; line-height:1.6; margin:0;">
          If you did not attempt to log in, your account may be at risk.<br/>
          <a href="#" style="color:#b45309; font-weight:700; text-decoration:none; display:inline-block; margin-top:4px;">Secure your account →</a>
        </p>
      </div>

      <p style="font-size:13px; color:#94a3b8; text-align:center; margin-top:22px;">
        Never share this code — not even with MediVault support.
      </p>
    `
  });

  return sendEmail(email, subject, text, html);
};

/* ─────────────────────────────────────────
   3. PASSWORD RESET OTP
───────────────────────────────────────── */
export const sendPasswordResetOtpEmail = async (email, otp) => {
  const subject = "Reset your MediVault password";
  const text = `Your MediVault password reset code is: ${otp}\n\nThis code expires in 5 minutes.`;

  const html = emailShell({
    preheader: `Reset code: ${otp} — valid for 5 minutes`,
    body: `
      <h1 class="email-title">Password reset request</h1>
      <p class="email-sub">
        We received a request to reset the password for your MediVault account.<br/>
        Use the code below — it expires in <strong style="color:#0f172a;">5 minutes</strong>.
      </p>

      <!-- OTP Digit Boxes -->
      <div class="otp-wrap">
        ${otpDigitBoxes(otp)}
      </div>

      <div class="divider"></div>

      <div style="background:#f8fafc; border-radius:10px; padding:14px 16px;">
        <p style="font-size:13px; color:#64748b; line-height:1.6; margin:0; text-align:center;">
          If you did not request a password reset, no action is needed.<br/>
          Your password will <strong style="color:#0f172a;">not change</strong> unless you enter this code.
        </p>
      </div>
    `
  });

  return sendEmail(email, subject, text, html);
};

/* ─────────────────────────────────────────
   4. STAFF INVITE EMAIL
───────────────────────────────────────── */
export const sendInviteEmail = async (email, link, role = 'Staff') => {
  const subject = `You've been invited to join MediVault as ${role}`;
  const text = `Welcome to MediVault. You've been invited as ${role}.\n\nSet your password using this link:\n${link}\n\nThis link expires in 24 hours.`;

  const roleColors = {
    Doctor: { bg: '#dbeafe', border: '#2563eb', text: '#1d4ed8', icon: '#2563eb' },
    Nurse:  { bg: '#dcfce7', border: '#16a34a', text: '#15803d', icon: '#16a34a' },
    Staff:  { bg: '#f0fdfa', border: '#0d9488', text: '#0d9488', icon: '#0d9488' },
    Admin:  { bg: '#ede9fe', border: '#7c3aed', text: '#6d28d9', icon: '#7c3aed' },
  };
  const c = roleColors[role] || roleColors.Staff;

  const html = emailShell({
    preheader: `You've been invited to MediVault as ${role} — set your password to get started`,
    body: `
      <div class="icon-wrap" style="background: ${c.bg};">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${c.icon}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>

      <h1 class="email-title">You've been invited!</h1>
      <p class="email-sub">
        An administrator has added you to MediVault as a<br/>
        <span style="
          display: inline-block;
          margin-top: 8px;
          background: ${c.bg};
          color: ${c.text};
          border: 1px solid ${c.border};
          padding: 3px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.3px;
        ">${role}</span>
      </p>

      <!-- What you can do -->
      <div style="background:#f8fafc; border-radius:12px; padding:20px; margin: 20px 0;">
        <p style="font-size:13px; font-weight:600; color:#334155; margin-bottom:12px;">With your MediVault account you can:</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          ${[
            ['📋', 'Access and manage patient medical records'],
            ['📤', 'Upload and annotate reports securely'],
            ['🔒', 'Securely share data with authorised staff'],
            ['📊', 'View real-time dashboards and summaries'],
          ].map(([icon, text]) => `
            <tr>
              <td style="padding: 5px 0; vertical-align: top; width: 28px; font-size:15px;">${icon}</td>
              <td style="padding: 5px 0; font-size: 13.5px; color: #475569; line-height:1.5;">${text}</td>
            </tr>
          `).join('')}
        </table>
      </div>

      <!-- CTA Button -->
      <div style="text-align:center; margin: 28px 0 20px;">
        <a href="${link}" style="
          display: inline-block;
          background: linear-gradient(135deg, #0d9488, #14b8a6);
          color: #ffffff;
          text-decoration: none;
          padding: 14px 36px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.1px;
          box-shadow: 0 4px 16px rgba(13,148,136,0.35);
        ">
          Set your password →
        </a>
      </div>

      <div class="divider"></div>

      <!-- Fallback link -->
      <div style="background:#f8fafc; border-radius:10px; padding:14px 16px;">
        <p style="font-size:12.5px; color:#94a3b8; margin:0 0 6px; text-transform:uppercase; letter-spacing:0.05em; font-weight:600;">
          Button not working?
        </p>
        <p style="font-size:12.5px; color:#64748b; word-break:break-all; margin:0; line-height:1.6;">
          Copy and paste this link in your browser:<br/>
          <a href="${link}" style="color:#0d9488; text-decoration:underline;">${link}</a>
        </p>
      </div>

      <!-- Expiry warning -->
      <div style="display:flex; align-items:center; gap:8px; margin-top:18px;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <p style="font-size:12.5px; color:#92400e; margin:0;">
          This invite link expires in <strong>24 hours</strong> and can only be used once.
        </p>
      </div>
    `
  });

  return sendEmail(email, subject, text, html);
};

/* ─────────────────────────────────────────
   5. SUPPORT REQUEST NOTIFICATION (ADMIN)
───────────────────────────────────────── */
const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const sendSupportRequestNotificationEmail = async ({
  to,
  name,
  email,
  role,
  issueType,
  message,
  submittedAt,
}) => {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeRole = escapeHtml(role);
  const safeIssueType = escapeHtml(issueType);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');
  const safeSubmittedAt = escapeHtml(submittedAt || new Date().toLocaleString());

  const subject = `[MediVault Support] ${issueType} from ${name}`;
  const text = `New support request received.\n\nName: ${name}\nEmail: ${email}\nRole: ${role}\nIssue Type: ${issueType}\nSubmitted At: ${safeSubmittedAt}\n\nMessage:\n${message}`;

  const html = emailShell({
    preheader: `New support request from ${name} (${issueType})`,
    body: `
      <h1 class="email-title">New Support Request</h1>
      <p class="email-sub">
        A new support request was submitted from the public Help Center form.
      </p>

      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding:6px 0; width:120px; font-size:13px; color:#64748b; font-weight:600;">Name</td>
            <td style="padding:6px 0; font-size:14px; color:#0f172a;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; width:120px; font-size:13px; color:#64748b; font-weight:600;">Email</td>
            <td style="padding:6px 0; font-size:14px; color:#0f172a;">${safeEmail}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; width:120px; font-size:13px; color:#64748b; font-weight:600;">Role</td>
            <td style="padding:6px 0; font-size:14px; color:#0f172a;">${safeRole}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; width:120px; font-size:13px; color:#64748b; font-weight:600;">Issue Type</td>
            <td style="padding:6px 0; font-size:14px; color:#0f172a;">${safeIssueType}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; width:120px; font-size:13px; color:#64748b; font-weight:600;">Submitted At</td>
            <td style="padding:6px 0; font-size:14px; color:#0f172a;">${safeSubmittedAt}</td>
          </tr>
        </table>
      </div>

      <div style="height:12px;"></div>

      <div style="background:#f0fdfa; border:1px solid #99f6e4; border-radius:12px; padding:16px;">
        <p style="margin:0 0 8px; font-size:13px; color:#0f766e; font-weight:700; text-transform:uppercase; letter-spacing:.04em;">
          Message
        </p>
        <p style="margin:0; font-size:14px; color:#0f172a; line-height:1.7;">${safeMessage}</p>
      </div>
    `,
  });

  return sendEmail(to, subject, text, html);
};