export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  cover: string;
  preview: string;
  year: number;
}

export interface Player {
  uid: string;
  displayName: string;
  photoURL?: string;
}

export type RoomState = 'lobby' | 'playing' | 'round_end' | 'game_end';

export type Era = '1926-1950' | '1950-1959' | '1960-1969' | '1970-1979' | '1980-1989' | '1990-1999' | '2000-2009' | '2010-2019' | '2020-present' | 'all';

export interface GameSettings {
  maxRounds: number;
  timerSeconds: number;
  maxPlayers: number;
  mode: 'global' | 'denmark';
  era: Era;
}

export interface Guess {
  year: number;
  targetYear: number;
  timestamp: number;
  isCorrect: boolean;
  points: number;
}

export interface PlaylistSong {
  title: string;
  artist: string;
  year: number;
  country: string;
  deezerQuery: string;
}

export interface Room {
  id: string;
  host: string; // host UID
  players: Record<string, Player>;
  settings: GameSettings;
  currentRound: number;
  song: Song | null;
  playlist?: PlaylistSong[];
  startTime: number | null;
  guesses: Record<string, Guess>;
  scores: Record<string, number>;
  history?: Record<string, Record<string, Guess>>; // userId -> roundIndex -> Guess
  state: RoomState;
}

export interface SinglePlayerState {
  currentRound: number;
  totalRounds: number;
  score: number;
  history: {
    song: Song;
    guess: number;
    points: number;
    isCorrect: boolean;
  }[];
}
