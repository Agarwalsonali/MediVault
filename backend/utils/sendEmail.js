import nodemailer from 'nodemailer'

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

export const sendEmail = async(to, subject, text)=>{
    try{
        const transporter  = createTransporter();

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    });

    console.log("Email sent successfully");

    } catch(error){
        console.log("Email error: ", error);
        
    }
}

export const sendVerificationOtpEmail = async (email, otp) => {
  const subject = "Verify your email";
  const text = `Your email verification OTP is ${otp}. It expires in 10 minutes.`;
  return sendEmail(email, subject, text);
};