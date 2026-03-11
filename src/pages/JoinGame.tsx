import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, ChevronRight } from 'lucide-react';

interface JoinGameProps {
  onBack: () => void;
  onJoin: (code: string) => void;
}

export const JoinGame: React.FC<JoinGameProps> = ({ onBack, onJoin }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 5) {
      onJoin(code.toUpperCase());
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-12 py-12">
      <div className="flex items-center space-x-4">
        <button onClick={onBack} className="p-3 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Join <span className="text-emerald-500">Game</span></h2>
      </div>

      <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 space-y-8">
        <div className="flex justify-center">
          <div className="bg-emerald-500/10 p-6 rounded-full">
            <Users size={48} className="text-emerald-500" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3 text-center">
            <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Enter 5-Character Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={5}
              placeholder="XXXXX"
              className="w-full bg-black border border-zinc-800 p-6 rounded-2xl text-center text-5xl font-black tracking-[0.5em] outline-none focus:border-emerald-500 uppercase placeholder:text-zinc-800"
            />
          </div>

          <button
            type="submit"
            disabled={code.length !== 5}
            className="w-full bg-white text-black font-black py-6 rounded-2xl text-xl flex items-center justify-center space-x-3 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>JOIN LOBBY</span>
            <ChevronRight size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};
