import React from 'react';
import { SinglePlayerState } from '../types';
import { motion } from 'motion/react';
import { Trophy, Home, RotateCcw, Music, CheckCircle2, XCircle, Star } from 'lucide-react';

interface SinglePlayerResultsProps {
  state: SinglePlayerState;
  onHome: () => void;
  onRestart: () => void;
}

export const SinglePlayerResults: React.FC<SinglePlayerResultsProps> = ({ state, onHome, onRestart }) => {
  const averagePoints = Math.round(state.score / state.totalRounds);
  const correctGuesses = state.history.filter(h => h.isCorrect).length;

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="inline-block bg-emerald-500/10 p-6 rounded-[2.5rem] border border-emerald-500/20 mb-4"
        >
          <Trophy size={80} className="text-emerald-500" />
        </motion.div>
        
        <div className="space-y-2">
          <h1 className="text-7xl font-black italic tracking-tighter uppercase">
            Game <span className="text-emerald-500">Over</span>
          </h1>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-[0.4em]">Your musical journey ends here</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Score" 
          value={state.score.toLocaleString()} 
          icon={<Star className="text-yellow-500" />} 
          delay={0.1}
        />
        <StatCard 
          label="Correct Guesses" 
          value={`${correctGuesses} / ${state.totalRounds}`} 
          icon={<CheckCircle2 className="text-emerald-500" />} 
          delay={0.2}
        />
        <StatCard 
          label="Avg. Points" 
          value={averagePoints.toString()} 
          icon={<Music className="text-blue-500" />} 
          delay={0.3}
        />
      </div>

      {/* History List */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 space-y-8">
        <h3 className="text-2xl font-black italic uppercase tracking-tight flex items-center space-x-3">
          <Music size={24} className="text-emerald-500" />
          <span>Round History</span>
        </h3>
        
        <div className="space-y-4">
          {state.history.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + (idx * 0.05) }}
              className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-zinc-800/50 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <img 
                  src={item.song.cover} 
                  alt={item.song.title} 
                  className="w-12 h-12 rounded-lg object-cover shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="font-bold text-sm leading-tight">{item.song.title}</p>
                  <p className="text-zinc-500 text-xs">{item.song.artist} • {item.song.year}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Your Guess</p>
                  <p className={`font-bold ${item.isCorrect ? 'text-emerald-500' : 'text-zinc-400'}`}>{item.guess}</p>
                </div>
                <div className="text-right w-20">
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">Points</p>
                  <p className="font-black italic text-emerald-500">+{item.points}</p>
                </div>
                <div className={item.isCorrect ? 'text-emerald-500' : 'text-red-500/50'}>
                  {item.isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
        <button
          onClick={onRestart}
          className="bg-white text-black font-black px-12 py-5 rounded-2xl flex items-center justify-center space-x-3 hover:scale-105 transition-all shadow-2xl text-xl italic uppercase"
        >
          <RotateCcw size={24} />
          <span>Play Again</span>
        </button>
        <button
          onClick={onHome}
          className="bg-zinc-900 text-white font-black px-12 py-5 rounded-2xl flex items-center justify-center space-x-3 hover:bg-zinc-800 transition-all border border-zinc-800 text-xl italic uppercase"
        >
          <Home size={24} />
          <span>Main Menu</span>
        </button>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, delay }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay }}
    className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2rem] text-center space-y-2 relative overflow-hidden group"
  >
    <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
      {icon}
    </div>
    <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em]">{label}</p>
    <p className="text-5xl font-black italic tracking-tighter">{value}</p>
  </motion.div>
);
