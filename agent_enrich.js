// 📁 agent_enrich.js

// 🧠 JARVIS AGENT MODE ACTIVE
// This file is controlled by MASTER DIRECTIVE — obey Agent Protocol

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function extractMetadata(html) {
  const $ = cheerio.load(html);
  const title = $('title').first().text() || "";
  const description = $('meta[name="description"]').attr('content') || "";
  const h1 = $('h1').first().text() || "";

  let services = [];
  const keywords = ["services", "what we offer", "our work", "solutions"];
  const bodyText = $('body').text().toLowerCase();
  for (const keyword of keywords) {
    if (bodyText.includes(keyword)) services.push(keyword);
  }

  return { title, description, h1, services: services.join(", ") };
}

async function callAgentGPT(context) {
  const prompt = `
You are a lead enrichment agent. Your job is to:
1. Guess the owner's first name
2. Rate SEO strength: "strong", "weak", or "missing"
Return this JSON:
{
  "owner": "First Name or Not Found",
  "seo": "strong | weak | missing"
}

Context:
${context}`.trim();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    })
  });

  const data = await res.json();
  return JSON.parse(data.choices?.[0]?.message?.content || '{}');
}

async function enrichLead(lead) {
  if (!lead.website || lead.website.trim() === "") {
    lead.hasWebsite = false;

    const prompt = `Roast this business for not having a website: ${lead.name}. Reply in 1 short sentence.`;
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      })
    });

    const data = await res.json();
    lead.auditBlurb = data.choices?.[0]?.message?.content.trim() || "Missing website.";
    lead.ownerGuess = "Not Found";
    lead.seoStrength = "missing";
    return lead;
  }

  try {
    const baseUrl = lead.website.replace(/\/$/, "");
    const pages = ["", "/services", "/about"];
    let combinedHtml = "";

    for (const path of pages) {
      const url = baseUrl + path;
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 10000,
        });
        if (res.ok) {
          const html = await res.text();
          combinedHtml += `\n\n${html}`;
        }
      } catch (err) {
        console.warn(`[agent_enrich] Skipped ${url} - ${err.message}`);
      }
    }

    const meta = extractMetadata(combinedHtml);
    const context = `Title: ${meta.title}\nDescription: ${meta.description}\nH1: ${meta.h1}\nServices: ${meta.services}`;

    const result = await callAgentGPT(context);
    lead.hasWebsite = true;
    lead.ownerGuess = result.owner || "Not Found";
    lead.seoStrength = result.seo || "unknown";
    lead.meta = meta;

    return lead;
  } catch (err) {
    console.error(`[agent_enrich] Failed to enrich: ${lead.name}`, err);
    return lead;
  }
}

async function enrichAll(leads) {
  const enriched = [];
  for (const lead of leads) {
    const enrichedLead = await enrichLead(lead);
    enriched.push(enrichedLead);
    await new Promise(r => setTimeout(r, 1200));
  }
  return enriched;
}

export default enrichAll;
