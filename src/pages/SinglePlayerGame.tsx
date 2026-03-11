import React, { useState, useEffect, useCallback } from 'react';
import { Song, SinglePlayerState, PlaylistSong, Era } from '../types';
import { SongPlayer } from '../components/SongPlayer';
import { Timeline } from '../components/Timeline';
import { generateGamePlaylist } from '../services/playlistService';
import { fetchFromDeezer } from '../services/deezer';
import { calculateScore } from '../services/scoring';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Trophy, Timer, CheckCircle2, Loader2, Calendar, Globe, Play } from 'lucide-react';

interface SinglePlayerGameProps {
  onGameEnd: (finalState: SinglePlayerState) => void;
}

const ERAS: Era[] = [
  'all',
  '1926-1950',
  '1950-1959',
  '1960-1969',
  '1970-1979',
  '1980-1989',
  '1990-1999',
  '2000-2009',
  '2010-2019',
  '2020-present'
];

export const SinglePlayerGame: React.FC<SinglePlayerGameProps> = ({ onGameEnd }) => {
  const [playlist, setPlaylist] = useState<PlaylistSong[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<SinglePlayerState['history']>([]);
  const [state, setState] = useState<'setup' | 'loading' | 'playing' | 'round_end'>('setup');
  const [timeLeft, setTimeLeft] = useState(25);
  const [startTime, setStartTime] = useState<number>(0);
  const [myGuess, setMyGuess] = useState<{ year: number; points: number; isCorrect: boolean } | null>(null);
  const [gameMode, setGameMode] = useState<'global' | 'denmark'>('global');
  const [gameEra, setGameEra] = useState<Era>('all');

  const totalRounds = 15;

  const startGame = (mode: 'global' | 'denmark', era: Era) => {
    setGameMode(mode);
    setGameEra(era);
    setState('loading');
    const newPlaylist = generateGamePlaylist({ 
      mode, 
      era, 
      maxRounds: totalRounds,
      timerSeconds: 25,
      maxPlayers: 1
    });
    setPlaylist(newPlaylist);
    loadRound(1, newPlaylist);
  };

  // Timer Logic
  useEffect(() => {
    if (state !== 'playing') return;

    if (timeLeft <= 0) {
      handleGuess(0); // Auto-submit if time runs out
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, state]);

  const loadRound = async (roundNum: number, currentPlaylist: PlaylistSong[]) => {
    setState('loading');
    setMyGuess(null);
    setTimeLeft(25);
    
    const songMeta = currentPlaylist[roundNum - 1];
    if (!songMeta) return;

    const song = await fetchFromDeezer(songMeta.deezerQuery, songMeta.year);
    if (song) {
      setCurrentSong(song);
      setStartTime(Date.now());
      setState('playing');
    } else {
      // Fallback if song fetch fails
      handleNextRound();
    }
  };

  const handleGuess = (year: number) => {
    if (state !== 'playing' || !currentSong) return;

    const responseTime = (Date.now() - startTime) / 1000;
    const points = calculateScore(currentSong.year, year, responseTime);
    const isCorrect = year === currentSong.year;

    const guessResult = { year, points, isCorrect };
    setMyGuess(guessResult);
    setScore(prev => prev + points);
    setHistory(prev => [...prev, { song: currentSong, guess: year, points, isCorrect }]);
    setState('round_end');
  };

  const handleNextRound = () => {
    if (currentRound >= totalRounds) {
      onGameEnd({
        currentRound,
        totalRounds,
        score: score + (myGuess?.points || 0),
        history: [...history]
      });
      return;
    }

    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);
    loadRound(nextRound, playlist);
  };

  if (state === 'setup') {
    return (
      <div className="max-w-xl mx-auto space-y-12 py-12">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter">Single <span className="text-emerald-500">Player</span></h2>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Configure your session</p>
        </div>

        <div className="space-y-8 bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-800">
          <div className="space-y-4">
            <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Game Mode</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setGameMode('global')}
                className={`p-6 rounded-2xl border-2 flex flex-col items-center space-y-3 transition-all ${gameMode === 'global' ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-black/40'}`}
              >
                <Globe size={32} className={gameMode === 'global' ? 'text-emerald-500' : 'text-zinc-600'} />
                <span className="font-black italic uppercase">Global</span>
              </button>
              <button
                onClick={() => setGameMode('denmark')}
                className={`p-6 rounded-2xl border-2 flex flex-col items-center space-y-3 transition-all ${gameMode === 'denmark' ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-black/40'}`}
              >
                <Music size={32} className={gameMode === 'denmark' ? 'text-emerald-500' : 'text-zinc-600'} />
                <span className="font-black italic uppercase">Denmark</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Musical Era</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ERAS.map((era) => (
                <button
                  key={era}
                  onClick={() => setGameEra(era)}
                  className={`p-3 rounded-xl border text-sm font-bold uppercase italic transition-all ${gameEra === era ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-zinc-800 bg-black/40 text-zinc-400 hover:border-zinc-600'}`}
                >
                  {era === 'all' ? 'All Eras' : era.replace('-present', '+')}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => startGame(gameMode, gameEra)}
            className="w-full bg-emerald-500 text-black font-black py-6 rounded-2xl text-xl flex items-center justify-center space-x-3 hover:bg-emerald-400 transition-colors uppercase italic"
          >
            <Play size={24} fill="currentColor" />
            <span>Start Game</span>
          </button>
        </div>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <Loader2 size={64} className="text-emerald-500 animate-spin" />
          <Music size={24} className="text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-2xl font-black italic uppercase tracking-tighter">Preparing Round {currentRound}</p>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">Fetching musical artifacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-500">
              <Music size={20} />
            </div>
            <div>
              <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Round</p>
              <p className="font-black italic text-xl">{currentRound} / {totalRounds}</p>
            </div>
          </div>
          
          <div className="h-8 w-px bg-zinc-800" />

          <div className="flex items-center space-x-3">
            <Timer className={timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-emerald-500'} size={20} />
            <div>
              <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Time</p>
              <p className={`font-black italic text-xl ${timeLeft <= 5 ? 'text-red-500' : 'text-white'}`}>{timeLeft}s</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Trophy className="text-emerald-500" size={24} />
          <div className="text-right">
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Total Score</p>
            <p className="font-black italic text-2xl text-emerald-500">{score.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex flex-col items-center space-y-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSong?.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full"
          >
            <SongPlayer 
              song={currentSong} 
              revealed={state === 'round_end'} 
            />
          </motion.div>
        </AnimatePresence>

        <div className="w-full max-w-2xl">
          {state === 'playing' ? (
            <Timeline 
              onConfirm={handleGuess}
              disabled={false}
            />
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <div className={`text-7xl font-black italic uppercase tracking-tighter ${myGuess?.isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                  {myGuess?.isCorrect ? 'PERFECT!' : 'NOT QUITE!'}
                </div>
                <div className="flex justify-center items-center space-x-4">
                  <div className="bg-zinc-900 border border-zinc-800 px-8 py-4 rounded-2xl">
                    <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mb-1">Actual Year</p>
                    <p className="text-4xl font-black italic">{currentSong?.year}</p>
                  </div>
                  <div className="text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-8 py-4 rounded-2xl">
                    <p className="text-emerald-500/60 font-mono text-[10px] uppercase tracking-widest mb-1">Points Earned</p>
                    <p className="text-4xl font-black italic">+{myGuess?.points}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleNextRound}
                className="bg-white text-black font-black px-16 py-6 rounded-2xl hover:scale-105 transition-all shadow-2xl text-2xl italic uppercase group"
              >
                <span>{currentRound === totalRounds ? 'See Results' : 'Next Round'}</span>
                <CheckCircle2 className="inline-block ml-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
