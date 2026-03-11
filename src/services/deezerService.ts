/**
 * deezerService.ts
 * 
 * A service to interact with the Deezer Public Search API.
 * Uses a CORS proxy to allow browser-side requests.
 */

export interface DeezerSong {
  title: string;
  artist: string;
  year: number;
  preview_url: string;
  cover: string;
}

const DEEZER_API_BASE = 'https://api.deezer.com';
const PROXY_URL = 'https://api.allorigins.win/get?url=';

/**
 * Searches for a song on Deezer and returns details including the preview URL.
 * Only returns results that have a valid preview_url.
 * 
 * @param title - The song title
 * @param artist - The artist name
 * @returns A promise that resolves to an array of DeezerSong objects
 */
export async function searchSong(title: string, artist: string): Promise<DeezerSong[]> {
  try {
    const query = `artist:"${artist}" track:"${title}"`;
    const searchUrl = `${DEEZER_API_BASE}/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(`${PROXY_URL}${encodeURIComponent(searchUrl)}`);
    
    if (!response.ok) {
      throw new Error(`Deezer API search failed: ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.contents);

    if (!result.data || !Array.isArray(result.data)) {
      return [];
    }

    // Filter for songs with preview_url and map to our interface
    // Note: release_date is often not in the search result, so we might need a fallback
    // or a secondary fetch for the year if it's missing.
    const songs = result.data
      .filter((item: any) => item.preview)
      .map((item: any) => ({
        title: item.title,
        artist: item.artist.name,
        // Fallback to current year if release_date is missing in search result
        year: item.release_date ? new Date(item.release_date).getFullYear() : new Date().getFullYear(),
        preview_url: item.preview,
        cover: item.album.cover_medium
      }));

    return songs;
  } catch (error) {
    console.error('Error searching song on Deezer:', error);
    return [];
  }
}
