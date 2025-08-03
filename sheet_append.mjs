// 📁 sheet_append.mjs

import { google } from "googleapis";
import getGoogleAuth from "./google_auth.js";
import dotenv from "dotenv";
dotenv.config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_TAB = "Leads";

export default async function appendToSheet(leads) {
  const auth = await getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const values = leads.map((lead) => [
    lead.name      || "",
    lead.phone     || "",
    lead.rating    != null ? lead.rating    : "",
    lead.reviewCount != null ? lead.reviewCount : "",
    lead.address   || "",
    lead.website   || "",
    lead.businessType || "",
    lead.mapRank   != null ? lead.mapRank   : "",
    lead.ownerGuess   || "",
    lead.seoStrength  || "",
    lead.hasWebsite === false ? "no" : "yes",
    lead.auditBlurb   || "",
    lead.meta?.title      || "",
    lead.meta?.description|| "",
    lead.meta?.h1         || ""
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_TAB}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values }
  });
}
