const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendPendingPaymentReminder = async (tenant, formattedDueDate) => {
  const mailOptions = {
    from: `"Vergara's Apartment" <${process.env.EMAIL_USER}>`,
    to: tenant.email,
    subject: 'Pending Payment Reminder',
    html: `
      <p>Dear ${tenant.name},</p>
      <p>This is a friendly reminder that your payment is currently pending.</p>
      <p>Please complete your payment by <strong>${formattedDueDate}</strong> to avoid any potential late fees or service disruptions.</p>
      <p>Thank you for your prompt attention.</p>
      <p>Best regards,<br>Vergara's Apartment Complex</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendPendingPaymentReminder;
