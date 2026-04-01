import nodemailer from 'nodemailer'

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

export const sendEmail = async(to, subject, text, html)=>{
    try{
        const transporter  = createTransporter();

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
      text,
      html
    });

    console.log("Email sent successfully");

    } catch(error){
        console.log("Email error: ", error);
      throw error;
    }
}

export const sendVerificationOtpEmail = async (email, otp) => {
  const subject = "Verify your email";
  const text = `Your email verification OTP is ${otp}. It expires in 10 minutes.`;
  return sendEmail(email, subject, text);
};

export const sendLoginOtpEmail = async (email, otp) => {
  const subject = "Your login OTP";
  const text = `Your login OTP is ${otp}. It expires in 5 minutes.`;
  return sendEmail(email, subject, text);
};

export const sendPasswordResetOtpEmail = async (email, otp) => {
  const subject = "Password reset OTP";
  const text = `Your password reset OTP is ${otp}. It expires in 5 minutes.`;
  return sendEmail(email, subject, text);
};

export const sendInviteEmail = async (email, link) => {
  const subject = "You're invited to MRMS - Set your password";
  const text = `Welcome to MRMS. Set your password using this link: ${link}. This link expires in 24 hours.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin-bottom: 8px;">Welcome to MRMS</h2>
      <p style="margin: 0 0 16px;">You have been invited to join the Medical Report Management System.</p>
      <p style="margin: 0 0 20px;">
        <a href="${link}" style="display:inline-block; background:#0284c7; color:#ffffff; text-decoration:none; padding:10px 16px; border-radius:8px; font-weight:600;">
          Set your password
        </a>
      </p>
      <p style="margin: 0 0 8px;">If the button does not work, use this link:</p>
      <p style="margin: 0 0 16px;"><a href="${link}">${link}</a></p>
      <p style="margin: 0; color: #475569;">This invite link expires in 24 hours and can be used only once.</p>
    </div>
  `;

  return sendEmail(email, subject, text, html);
};