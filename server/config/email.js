/*
==============================================================
                EMAIL CONFIGURATION
==============================================================

This file handles transactional email delivery using
Brevo's HTTPS API.

Brevo is used instead of SMTP because the deployed backend
runs on Render's free tier, where outbound SMTP ports are
restricted.

Used for:
• Email Verification
• Password Reset
• Application Notifications

==============================================================
*/

// =============================================================
// SEND EMAIL
// =============================================================

const sendEmail = async (mailOptions) => {
  const { to, subject, html } = mailOptions;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",

    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },

    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME || "Victor's Pizza Delivery",
        email: process.env.BREVO_SENDER_EMAIL,
      },

      to: [
        {
          email: to,
        },
      ],

      subject,
      htmlContent: html,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "The email could not be sent through Brevo.",
    );
  }

  return result;
};

module.exports = sendEmail;
