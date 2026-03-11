import React from 'react';
import { Song } from '../types';
import { motion } from 'motion/react';
import { Play, Pause, Music } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

interface SongPlayerProps {
  song: Song | null;
  revealed: boolean;
}

export const SongPlayer: React.FC<SongPlayerProps> = ({ song, revealed }) => {
  const { playing, toggle, progress } = useAudio(song?.preview || null, 20);

  if (!song) return null;

  const progressPercentage = (progress / 20) * 100;

  return (
    <div className="w-full max-w-sm mx-auto bg-zinc-900 rounded-[2.5rem] border border-zinc-800 p-8 shadow-2xl">
      <div className="relative aspect-square mb-8 group">
        {/* Cover Image / Placeholder */}
        <div className="w-full h-full rounded-[2rem] overflow-hidden bg-zinc-800 border border-white/5 relative">
          {revealed ? (
            <motion.img
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={song.cover}
              alt={song.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-700">
              <Music size={80} strokeWidth={1} />
            </div>
          )}
          
          {/* Play Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={toggle}
              className="w-20 h-20 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform"
            >
              {playing ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>
          </div>
        </div>

        {/* Progress Ring (Visual only) */}
        <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] -rotate-90 pointer-events-none">
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-zinc-800"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-emerald-500"
            strokeDasharray="100 100"
            animate={{ strokeDashoffset: 100 - progressPercentage }}
            transition={{ duration: 0.1 }}
          />
        </svg>
      </div>

      {/* Info Area */}
      <div className="text-center space-y-4 min-h-[80px]">
        {revealed ? (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-1"
          >
            <h2 className="text-2xl font-black italic text-white line-clamp-1 uppercase tracking-tight">
              {song.title}
            </h2>
            <p className="text-emerald-500 font-mono text-xs uppercase tracking-[0.2em] font-bold">
              {song.artist}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <div className="h-8 w-48 bg-zinc-800 rounded-lg mx-auto animate-pulse" />
            <div className="h-4 w-32 bg-zinc-800/50 rounded-lg mx-auto animate-pulse" />
          </div>
        )}
      </div>

      {/* Playback Controls */}
      <div className="mt-8 flex items-center justify-center">
        <button
          onClick={toggle}
          className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-black italic uppercase transition-all ${
            playing 
              ? 'bg-zinc-800 text-emerald-500 border border-emerald-500/30' 
              : 'bg-emerald-500 text-black hover:bg-emerald-400'
          }`}
        >
          {playing ? (
            <>
              <Pause size={20} fill="currentColor" />
              <span>Playing Preview</span>
            </>
          ) : (
            <>
              <Play size={20} fill="currentColor" />
              <span>Listen to Clip</span>
            </>
          )}
        </button>
      </div>

      {/* Duration Info */}
      <div className="mt-4 text-center">
        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          20 Second Preview Limit
        </p>
      </div>
    </div>
  );
};
