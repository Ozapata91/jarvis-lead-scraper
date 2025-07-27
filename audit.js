// 📁 audit.js (ESM version)

import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getWeakPoints(lead) {
  const weakPoints = [];

  if (!lead.website || lead.website.trim() === "") {
    weakPoints.push("no website");
  } else if (lead.website.match(/\.xyz|\.biz|\.site|\.info/i)) {
    weakPoints.push("untrustworthy domain");
  }

  const reviewCount = parseInt(lead.reviewCount || "0");
  const rating = parseFloat(lead.rating || "0");

  const scrapedLikelyFailed = reviewCount === 0 && rating >= 4.5;

  if (!scrapedLikelyFailed && reviewCount < 10) {
    weakPoints.push("low review count");
  }

  if (rating > 0 && rating < 3.5) {
    weakPoints.push("low rating");
  }

  return weakPoints;
}

function generatePrompt(lead) {
  const weakPoints = getWeakPoints(lead);
  const issues = weakPoints.join(", ");
  const name = lead.name || "this business";

  if (weakPoints.length === 0) {
    return `Write a short, helpful SEO audit blurb for a local business with a decent presence. Keep it under 2 sentences. Mention opportunities to improve visibility or capture more leads.`;
  }

  return `Write a short SEO audit blurb (1–2 sentences max) for a local business with the following issues: ${issues}. 
Business name: ${name}. Be specific, honest, and professional. Avoid fluff. No praise if the business has major red flags. Focus on what needs fixing to boost their Google visibility.`;
}

async function getAuditBlurb(lead) {
  const prompt = generatePrompt(lead);

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You're a local SEO specialist. You write short, honest audit blurbs for home service businesses based on real Google Maps data. Never assume anything. Keep your blurbs to 1–2 sentences and fact-based only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
    });

    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.error("Audit error:", err.message);
    return "Audit unavailable.";
  }
}

export default async function generateAudits(leads) {
  const withAudits = [];

  for (const lead of leads) {
    lead.auditBlurb = await getAuditBlurb(lead);
    withAudits.push(lead);
    await new Promise(r => setTimeout(r, 1000));
  }

  return withAudits;
}
