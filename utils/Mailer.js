// backend/utils/Mailer.js
const nodemailer = require("nodemailer");

const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpSecure =
  typeof process.env.SMTP_SECURE === "string"
    ? process.env.SMTP_SECURE.toLowerCase() === "true"
    : smtpPort === 465;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

const sendViaResend = async (options) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    throw new Error("Missing RESEND_API_KEY or RESEND_FROM");
  }

  const payload = {
    from,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  if (options.attachments && Array.isArray(options.attachments)) {
    payload.attachments = options.attachments.map((att) => ({
      filename: att.filename,
      content: att.content,
      contentType: att.contentType,
    }));
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error: ${res.status} ${text}`);
  }
};

/**
 * Send an email with optional attachments
 * @param {Object} options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - HTML message
 * @param {Array} options.attachments - Optional array of attachments [{ filename, content, encoding, contentType }]
 */
const sendEmail = async (options) => {
  try {
    if (process.env.RESEND_API_KEY) {
      await sendViaResend(options);
      console.log(`📧 Email sent via Resend to: ${options.email}`);
      return;
    }

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    // Attach files if provided
    if (options.attachments && Array.isArray(options.attachments)) {
      mailOptions.attachments = options.attachments;
    }

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to: ${options.email}`);
  } catch (error) {
    console.error("❌ EMAIL SEND ERROR:\n", error);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

module.exports = sendEmail;
