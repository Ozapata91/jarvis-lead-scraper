import './polyfill.js';

import dotenv from 'dotenv';
dotenv.config();

import scrapeMaps from './scrape.js';
import filterJarvisLeads from './filters.js';
import enrichAll from './agent_enrich.js';
import appendToSheet from './sheet_append.mjs';
import fs from 'fs/promises';

(async () => {
  console.time('⏱ Total Runtime');

  // Load config (expects { "searchTerms": [ ... ] })
  const rawConfig = await fs.readFile('./config.json', 'utf-8');
  const config = JSON.parse(rawConfig);

  for (const search of config.searchTerms) {
    console.log(`\n🔍 Scraping: ${search}`);
    const rawLeads = await scrapeMaps(search);
    console.log(`🟡 Scraped: ${rawLeads.length} leads`);

    const filteredLeads = filterJarvisLeads(rawLeads);
    console.log(`🟢 After filters: ${filteredLeads.length} leads`);

    if (filteredLeads.length === 0) {
      console.log('🚨 No leads passed filters — logging raw data:');
      console.log(JSON.stringify(rawLeads, null, 2));
      continue;
    }

    const enrichedLeads = await enrichAll(filteredLeads);
    console.log('🤖 Agent enrichment complete');

    await appendToSheet(enrichedLeads);
    console.log('✅ Pushed to Google Sheets');
  }

  console.timeEnd('⏱ Total Runtime');
})();
