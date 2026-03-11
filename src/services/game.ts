import { ref, set, update, get, onValue, serverTimestamp } from 'firebase/database';
import { rtdb } from '../firebase';
import { Room, Player, Song, GameSettings, Guess, PlaylistSong } from '../types';
import { fetchFromDeezer } from './deezer';
import { generateGamePlaylist } from './playlistService';
import { calculateScore } from './scoring';

const DEFAULT_SETTINGS: GameSettings = {
  maxRounds: 15,
  timerSeconds: 25,
  maxPlayers: 10,
  mode: 'global',
  era: 'all'
};

export const createRoom = async (host: Player, settings: Partial<GameSettings> = {}): Promise<string> => {
  // 5 character room code
  const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
  const roomRef = ref(rtdb, `rooms/${roomId}`);
  
  const roomData: Room = {
    id: roomId,
    host: host.uid,
    players: { [host.uid]: host },
    settings: { ...DEFAULT_SETTINGS, ...settings },
    currentRound: 0,
    song: null,
    startTime: null,
    guesses: {},
    scores: { [host.uid]: 0 },
    state: 'lobby'
  };

  await set(roomRef, roomData);
  return roomId;
};

export const joinRoom = async (roomId: string, player: Player): Promise<void> => {
  const roomRef = ref(rtdb, `rooms/${roomId}`);
  const snapshot = await get(roomRef);
  
  if (!snapshot.exists()) throw new Error('Room not found');
  
  const room: Room = snapshot.val();
  const playerCount = Object.keys(room.players || {}).length;
  
  if (playerCount >= room.settings.maxPlayers) {
    throw new Error('Room is full');
  }
  
  if (room.state !== 'lobby') {
    throw new Error('Game already in progress');
  }

  const updates: any = {};
  updates[`players/${player.uid}`] = player;
  updates[`scores/${player.uid}`] = 0;
  
  await update(roomRef, updates);
};

export const startGame = async (roomId: string): Promise<void> => {
  const roomRef = ref(rtdb, `rooms/${roomId}`);
  const snapshot = await get(roomRef);
  const room: Room = snapshot.val();

  // Generate playlist based on settings
  const playlist = generateGamePlaylist(room.settings);

  if (playlist.length === 0) throw new Error('No songs found for these settings');

  // Fetch first song
  const firstSongMeta = playlist[0];
  const song = await fetchFromDeezer(firstSongMeta.deezerQuery, firstSongMeta.year);

  await update(roomRef, {
    state: 'playing',
    currentRound: 1,
    playlist,
    song,
    startTime: Date.now(),
    guesses: {}
  });
};

export const submitGuess = async (roomId: string, userId: string, year: number): Promise<void> => {
  const roomRef = ref(rtdb, `rooms/${roomId}`);
  const snapshot = await get(roomRef);
  const room: Room = snapshot.val();

  if (room.state !== 'playing' || !room.song) return;
  if (room.guesses[userId]) return; // Already guessed

  const isCorrect = year === room.song.year;
  const timeTaken = (Date.now() - (room.startTime || 0)) / 1000;
  
  const points = calculateScore(room.song.year, year, timeTaken);

  const guess: Guess = {
    year,
    targetYear: room.song.year,
    timestamp: Date.now(),
    isCorrect,
    points
  };

  const updates: any = {};
  updates[`guesses/${userId}`] = guess;
  updates[`scores/${userId}`] = (room.scores[userId] || 0) + points;
  updates[`history/${userId}/${room.currentRound}`] = guess;

  await update(roomRef, updates);

  // Check if everyone has guessed
  const updatedGuesses = { ...room.guesses, [userId]: guess };
  if (Object.keys(updatedGuesses).length === Object.keys(room.players).length) {
    await endRound(roomId);
  }
};

export const endRound = async (roomId: string): Promise<void> => {
  const roomRef = ref(rtdb, `rooms/${roomId}`);
  await update(roomRef, { state: 'round_end' });
};

export const nextRound = async (roomId: string): Promise<void> => {
  const roomRef = ref(rtdb, `rooms/${roomId}`);
  const snapshot = await get(roomRef);
  const room: Room = snapshot.val();

  if (room.currentRound >= room.settings.maxRounds || !room.playlist) {
    await update(roomRef, { state: 'game_end' });
    return;
  }

  const nextRoundNum = room.currentRound + 1;
  const nextSongMeta = room.playlist[nextRoundNum - 1];
  
  if (!nextSongMeta) {
    await update(roomRef, { state: 'game_end' });
    return;
  }

  const song = await fetchFromDeezer(nextSongMeta.deezerQuery, nextSongMeta.year);

  await update(roomRef, {
    state: 'playing',
    currentRound: nextRoundNum,
    song,
    startTime: Date.now(),
    guesses: {}
  });
};

export const subscribeToRoom = (roomId: string, callback: (room: Room) => void) => {
  const roomRef = ref(rtdb, `rooms/${roomId}`);
  return onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
};
