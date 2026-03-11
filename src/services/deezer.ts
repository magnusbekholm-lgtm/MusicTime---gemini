import { Song } from '../types';
import songsData from '../../songs.json';
import danishSongsData from '../../danishSongs.json';

const DEEZER_API_BASE = 'https://api.deezer.com';

interface DatasetSong {
  title: string;
  artist: string;
  year: number;
  country: string;
  deezerQuery: string;
}

export async function fetchFromDeezer(query: string, year: number): Promise<Song | null> {
  try {
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`${DEEZER_API_BASE}/search?q=${encodeURIComponent(query)}&limit=1`)}`);
    const data = await response.json();
    const result = JSON.parse(data.contents);

    if (result.data && result.data.length > 0) {
      const item = result.data[0];
      return {
        id: item.id,
        title: item.title,
        artist: item.artist.name,
        album: item.album.title,
        cover: item.album.cover_medium,
        preview: item.preview,
        year: year,
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching from Deezer for query ${query}:`, error);
    return null;
  }
}

export async function fetchSongsByYear(year: number): Promise<Song[]> {
  // Filter songs from our curated dataset for the given year
  const yearSongs = (songsData as DatasetSong[]).filter(s => s.year === year);
  
  if (yearSongs.length === 0) {
    // Fallback to generic search if year not in dataset
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`${DEEZER_API_BASE}/search?q=year:${year}&limit=5`)}`);
      const data = await response.json();
      const result = JSON.parse(data.contents);
      return result.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        artist: item.artist.name,
        album: item.album.title,
        cover: item.album.cover_medium,
        preview: item.preview,
        year: year,
      }));
    } catch (e) {
      return [];
    }
  }

  // Pick a random song from the dataset for this year
  const randomSong = yearSongs[Math.floor(Math.random() * yearSongs.length)];
  const song = await fetchFromDeezer(randomSong.deezerQuery, year);
  
  return song ? [song] : [];
}

export async function fetchDanishSongs(): Promise<Song[]> {
  const danishSongs = danishSongsData as DatasetSong[];
  if (danishSongs.length === 0) return [];

  // Pick a random Danish song
  const randomSong = danishSongs[Math.floor(Math.random() * danishSongs.length)];
  const song = await fetchFromDeezer(randomSong.deezerQuery, randomSong.year);
  
  return song ? [song] : [];
}

export function getRandomYear(start: number = 1926, end: number = new Date().getFullYear()): number {
  // Prefer years that exist in our dataset
  const availableYears = Array.from(new Set((songsData as DatasetSong[]).map(s => s.year)));
  if (availableYears.length > 0) {
    return availableYears[Math.floor(Math.random() * availableYears.length)];
  }
  return Math.floor(Math.random() * (end - start + 1)) + start;
}
