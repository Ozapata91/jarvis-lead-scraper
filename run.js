// 📁 run.js

import dotenv from "dotenv";
dotenv.config();

import scrapeMaps from "./scrape.js";
import filterJarvisLeads from "./filters.js";
import enrichAll from "./agent_enrich.js";
import appendToSheet from "./sheet_append.mjs";
import fs from "fs/promises";

const config = JSON.parse(await fs.readFile("./config.json", "utf-8"));

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
      continue;
    }

    const enriched = await enrichAll(filtered);
    console.log(`🤖 Agent enrichment complete`);

    await appendToSheet(enriched);
    console.log(`✅ Pushed to Google Sheets`);
  }

  console.timeEnd("⏱ Total Runtime");
})();
