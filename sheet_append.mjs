// 📁 sheet_append.mjs

import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_REFRESH_TOKEN,
  GOOGLE_SHEET_ID,
} = process.env;

const auth = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);
auth.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

const sheets = google.sheets({ version: "v4", auth });

export default async function appendToSheet(leads) {
  const values = leads.map((lead) => [
    lead.name || "",
    lead.phone || "",
    lead.rating || "",
    lead.reviewCount || "",
    lead.address || "",
    lead.website || "",
    lead.businessType || "",
    lead.rank || "",
    lead.ownerGuess || "",
    lead.seoStrength || "",
    lead.hasWebsite === false ? "no" : "yes",
    lead.auditBlurb || "",
    lead.meta?.title || "",
    lead.meta?.description || "",
    lead.meta?.h1 || ""
  ]);

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Leads!A1",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values },
    });
    console.log(`📤 ${values.length} leads pushed to Google Sheets`);
  } catch (err) {
    console.error("❌ Error appending to Google Sheets:", err);
  }
}
