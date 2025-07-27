// 📁 email_sender.js

require("dotenv").config();
const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const { OAuth2 } = google.auth;

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_REFRESH_TOKEN,
  GMAIL_USER
} = process.env;

const oauth2Client = new OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

async function sendEmail({ to, subject, html }) {
  try {
    const { token } = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: GMAIL_USER,
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        refreshToken: GOOGLE_REFRESH_TOKEN,
        accessToken: token,
      }
    });

    const mailOptions = {
      from: `Jarvis AI <${GMAIL_USER}>`,
      to,
      replyTo: GMAIL_USER,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent to", to, "| Message ID:", result.messageId);
    return result;
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
  }
}

module.exports = sendEmail;
