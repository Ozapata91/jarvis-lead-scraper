// 📁 run.js

import dotenv from "dotenv";
dotenv.config();

import scrapeMaps from "./scrape.js";
import filterJarvisLeads from "./filters.js";
import { lookupEmail } from "./email_lookup.mjs";
import guessOwners from "./owner_guess.js";
import generateAudits from "./audit.js";
import appendToSheet from "./sheet_append.js";
import fs from "fs";

// ✅ Read config manually
const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));

(async () => {
  console.time("⏱ Total Runtime");

  for (const search of config.searchTerms) {
    console.log(`\n🔍 Scraping: ${search}`);
    const rawLeads = await scrapeMaps(search);
    console.log(`🟡 Scraped: ${rawLeads.length} leads`);

    const filtered = filterJarvisLeads(rawLeads);
    console.log(`🟢 After filters: ${filtered.length} leads`);

    if (filtered.length === 0) {
      console.log("🚨 No leads passed filters — logging raw data:");
      console.log(JSON.stringify(rawLeads, null, 2));
    }

    const withEmails = [];

    for (const lead of filtered) {
      const domain = lead.website?.replace(/^https?:\/\//, "").split("/")[0];
      const { email } = await lookupEmail(domain);
      lead.email = email || "Not found";
      withEmails.push(lead);
      await new Promise((r) => setTimeout(r, 800));
    }

    console.log(`📬 Emails added`);

    const withOwners = await guessOwners(withEmails);
    console.log(`🧠 Owner names guessed`);

    const withAudits = await generateAudits(withOwners);
    console.log(`🧾 GPT audits generated`);

    await appendToSheet(withAudits);
    console.log(`✅ Pushed to Google Sheets`);
  }

  console.timeEnd("⏱ Total Runtime");
})();
