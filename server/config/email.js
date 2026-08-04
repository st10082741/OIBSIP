/*
==============================================================
                EMAIL CONFIGURATION
==============================================================

This file creates the Nodemailer transporter
used throughout the application to send emails.

Examples:
• Email Verification
• Password Reset
• Notifications

==============================================================
*/

const nodemailer = require("nodemailer");

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function used to send emails
const sendEmail = async (mailOptions) => {
  return await transporter.sendMail(mailOptions);
};

// Export sendEmail function
module.exports = sendEmail;
