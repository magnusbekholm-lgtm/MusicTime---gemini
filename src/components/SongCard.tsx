import React from 'react';
import { Song } from '../types';
import { motion } from 'motion/react';
import { Music, Play, Pause } from 'lucide-react';

interface SongCardProps {
  song: Song;
  revealed?: boolean;
  active?: boolean;
  onPlay?: () => void;
  playing?: boolean;
}

export const SongCard: React.FC<SongCardProps> = ({ song, revealed = false, active = false, onPlay, playing }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative w-48 h-64 rounded-2xl overflow-hidden border-2 transition-all ${
        active ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-zinc-800'
      } bg-zinc-900`}
    >
      {revealed ? (
        <div className="h-full flex flex-col">
          <img src={song.cover} alt={song.title} className="w-full h-32 object-cover" referrerPolicy="no-referrer" />
          <div className="p-3 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm line-clamp-1">{song.title}</h3>
              <p className="text-xs text-zinc-400 line-clamp-1">{song.artist}</p>
            </div>
            <div className="text-2xl font-black italic text-emerald-500">{song.year}</div>
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Music size={32} />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-tighter">Guess the year</p>
            <div className="text-4xl font-black italic text-zinc-800">????</div>
          </div>
          {onPlay && (
            <button
              onClick={onPlay}
              className="p-3 rounded-full bg-emerald-500 text-black hover:scale-110 transition-transform"
            >
              {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};
