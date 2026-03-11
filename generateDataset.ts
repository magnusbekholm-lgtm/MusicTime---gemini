import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

interface Song {
  title: string;
  artist: string;
  year: number;
  country: string;
  deezerQuery: string;
}

const songSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      artist: { type: Type.STRING },
      year: { type: Type.INTEGER },
      country: { type: Type.STRING },
      deezerQuery: { type: Type.STRING },
    },
    required: ["title", "artist", "year", "country", "deezerQuery"],
  },
};

async function generateSongsForYears(startYear: number, endYear: number): Promise<Song[]> {
  console.log(`Generating songs for ${startYear}-${endYear}...`);
  const prompt = `Generate a list of 15 popular songs for each year from ${startYear} to ${endYear}. 
  The songs should be representative of popular music in the USA and Western Europe (UK, France, Germany, Sweden, Denmark, etc.).
  For each song, provide:
  - title: The song title.
  - artist: The artist name.
  - year: The release year.
  - country: The primary country of origin (e.g., "USA", "UK", "Sweden").
  - deezerQuery: A string formatted as "artist:ARTIST track:TITLE" for searching on Deezer.
  Ensure the data is accurate and covers a variety of genres popular in those years.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: songSchema,
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse JSON response", e);
    return [];
  }
}

async function generateDanishSongs(): Promise<Song[]> {
  console.log("Generating Danish songs...");
  const prompt = `Generate a list of 200 popular Danish songs from various years (1950 to present).
  The artists MUST be Danish.
  For each song, provide:
  - title: The song title.
  - artist: The artist name.
  - year: The release year.
  - country: Always "Denmark".
  - deezerQuery: A string formatted as "artist:ARTIST track:TITLE" for searching on Deezer.`;

  // 200 is a lot for one prompt, let's do it in 4 batches of 50
  let allDanishSongs: Song[] = [];
  for (let i = 0; i < 4; i++) {
    console.log(`Batch ${i + 1}/4...`);
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt + ` (Batch ${i + 1}, provide 50 unique songs different from previous batches)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: songSchema,
      },
    });
    allDanishSongs = allDanishSongs.concat(JSON.parse(response.text));
  }
  return allDanishSongs;
}

async function main() {
  const allSongs: Song[] = [];
  const startYear = 1926;
  const endYear = new Date().getFullYear();
  const batchSize = 5; // 5 years at a time to stay within token limits and ensure quality

  for (let year = startYear; year <= endYear; year += batchSize) {
    const currentEnd = Math.min(year + batchSize - 1, endYear);
    const songs = await generateSongsForYears(year, currentEnd);
    allSongs.push(...songs);
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  fs.writeFileSync("songs.json", JSON.stringify(allSongs, null, 2));
  console.log(`Saved ${allSongs.length} songs to songs.json`);

  const danishSongs = await generateDanishSongs();
  fs.writeFileSync("danishSongs.json", JSON.stringify(danishSongs, null, 2));
  console.log(`Saved ${danishSongs.length} Danish songs to danishSongs.json`);
}

main().catch(console.error);
