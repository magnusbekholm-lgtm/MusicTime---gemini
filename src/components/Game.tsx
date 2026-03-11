import { Room, Player } from '../types';
import { SongPlayer } from './SongPlayer';
import { Timeline } from './Timeline';
import { useGameState } from '../hooks/useGameState';
import { submitGuess, nextRound } from '../services/game';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Music, CheckCircle2, XCircle, Timer } from 'lucide-react';

interface GameProps {
  state: Room;
  userId: string;
}

export const Game: React.FC<GameProps> = ({ state, userId }) => {
  const { timeLeft } = useGameState(state);
  const isHost = state.host === userId;
  const myGuess = state.guesses[userId];
  const hasGuessed = !!myGuess;
  const isRevealed = state.state === 'round_end' || state.state === 'game_end';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
        <div className="flex items-center space-x-4">
          <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500">
            <Music size={24} />
          </div>
          <div>
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Round</p>
            <p className="font-black italic text-2xl">{state.currentRound} / {state.settings.maxRounds}</p>
          </div>
        </div>

        <div className="flex items-center space-x-8">
          {state.state === 'playing' && (
            <div className="flex items-center space-x-3 bg-black/40 px-4 py-2 rounded-2xl border border-zinc-800">
              <Timer className={timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-emerald-500'} size={20} />
              <span className={`font-mono text-xl font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-white'}`}>
                {timeLeft}s
              </span>
            </div>
          )}
          <div className="flex items-center space-x-3">
            <Trophy className="text-emerald-500" size={24} />
            <div className="text-right">
              <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Your Score</p>
              <p className="font-black italic text-2xl">{state.scores[userId] || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="flex flex-col items-center space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.song?.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-full"
            >
              <SongPlayer 
                song={state.song} 
                revealed={isRevealed} 
              />
            </motion.div>
          </AnimatePresence>

          {state.state === 'playing' && !hasGuessed && (
            <div className="w-full max-w-xl mx-auto">
              <Timeline 
                onConfirm={(year) => submitGuess(state.id, userId, year)}
                disabled={hasGuessed}
              />
            </div>
          )}

          {hasGuessed && state.state === 'playing' && (
            <div className="text-center space-y-4 bg-emerald-500/5 p-8 rounded-[2rem] border border-emerald-500/20 w-full max-w-sm">
              <div className="flex items-center justify-center space-x-3 text-emerald-500">
                <CheckCircle2 size={32} strokeWidth={3} />
                <span className="text-2xl font-black italic uppercase tracking-tight">Locked In</span>
              </div>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em]">Waiting for other players</p>
            </div>
          )}

          {state.state === 'round_end' && (
            <div className="text-center space-y-6 w-full max-w-sm">
              <div className={`text-6xl font-black italic uppercase tracking-tighter ${myGuess?.isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
                {myGuess?.isCorrect ? 'CORRECT!' : 'WRONG!'}
              </div>
              <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-1">Actual Year</p>
                <p className="text-4xl font-black italic text-white">{state.song?.year}</p>
              </div>
              {isHost && (
                <button
                  onClick={() => nextRound(state.id)}
                  className="w-full bg-white text-black font-black py-5 rounded-2xl hover:scale-105 transition-all shadow-2xl text-xl italic uppercase"
                >
                  Next Round
                </button>
              )}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-6">
          <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center space-x-2">
            <Trophy size={20} className="text-emerald-500" />
            <span>Leaderboard</span>
          </h3>
          <div className="space-y-3">
            {Object.entries(state.players)
              .sort((a, b) => (state.scores[b[0]] || 0) - (state.scores[a[0]] || 0))
              .map(([uid, player], idx) => (
                <div key={uid} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-zinc-800/50">
                  <div className="flex items-center space-x-3">
                    <span className="text-zinc-600 font-mono text-xs w-4">{idx + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden">
                      {player.photoURL ? <img src={player.photoURL} alt={player.displayName} /> : <span className="text-xs flex items-center justify-center h-full">{player.displayName[0]}</span>}
                    </div>
                    <span className="font-bold text-sm">{player.displayName}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    {state.guesses[uid] && (
                      <div className={state.guesses[uid].isCorrect ? 'text-emerald-500' : 'text-zinc-600'}>
                        {state.guesses[uid].isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      </div>
                    )}
                    <span className="font-black italic text-emerald-500">{state.scores[uid] || 0}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
