import { google } from "googleapis";
import googleAuth from "./google_auth.js";

export default async function sendGmail(to, subject, message) {
  const auth = await googleAuth();
  const gmail = google.gmail({ version: "v1", auth });

  const raw = Buffer.from(
    `To: ${to}\r\nSubject: ${subject}\r\n\r\n${message}`
  ).toString("base64");

  try {
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: raw.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""),
      },
    });

    console.log("✅ Email sent:", res.data.id);
  } catch (err) {
    console.error("❌ Email failed:", err.message);
  }
}
