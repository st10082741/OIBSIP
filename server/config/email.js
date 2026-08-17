/*
==============================================================
                EMAIL CONFIGURATION
==============================================================

This file handles application email delivery using the
Resend HTTPS API.

Resend is used instead of SMTP because the deployed backend
runs on Render's free tier, where outbound SMTP ports are
restricted.

Used for:
• Email Verification
• Password Reset
• Application Notifications

==============================================================
*/

const { Resend } = require("resend");

// Create the Resend client using the API key stored
// securely in the environment variables.
const resend = new Resend(process.env.RESEND_API_KEY);

// =============================================================
// SEND EMAIL
// =============================================================

const sendEmail = async (mailOptions) => {
  const { to, subject, html } = mailOptions;

  const { data, error } = await resend.emails.send({
    from:
      process.env.EMAIL_FROM ||
      "Victor's Pizza Delivery <onboarding@resend.dev>",
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message || "Email could not be sent.");
  }

  return data;
};

module.exports = sendEmail;
