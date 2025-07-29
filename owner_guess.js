// 📁 owner_guess.js

import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function callGPT(businessName) {
  const prompt = `
Guess the owner's first name for this business, if possible. Only return a first name.

Business Name: "${businessName}"

Respond ONLY as JSON like this:
{ "name": "Mike" }

If unsure, return:
{ "name": "Not Found" }
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
        temperature: 0.3
      })
    });

    const raw = await res.json();
    const output = raw.choices?.[0]?.message?.content?.trim();
    const parsed = JSON.parse(output);
    return parsed.name || "Not Found";
  } catch (err) {
    console.warn("❌ Owner guess failed:", err);
    return "Not Found";
  }
}

export default async function guessOwnerName(name) {
  return await callGPT(name);
}
