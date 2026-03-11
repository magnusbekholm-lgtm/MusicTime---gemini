import songsData from '../../songs.json';
import danishSongsData from '../../danishSongs.json';

import { GameSettings, PlaylistSong, Era } from '../types';

/**
 * Shuffles an array using the Fisher-Yates algorithm for unbiased randomization.
 * 
 * @param array - The array to shuffle
 * @returns A new shuffled array
 */
export function shuffleSongs<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generates a random playlist based on game settings.
 * Ensures diversity by avoiding duplicate artists where possible.
 * 
 * @param settings - Configuration for the playlist generation
 * @returns An array of songs for the game session
 */
export function generateGamePlaylist(settings: GameSettings): PlaylistSong[] {
  const { mode, maxRounds: rounds = 15, era = 'all' } = settings;

  // 1. Select base dataset
  let baseSongs: PlaylistSong[] = mode === 'denmark' 
    ? (danishSongsData as PlaylistSong[]) 
    : (songsData as PlaylistSong[]);

  // 2. Filter by Era
  if (era !== 'all') {
    let start: number;
    let end: number;

    if (era === '2020-present') {
      start = 2020;
      end = new Date().getFullYear();
    } else {
      [start, end] = era.split('-').map(Number);
    }
    
    baseSongs = baseSongs.filter(song => song.year >= start && song.year <= end);
  }

  // 3. Ensure Diversity & No Duplicates
  // Shuffle the entire base set first
  const randomized = shuffleSongs(baseSongs);
  
  // To ensure diversity, we'll try to pick songs from different artists
  const selected: PlaylistSong[] = [];
  const usedArtists = new Set<string>();
  const remaining: PlaylistSong[] = [];

  for (const song of randomized) {
    if (!usedArtists.has(song.artist) && selected.length < rounds) {
      selected.push(song);
      usedArtists.add(song.artist);
    } else {
      remaining.push(song);
    }
  }

  // If we don't have enough unique artists to fill the rounds, 
  // fill the rest from the remaining shuffled songs
  if (selected.length < rounds) {
    const needed = rounds - selected.length;
    selected.push(...remaining.slice(0, needed));
  }

  // Final shuffle of the selection to mix the unique-artist ones with any duplicates
  return shuffleSongs(selected);
}
