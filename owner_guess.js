// 📁 owner_guess.js

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