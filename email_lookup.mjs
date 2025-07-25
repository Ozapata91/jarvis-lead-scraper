// 📁 email_lookup.js

import fetch from 'node-fetch'; // ESM-compatible
import * as cheerio from 'cheerio';

export async function lookupEmail(domain) {
  const url = `https://${domain}`;
  let html;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' },
      timeout: 10000,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch (err) {
    console.error(`[email_lookup] ❌ fetch failed for ${domain}:`, err.message);
    return { email: null, error: `Fetch ${err.message}` };
  }

  const emailMatch = html.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  );
  if (emailMatch && emailMatch.length) {
    console.log(`[email_lookup] ✅ found email for ${domain}: ${emailMatch[0]}`);
    return { email: emailMatch[0], error: null };
  }

  // fallback: check contact/about page
  const $ = cheerio.load(html);
  const pages = ['a[href*="contact"]', 'a[href*="about"]'];
  for (const sel of pages) {
    const href = $(sel).first().attr('href');
    if (href) {
      const pageUrl = href.startsWith('http') ? href : new URL(href, url).href;
      try {
        const r2 = await fetch(pageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
        if (r2.ok) {
          const text2 = await r2.text();
          const m2 = text2.match(
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
          );
          if (m2 && m2.length) {
            console.log(`[email_lookup] ✅ found fallback email for ${domain}: ${m2[0]}`);
            return { email: m2[0], error: null };
          }
        }
      } catch (err) {
        console.error(`[email_lookup] ⚠️ fallback fetch failed for ${pageUrl}:`, err.message);
      }
    }
  }

  console.warn(`[email_lookup] ⚠️ no email found for ${domain}`);
  return { email: null, error: 'No email found' };
}
