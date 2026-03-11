import React from 'react';
import { motion } from 'motion/react';
import { Room } from '../types';
import { startGame } from '../services/game';
import { Users, Play, Music, Globe, Clock, Hash } from 'lucide-react';

interface LobbyProps {
  room: Room;
  userId: string;
}

export const Lobby: React.FC<LobbyProps> = ({ room, userId }) => {
  const isHost = room.host === userId;
  const players = Object.values(room.players);

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12">
      {/* Room Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 gap-8">
        <div className="space-y-2 text-center md:text-left">
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Room Code</p>
          <h2 className="text-7xl font-black tracking-tighter text-emerald-500 italic">{room.id}</h2>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="flex justify-center mb-1 text-emerald-500"><Hash size={16} /></div>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Rounds</p>
            <p className="font-black italic text-xl">{room.settings.maxRounds}</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-1 text-emerald-500"><Clock size={16} /></div>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Timer</p>
            <p className="font-black italic text-xl">{room.settings.timerSeconds}s</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-1 text-emerald-500">
              {room.settings.mode === 'global' ? <Globe size={16} /> : <Music size={16} />}
            </div>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Mode</p>
            <p className="font-black italic text-xl uppercase">{room.settings.mode}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Player List */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center space-x-2">
              <Users size={20} className="text-emerald-500" />
              <span>Players ({players.length}/{room.settings.maxPlayers})</span>
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {players.map((p, idx) => (
              <motion.div
                key={p.uid}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center space-x-4"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-zinc-800">
                  {p.photoURL ? <img src={p.photoURL} alt={p.displayName} /> : <span className="font-bold">{p.displayName[0]}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{p.displayName}</p>
                  {p.uid === room.host && <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Host</p>}
                </div>
              </motion.div>
            ))}
            {Array.from({ length: room.settings.maxPlayers - players.length }).map((_, i) => (
              <div key={i} className="border border-dashed border-zinc-800 p-4 rounded-2xl flex items-center space-x-4 opacity-30">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border-2 border-dashed border-zinc-800" />
                <div className="h-4 w-24 bg-zinc-900 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 space-y-6 flex flex-col items-center text-center">
            {isHost ? (
              <>
                <div className="bg-emerald-500/10 p-6 rounded-full text-emerald-500 animate-pulse">
                  <Play size={48} fill="currentColor" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-black italic uppercase text-xl">Ready to start?</h4>
                  <p className="text-zinc-500 text-sm">Once you start, no more players can join the lobby.</p>
                </div>
                <button
                  onClick={() => startGame(room.id)}
                  disabled={players.length < 1}
                  className="w-full bg-emerald-500 text-black font-black py-4 rounded-xl text-lg hover:bg-emerald-400 transition-colors disabled:opacity-50"
                >
                  START GAME
                </button>
              </>
            ) : (
              <>
                <div className="bg-zinc-800 p-6 rounded-full text-zinc-600 animate-spin-slow">
                  <Play size={48} fill="currentColor" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-black italic uppercase text-xl">Waiting for Host</h4>
                  <p className="text-zinc-500 text-sm">The game will begin as soon as the host starts it.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
