// 📁 scrape.js

import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const config = JSON.parse(await (await import("fs/promises")).then(fs => fs.readFile("./config.json", "utf-8")));

async function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function fetchPlaces(searchTerm, pageToken = null) {
  const params = new URLSearchParams({
    query: searchTerm,
    key: GOOGLE_MAPS_API_KEY,
  });
  if (pageToken) params.append("pagetoken", pageToken);

  const res = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`);
  const data = await res.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places API error: ${data.status}`);
  }

  return data;
}

async function fetchDetails(placeId) {
  const params = new URLSearchParams({
    place_id: placeId,
    key: GOOGLE_MAPS_API_KEY,
    fields: "name,formatted_phone_number,rating,user_ratings_total,website,formatted_address,types"
  });

  const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
  const data = await res.json();

  if (data.status !== "OK") {
    throw new Error(`Place Details API error: ${data.status}`);
  }

  return data.result;
}

async function scrapeMaps(searchTerm) {
  let results = [];
  let pageToken = null;

  for (let i = 0; i < 3; i++) {
    if (i > 0) await delay(2000);
    const page = await fetchPlaces(searchTerm, pageToken);
    results = results.concat(page.results);
    pageToken = page.next_page_token;
    if (!pageToken) break;
  }

  const leads = [];

  for (let i = 0; i < results.length; i++) {
    const place = results[i];
    try {
      const details = await fetchDetails(place.place_id);
      leads.push({
        name: details.name || "Unknown",
        phone: details.formatted_phone_number || "Not found",
        rating: details.rating || 0,
        reviewCount: details.user_ratings_total || 0,
        website: details.website || "",
        address: details.formatted_address || "",
        types: details.types || [],
        rank: i + 1
      });

      await delay(500);
    } catch (err) {
      console.error(`❌ Failed to fetch details for ${place.name}:`, err.message);
    }
  }

  return leads;
}

export default scrapeMaps;
