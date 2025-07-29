// 📁 audit.js

import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function generateAudit(lead) {
  const {
    name = "This business",
    rating = 0,
    reviewCount = 0,
    mapRank = "unknown",
    hasWebsite,
    claimStatus,
    category
  } = lead;

  const safeCategory = category || "business";
  const safeClaim = claimStatus || "missing";
  const hasSite = hasWebsite === "yes" ? "has" : "does not have";

  const prompt = `
This ${safeCategory} named "${name}" has a ${rating} star rating with ${reviewCount} reviews and is currently ranked #${mapRank} on Google Maps. The business ${hasSite} a website and the Google profile is ${safeClaim}.

Write a 2-line visibility audit explaining their current local presence and missed lead potential. Make it sound like expert insight, not salesy.
`.trim();

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5
      })
    });

    const data = await res.json();
    const output = data.choices?.[0]?.message?.content?.trim();
    return output || "Visibility audit not available.";
  } catch (err) {
    console.warn("❌ Audit GPT failed:", err);
    return "Visibility audit not available.";
  }
}
