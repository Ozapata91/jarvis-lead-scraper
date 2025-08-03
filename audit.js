// 📁 audit.js

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