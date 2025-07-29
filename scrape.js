// 📁 scrape.js

import fs from "fs/promises";
import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";

const config = JSON.parse(await fs.readFile("./config.json", "utf-8"));
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export default async function scrapeMaps(searchTerm) {
  const allResults = [];
  let pageToken = "";
  let attempts = 0;

  while (attempts < 3) {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      searchTerm
    )}&key=${API_KEY}${pageToken ? `&pagetoken=${pageToken}` : ""}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.results) {
      allResults.push(...data.results);
    }

    if (!data.next_page_token) break;
    pageToken = data.next_page_token;
    attempts++;
    await new Promise((r) => setTimeout(r, 2000));
  }

  return allResults.map((place, i) => ({
    name: place.name || "Not Found",
    phone: "", // placeholder, filled in later
    email: "Not found", // placeholder
    rating: place.rating || 0,
    reviewCount: place.user_ratings_total || 0,
    website: place.website || "", // 🟢 keep this clean
    address: place.formatted_address || "",
    category: place.types?.[0] || "business",
    mapRank: i + 1,
  }));
}
