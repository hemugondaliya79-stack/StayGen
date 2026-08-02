const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
});

const emailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StayGen</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F8FAFC; }
    .container { max-width: 600px; margin: 40px auto; }
    .header { background: linear-gradient(135deg, #5B5FEF, #7C3AED); padding: 30px; border-radius: 16px 16px 0 0; text-align: center; }
    .header h1 { color: white; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 4px; }
    .body { background: white; padding: 40px; border-left: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0; }
    .footer { background: #F1F5F9; padding: 20px; border-radius: 0 0 16px 16px; text-align: center; border: 1px solid #E2E8F0; border-top: none; }
    .footer p { color: #94A3B8; font-size: 12px; }
    .otp-box { background: linear-gradient(135deg, #EEF2FF, #F5F3FF); border: 2px dashed #7C3AED; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-box span { font-size: 36px; font-weight: 800; color: #5B5FEF; letter-spacing: 8px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #5B5FEF, #7C3AED); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 20px 0; }
    h2 { color: #1E293B; font-size: 22px; margin-bottom: 12px; }
    p { color: #475569; line-height: 1.7; font-size: 15px; margin-bottom: 12px; }
    .highlight { color: #5B5FEF; font-weight: 600; }
    .warning { color: #EF4444; font-size: 13px; }
    .info-box { background: #F0FDF4; border-left: 4px solid #22C55E; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏠 StayGen</h1>
      <p>Next-Gen Student Living</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© 2024 StayGen. All rights reserved.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  </div>
</body>
</html>
`;

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log('📧 Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    throw error;
  }
};

const sendWelcomeEmail = async (user) => {
  const content = `
    <h2>Welcome to StayGen, ${user.name}! 🎉</h2>
    <p>We're excited to have you on board. Your account has been created successfully.</p>
    <div class="info-box">
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Role:</strong> ${user.role}</p>
    </div>
    <p>You can now log in to your dashboard and explore all features.</p>
    <p>If you have any questions, feel free to reach out to our support team.</p>
  `;
  await sendEmail({ to: user.email, subject: 'Welcome to StayGen 🏠', html: emailTemplate(content) });
};

const sendOTPEmail = async (email, otp, name) => {
  const content = `
    <h2>Password Reset OTP</h2>
    <p>Hi <span class="highlight">${name}</span>, we received a request to reset your password.</p>
    <div class="otp-box">
      <p style="color:#64748B; font-size:13px; margin-bottom:8px;">Your OTP Code</p>
      <span>${otp}</span>
    </div>
    <p class="warning">⚠️ This OTP will expire in <strong>10 minutes</strong>. Do not share it with anyone.</p>
    <p>If you didn't request a password reset, you can safely ignore this email.</p>
  `;
  await sendEmail({ to: email, subject: 'StayGen - Password Reset OTP', html: emailTemplate(content) });
};

const sendBookingApprovalEmail = async (student, booking) => {
  const content = `
    <h2>Room Booking ${booking.status === 'approved' ? 'Approved ✅' : 'Update'}</h2>
    <p>Hi <span class="highlight">${student.name}</span>,</p>
    <p>Your room booking request has been <strong>${booking.status}</strong>.</p>
    <div class="info-box">
      <p><strong>Room Number:</strong> ${booking.roomNumber}</p>
      <p><strong>Status:</strong> ${booking.status}</p>
    </div>
    <p>Please log in to your dashboard for more details.</p>
  `;
  await sendEmail({ to: student.email, subject: `StayGen - Room Booking ${booking.status}`, html: emailTemplate(content) });
};

const sendFeeReminderEmail = async (student, fee) => {
  const content = `
    <h2>Fee Payment Reminder 💰</h2>
    <p>Hi <span class="highlight">${student.name}</span>,</p>
    <p>This is a reminder that your fee payment is due.</p>
    <div class="info-box">
      <p><strong>Amount Due:</strong> ₹${fee.amount}</p>
      <p><strong>Due Date:</strong> ${new Date(fee.dueDate).toLocaleDateString()}</p>
      <p><strong>Month:</strong> ${fee.month}</p>
    </div>
    <p>Please make the payment before the due date to avoid late fees.</p>
  `;
  await sendEmail({ to: student.email, subject: 'StayGen - Fee Payment Reminder', html: emailTemplate(content) });
};

module.exports = { sendEmail, sendWelcomeEmail, sendOTPEmail, sendBookingApprovalEmail, sendFeeReminderEmail, emailTemplate };
