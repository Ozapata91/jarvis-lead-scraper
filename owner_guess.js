// 📁 owner_guess.js

import fetch from 'node-fetch';
import dotenv from "dotenv";
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function callGPT(context) {
  const prompt = `
You're helping guess a business owner's first name. Use this data:
- Website content
- Mentions in reviews
- Email handle clue
- Domain name

Respond as JSON:
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
        temperature: 0.5
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
    const nameGuess = lead.email?.split("@")[0]?.match(/[a-zA-Z]+/)?.[0] || "";

    const context = `
Website Content: (omitted for now)
Email Handle Guess: ${nameGuess}
Domain Clue: ${domain}
    `;

    const result = await callGPT(context);
    lead.ownerGuess = result.name;
    lead.ownerConfidence = result.confidence;
    enriched.push(lead);
    await new Promise(r => setTimeout(r, 1200));
  }

  return enriched;
}

export default guessOwners;
