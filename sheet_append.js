// 📁 sheet_append.js

require("dotenv").config();

const WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL;

async function sendLeadToZapier(lead) {
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead)
    });

    const result = await res.text();
    console.log("✅ Lead sent:", lead.name, "| Zapier Response:", result);
  } catch (err) {
    console.error("❌ Failed to send lead:", lead.name, err);
  }
}

async function appendToSheet(leads) {
  for (const lead of leads) {
    console.log("🧪 DEBUG LEAD:", JSON.stringify(lead, null, 2));
    await sendLeadToZapier(lead);
    await new Promise((res) => setTimeout(res, 500)); // throttle to avoid rate limit
  }
  console.log("📤 All leads pushed to Google Sheets.");
}

module.exports = appendToSheet;
