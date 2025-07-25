import fs from "fs";
import path from "path";
import { google } from "googleapis";
import { authorizeGoogle } from "./google_auth.js";

const EMAIL_SUBJECT = "Quick tip for your business 👇";
const EMAIL_BODY = (lead) => `
Hi ${lead.ownerFirstName || "there"},

Saw your Google listing while researching local businesses — looks like there's an opportunity to get more visibility (you're ranked #${lead.mapRank || "?"} for "${lead.searchTerm || "your service"}").

Happy to send over a quick audit or some free tips — just reply and I’ll shoot it over. 

Best,  
Orlando  
`;

export async function sendEmailNative(lead) {
  const auth = await authorizeGoogle();
  const gmail = google.gmail({ version: "v1", auth });

  const rawMessage = createRawEmail({
    to: lead.email,
    subject: EMAIL_SUBJECT,
    body: EMAIL_BODY(lead),
  });

  try {
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: rawMessage,
      },
    });
    console.log("📤 Email sent to:", lead.email, res.statusText);
  } catch (err) {
    console.error("❌ Gmail send error:", err.message);
  }
}

function createRawEmail({ to, subject, body }) {
  const message = [
    `To: ${to}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    body,
  ].join("\n");

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
