import React from 'react';
import { motion } from 'motion/react';
import { Music, Plus, Users, User } from 'lucide-react';

interface HomeProps {
  onCreateClick: () => void;
  onJoinClick: () => void;
  onSinglePlayerClick: () => void;
}

export const Home: React.FC<HomeProps> = ({ onCreateClick, onJoinClick, onSinglePlayerClick }) => {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-12">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-500 p-6 rounded-3xl rotate-12 shadow-2xl shadow-emerald-500/20">
            <Music size={64} className="text-black" />
          </div>
        </div>
        <h1 className="text-8xl font-black tracking-tighter uppercase italic">
          Hitster <span className="text-emerald-500">Clone</span>
        </h1>
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">The ultimate music timeline challenge</p>
      </motion.div>

      <div className="flex flex-col gap-6 w-full max-w-md">
        <button
          onClick={onSinglePlayerClick}
          className="w-full bg-emerald-500 text-black font-black px-8 py-6 rounded-2xl flex items-center justify-center space-x-4 hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 group"
        >
          <User size={32} />
          <span className="uppercase italic tracking-tight text-2xl">Single Player</span>
        </button>

        <div className="flex flex-col sm:flex-row gap-6 w-full">
          <button
            onClick={onCreateClick}
            className="flex-1 bg-white text-black font-black px-8 py-6 rounded-2xl flex flex-col items-center space-y-2 hover:scale-105 transition-all group"
          >
            <Plus size={32} className="group-hover:rotate-90 transition-transform" />
            <span className="uppercase italic tracking-tight">Create Game</span>
          </button>
          <button
            onClick={onJoinClick}
            className="flex-1 bg-zinc-900 border border-zinc-800 text-white font-black px-8 py-6 rounded-2xl flex flex-col items-center space-y-2 hover:bg-zinc-800 hover:scale-105 transition-all"
          >
            <Users size={32} className="text-emerald-500" />
            <span className="uppercase italic tracking-tight">Join Game</span>
          </button>
        </div>
      </div>
    </div>
  );
};
