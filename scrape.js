// 📁 scrape.js

import { chromium } from "playwright";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));

async function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function scrapeMaps(searchTerm) {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const query = encodeURIComponent(searchTerm);
  const url = `https://www.google.com/maps/search/${query}`;
  console.log("🌐 Navigating to:", url);

  await page.goto(url, { timeout: 60000 });
  await page.waitForTimeout(5000);

  const leads = new Map();
  let lastHeight = 0;
  let sameScrollCount = 0;

  while (sameScrollCount < 3) {
    const cards = await page.$$('div[class^="Nv2PK"]');
    console.log(`🔎 Found ${cards.length} cards this scroll...`);

    for (const card of cards) {
      try {
        const isSponsored = await card.evaluate(node =>
          node.innerText.toLowerCase().includes("sponsored")
        );
        if (isSponsored) {
          console.log("⛔ Skipping sponsored listing");
          continue;
        }

        const name = await card.$eval('a[href^="https://www.google.com/maps/place"]', el => el.getAttribute('aria-label'));
        const ratingText = await card.$eval('[aria-label*="stars"]', el => el.getAttribute('aria-label')).catch(() => "0");
        const rating = parseFloat(ratingText?.match(/[\d.]+/)?.[0] || 0);

        const fullText = await card.textContent();
        const reviewMatch = fullText.match(/\d{1,3}(,\d{3})* reviews?/);
        const rawCount = reviewMatch ? reviewMatch[0].replace(/[^\d]/g, "") : "0";
        const reviewCount = parseInt(rawCount, 10);

        const phone = fullText.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)?.[0] || "Not found";

        const website = await card.$$eval('a', links =>
          links.map(a => a.href).find(href =>
            href.startsWith('http') && !href.includes('google.com/maps')
          )
        ).catch(() => null);

        console.log(`🌐 Website: ${website}`);

        const id = `${name}|${phone}`;
        if (!leads.has(id)) {
          leads.set(id, {
            name,
            phone,
            rating,
            reviewCount,
            website,
            rank: leads.size + 1,
          });
        }
      } catch (err) {
        continue;
      }
    }

    const scrollHeight = await page.evaluate(() => {
      const el = document.querySelector('div[role="main"]');
      if (el) {
        el.scrollBy(0, 1000);
        return el.scrollHeight;
      }
      return 0;
    });

    if (scrollHeight === lastHeight) {
      sameScrollCount++;
    } else {
      sameScrollCount = 0;
      lastHeight = scrollHeight;
    }

    await delay(config.scrollDelayMs || 2000);
  }

  await browser.close();
  return Array.from(leads.values());
}

export default scrapeMaps;
