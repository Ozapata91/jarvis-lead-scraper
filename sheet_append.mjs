// 📁 sheet_append.mjs

import { google } from "googleapis";
import getGoogleAuth from "./google_auth.js";
import dotenv from "dotenv";
dotenv.config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_TAB = "Leads";

export default async function appendToSheet(leads) {
  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const values = leads.map((lead) => [
    lead.name || "",
    lead.phone || "",
    lead.email || "",
    lead.rating || "",
    lead.reviewCount || "",
    lead.website || "",
    lead.ownerGuess || "",
    lead.auditBlurb || "",
    lead.auditSummary || "",
    lead.hasWebsite || "",
    lead.claimStatus || "",
    lead.reviewStatus || "",
    lead.emailStatus || "",
    lead.emailBody || "",
    lead.mapRank || ""
  ]);

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_TAB}!A1`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values }
    });
  } catch (err) {
    console.error("❌ Error appending to Google Sheets:", err);
    throw err;
  }
}
