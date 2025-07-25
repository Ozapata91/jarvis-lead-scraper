import { google } from "googleapis";
import { authorizeGoogle } from "./google_auth.js";

export async function appendToSheetNative(data) {
  const auth = await authorizeGoogle();
  const sheets = google.sheets({ version: "v4", auth });

  const sheetId = process.env.GOOGLE_SHEET_ID;
  const range = "Leads!A1"; // assumes you already have headers

  const values = data.map(lead => [
    lead.businessName,
    lead.phone,
    lead.rating,
    lead.reviewCount,
    lead.website || "",
    lead.email || "",
    lead.ownerFirstName || "",
    lead.auditBlurb || "",
    lead.mapRank || "",
    lead.searchTerm || ""
  ]);

  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values
      }
    });

    console.log("✅ Sheet append complete:", response.statusText);
  } catch (err) {
    console.error("❌ Sheet append failed:", err.message);
  }
}
