const nodemailer = require('nodemailer');

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  const isProd = process.env.NODE_ENV === 'production';
  const hasSmtpConfig = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

  const subject =
    purpose === 'password_reset'
      ? 'NexOffer — Password Reset OTP'
      : 'NexOffer — Email Verification OTP';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">NexOffer</h1>
        <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Your Next Offer Starts Here.</p>
      </div>
      <p style="color: #334155; font-size: 15px;">Hello,</p>
      <p style="color: #334155; font-size: 15px;">Use the following One-Time Password (OTP) to complete your ${
        purpose === 'password_reset' ? 'password reset' : 'account verification'
      }:</p>
      <div style="text-align: center; margin: 24px 0;">
        <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; border: 1px dashed #cbd5e1;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 13px;">This OTP is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center;">NexOffer AI Interview Platform &bull; College Project</p>
    </div>
  `;

  if (hasSmtpConfig) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'NexOffer <noreply@nexoffer.com>',
        to: email,
        subject,
        html,
      });

      console.log(`📧 OTP email sent successfully to ${email}`);
      return { sent: true, mode: 'smtp' };
    } catch (error) {
      console.error(`⚠️ Failed to send email via SMTP (${error.message}). Falling back to console log.`);
    }
  }

  // Fallback for development / demo mode when SMTP is not set
  console.log('----------------------------------------------------');
  console.log(`🔑 [NEXOFFER DEV OTP] Email: ${email}`);
  console.log(`🔑 [NEXOFFER DEV OTP] OTP Code: ${otp}`);
  console.log(`🔑 [NEXOFFER DEV OTP] Purpose: ${purpose}`);
  console.log('----------------------------------------------------');

  return { sent: true, mode: 'dev_console', otpCode: otp };
};

module.exports = {
  generateOTP,
  sendOTPEmail,
};
