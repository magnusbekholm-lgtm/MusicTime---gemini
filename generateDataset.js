/**
 * generateDataset.js
 * 
 * This script generates a music dataset for the Hitster Clone app.
 * It uses the Google Gemini API to curate a list of popular songs from 1926 to the present.
 * 
 * Usage:
 * 1. Set your GEMINI_API_KEY in a .env file.
 * 2. Run with: npx tsx generateDataset.js
 */

import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Error: GEMINI_API_KEY not found in environment variables.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const songSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The song title" },
      artist: { type: Type.STRING, description: "The artist name" },
      year: { type: Type.INTEGER, description: "The release year" },
      country: { type: Type.STRING, description: "Country of origin (USA, UK, France, Germany, Sweden, Denmark, etc.)" },
      deezerQuery: { type: Type.STRING, description: "Search query for Deezer API (artist:ARTIST track:TITLE)" },
    },
    required: ["title", "artist", "year", "country", "deezerQuery"],
  },
};

async function generateBatch(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: songSchema,
    },
  });
  return JSON.parse(response.text);
}

async function main() {
  const allSongs = [];
  const startYear = 1926;
  const endYear = new Date().getFullYear();
  
  console.log(`Starting generation from ${startYear} to ${endYear}...`);

  // Generate main dataset (15 songs per year)
  // We'll process in 5-year chunks to ensure quality and stay within limits
  for (let year = startYear; year <= endYear; year += 5) {
    const currentEnd = Math.min(year + 4, endYear);
    console.log(`Generating ${year} to ${currentEnd}...`);
    
    const prompt = `Generate a list of 15 popular songs for each year from ${year} to ${currentEnd}. 
    The songs should represent popular music in the USA and Western Europe.
    Include a mix of countries like USA, UK, France, Germany, Sweden, and Denmark.
    Ensure the data is historically accurate.`;

    try {
      const songs = await generateBatch(prompt);
      allSongs.push(...songs);
      console.log(`Added ${songs.length} songs. Total: ${allSongs.length}`);
      // Sleep to avoid rate limits
      await new Promise(r => setTimeout(r, 2000));
    } catch (error) {
      console.error(`Error in batch ${year}-${currentEnd}:`, error.message);
    }
  }

  fs.writeFileSync("songs.json", JSON.stringify(allSongs, null, 2));
  console.log("Main dataset saved to songs.json");

  // Generate Danish dataset (200 songs)
  console.log("Generating Danish dataset (200 songs)...");
  const danishSongs = [];
  for (let i = 0; i < 4; i++) {
    console.log(`Danish batch ${i + 1}/4...`);
    const prompt = `Generate 50 unique popular Danish songs from various years (1950-present).
    The artists MUST be Danish.
    Ensure they are different from any previously generated songs in this run.`;
    
    try {
      const songs = await generateBatch(prompt);
      danishSongs.push(...songs);
      await new Promise(r => setTimeout(r, 2000));
    } catch (error) {
      console.error(`Error in Danish batch ${i + 1}:`, error.message);
    }
  }

  fs.writeFileSync("danishSongs.json", JSON.stringify(danishSongs, null, 2));
  console.log("Danish dataset saved to danishSongs.json");
}

main().catch(console.error);
