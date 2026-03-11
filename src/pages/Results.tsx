import React from 'react';
import { motion } from 'motion/react';
import { Room, Player, Guess } from '../types';
import { Trophy, Home as HomeIcon, RotateCcw, Target, Zap, BarChart3, Star } from 'lucide-react';

interface ResultsProps {
  room: Room;
  userId: string;
  onHome: () => void;
}

export const Results: React.FC<ResultsProps> = ({ room, userId, onHome }) => {
  const sortedPlayers = Object.entries(room.players)
    .sort((a, b) => (room.scores[b[0]] || 0) - (room.scores[a[0]] || 0));

  const myRank = sortedPlayers.findIndex(([uid]) => uid === userId) + 1;
  const myScore = room.scores[userId] || 0;
  const myHistory = room.history?.[userId] || {};
  const historyArray = Object.values(myHistory);
  
  const totalRounds = room.settings.maxRounds;
  const correctGuesses = historyArray.filter(g => g.isCorrect).length;
  const accuracy = totalRounds > 0 ? Math.round((correctGuesses / totalRounds) * 100) : 0;
  
  const totalDistance = historyArray.reduce((acc, g) => acc + Math.abs(g.year - g.targetYear), 0);
  const avgDistance = historyArray.length > 0 ? (totalDistance / historyArray.length).toFixed(1) : '0';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-emerald-500 p-6 md:p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-500/40 rotate-3">
            <Trophy size={64} className="text-black md:w-20 md:h-20" />
          </div>
        </motion.div>
        <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
          Final <span className="text-emerald-500">Standings</span>
        </h2>
        <p className="text-zinc-500 font-mono text-xs md:text-sm uppercase tracking-[0.3em]">The music has stopped. The legends remain.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PlayerStats label="Rank" value={`#${myRank}`} icon={<Target className="text-emerald-500" />} delay={0.1} />
        <PlayerStats label="Score" value={myScore.toLocaleString()} icon={<Star className="text-yellow-500" />} delay={0.2} />
        <PlayerStats label="Accuracy" value={`${accuracy}%`} icon={<Zap className="text-blue-500" />} delay={0.3} />
        <PlayerStats label="Avg. Error" value={`${avgDistance}y`} icon={<BarChart3 className="text-purple-500" />} delay={0.4} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <Leaderboard sortedPlayers={sortedPlayers} scores={room.scores} currentUserId={userId} />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2rem] space-y-6">
            <h3 className="text-xl font-black italic uppercase tracking-tight">What's next?</h3>
            <div className="space-y-4">
              <PlayAgainButton onClick={onHome} />
              <button
                onClick={onHome}
                className="w-full bg-zinc-800 text-white font-black py-5 rounded-2xl flex items-center justify-center space-x-3 hover:bg-zinc-700 transition-all border border-zinc-700 uppercase italic"
              >
                <HomeIcon size={20} />
                <span>Main Menu</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlayerStats: React.FC<{ label: string; value: string; icon: React.ReactNode; delay: number }> = ({ label, value, icon, delay }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay }}
    className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl text-center space-y-1 relative overflow-hidden group"
  >
    <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-30 transition-opacity">
      {icon}
    </div>
    <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">{label}</p>
    <p className="text-2xl md:text-3xl font-black italic text-white">{value}</p>
  </motion.div>
);

const Leaderboard: React.FC<{ sortedPlayers: [string, Player][]; scores: Record<string, number>; currentUserId: string }> = ({ sortedPlayers, scores, currentUserId }) => (
  <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] overflow-hidden">
    <div className="p-6 border-b border-zinc-800 bg-zinc-900/80">
      <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center space-x-3">
        <BarChart3 size={24} className="text-emerald-500" />
        <span>Leaderboard</span>
      </h3>
    </div>
    <div className="divide-y divide-zinc-800/50">
      {sortedPlayers.map(([uid, player], idx) => (
        <motion.div
          key={uid}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 + (idx * 0.1) }}
          className={`flex items-center justify-between p-5 ${uid === currentUserId ? 'bg-emerald-500/5' : ''}`}
        >
          <div className="flex items-center space-x-4">
            <span className={`text-xl font-black italic w-8 ${idx === 0 ? 'text-emerald-500' : idx === 1 ? 'text-zinc-400' : idx === 2 ? 'text-amber-700' : 'text-zinc-600'}`}>
              #{idx + 1}
            </span>
            <div className="relative">
              <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${uid === currentUserId ? 'border-emerald-500' : 'border-zinc-800'}`}>
                {player.photoURL ? (
                  <img src={player.photoURL} alt={player.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-500">
                    {player.displayName[0]}
                  </div>
                )}
              </div>
              {idx === 0 && (
                <div className="absolute -top-1 -right-1 bg-emerald-500 text-black rounded-full p-1 shadow-lg">
                  <Trophy size={12} />
                </div>
              )}
            </div>
            <div>
              <p className={`font-bold ${uid === currentUserId ? 'text-emerald-500' : 'text-white'}`}>
                {player.displayName}
                {uid === currentUserId && <span className="ml-2 text-[10px] font-mono uppercase tracking-widest opacity-60">(You)</span>}
              </p>
              <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest">
                {idx === 0 ? 'The Maestro' : idx === 1 ? 'Virtuoso' : idx === 2 ? 'Apprentice' : 'Listener'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black italic text-emerald-500">{(scores[uid] || 0).toLocaleString()}</p>
            <p className="text-zinc-600 font-mono text-[9px] uppercase tracking-widest">Points</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const PlayAgainButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-white text-black font-black py-6 rounded-2xl text-xl flex items-center justify-center space-x-3 hover:scale-105 transition-all shadow-2xl shadow-white/10 uppercase italic"
  >
    <RotateCcw size={24} />
    <span>Play Again</span>
  </button>
);
