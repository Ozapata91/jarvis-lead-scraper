///owner_guess.js
import fetch from "node-fetch";
import dotenv from "dotenv";
import { lookupEmail } from "./email_lookup.mjs";
import * as cheerio from "cheerio";
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function fetchSiteText(url) {
  try {
    const res = await fetch(url, { timeout: 8000 });
    const html = await res.text();

    // Extract title, meta, h1
    const $ = cheerio.load(html);
    const title = $("title").text().trim();
    const metaDesc = $('meta[name="description"]').attr("content")?.trim() || "";
    const h1 = $("h1").first().text().trim();

    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<\/?[^>]+(>|$)/g, "")
      .replace(/\s+/g, " ")
      .slice(0, 3000);

    return { cleaned, title, metaDesc, h1 };
  } catch (e) {
    console.warn("⚠️ Site fetch failed:", url);
    return { cleaned: "(could not fetch website)", title: "", metaDesc: "", h1: "" };
  }
}

async function callGPT(context) {
  const prompt = `
You're helping guess a business owner's first name. Use this data:
- Business name, phone, email clue, domain name
- Website title, meta description, h1 tag
- Site content preview

Respond ONLY as JSON:
{
  "name": "Mike",
  "confidence": 80
}
If unsure:
{
  "name": "Not Found",
  "confidence": 0
}

Data:
${context}
  `.trim();

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      })
    });

    const raw = await res.json();
    const text = raw.choices?.[0]?.message?.content?.trim() || "";
    return JSON.parse(text);
  } catch (e) {
    console.error("❌ GPT owner guess failed:", e);
    return { name: "Not Found", confidence: 0 };
  }
}

async function guessOwners(leads) {
  const enriched = [];

  for (const lead of leads) {
    const domain = lead.website?.match(/\/\/(?:www\.)?([^./]+)/)?.[1] || "";

    let email = lead.email;
    if (!email && lead.website) {
      const domainOnly = lead.website.replace(/^https?:\/\//, "").split("/")[0];
      const result = await lookupEmail(domainOnly);
      if (result.email) {
        email = result.email;
        lead.email = email;
      }
    }

    const nameGuess = email?.split("@")[0]?.match(/[a-zA-Z]+/)?.[0] || "";

    const { cleaned, title, metaDesc, h1 } = lead.website
      ? await fetchSiteText(lead.website)
      : { cleaned: "", title: "", metaDesc: "", h1: "" };

    const context = `
Business Name: ${lead.name}
Phone: ${lead.phone}
Email Handle Guess: ${nameGuess}
Domain Clue: ${domain}
Website Title: ${title}
Meta Description: ${metaDesc}
H1 Tag: ${h1}
Site Text: ${cleaned}
    `.trim();

    console.log("🧠 GPT Owner Guess Context:\n", context); // ✅ Debug Output

    const result = await callGPT(context);
    lead.ownerGuess = result.name;
    lead.ownerConfidence = result.confidence;
    enriched.push(lead);

    await new Promise((r) => setTimeout(r, 1200));
  }

  return enriched;
}

export default guessOwners;
