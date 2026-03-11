import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GameSettings, Era } from '../types';
import { ArrowLeft, Play, Globe, Music, Calendar } from 'lucide-react';

interface CreateGameProps {
  onBack: () => void;
  onCreate: (settings: GameSettings) => void;
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

export const CreateGame: React.FC<CreateGameProps> = ({ onBack, onCreate }) => {
  const [settings, setSettings] = useState<GameSettings>({
    maxRounds: 15,
    timerSeconds: 25,
    maxPlayers: 10,
    mode: 'global',
    era: 'all'
  });

  return (
    <div className="max-w-xl mx-auto space-y-12 py-12">
      <div className="flex items-center space-x-4">
        <button onClick={onBack} className="p-3 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Configure <span className="text-emerald-500">Game</span></h2>
      </div>

      <div className="space-y-8 bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
        <div className="space-y-4">
          <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Game Mode</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSettings({ ...settings, mode: 'global' })}
              className={`p-6 rounded-2xl border-2 flex flex-col items-center space-y-3 transition-all ${settings.mode === 'global' ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-black/40'}`}
            >
              <Globe size={32} className={settings.mode === 'global' ? 'text-emerald-500' : 'text-zinc-600'} />
              <span className="font-black italic uppercase">Global Hits</span>
            </button>
            <button
              onClick={() => setSettings({ ...settings, mode: 'denmark' })}
              className={`p-6 rounded-2xl border-2 flex flex-col items-center space-y-3 transition-all ${settings.mode === 'denmark' ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-black/40'}`}
            >
              <Music size={32} className={settings.mode === 'denmark' ? 'text-emerald-500' : 'text-zinc-600'} />
              <span className="font-black italic uppercase">Denmark Mode</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Musical Era</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ERAS.map((era) => (
              <button
                key={era}
                onClick={() => setSettings({ ...settings, era })}
                className={`p-3 rounded-xl border text-sm font-bold uppercase italic transition-all ${settings.era === era ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-zinc-800 bg-black/40 text-zinc-400 hover:border-zinc-600'}`}
              >
                {era === 'all' ? 'All Eras' : era.replace('-present', '+')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Rounds</label>
            <input
              type="number"
              value={settings.maxRounds}
              onChange={(e) => setSettings({ ...settings, maxRounds: parseInt(e.target.value) })}
              className="w-full bg-black border border-zinc-800 p-4 rounded-xl font-black text-xl outline-none focus:border-emerald-500"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Timer (s)</label>
            <input
              type="number"
              value={settings.timerSeconds}
              onChange={(e) => setSettings({ ...settings, timerSeconds: parseInt(e.target.value) })}
              className="w-full bg-black border border-zinc-800 p-4 rounded-xl font-black text-xl outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          onClick={() => onCreate(settings)}
          className="w-full bg-emerald-500 text-black font-black py-6 rounded-2xl text-xl flex items-center justify-center space-x-3 hover:bg-emerald-400 transition-colors"
        >
          <Play size={24} fill="currentColor" />
          <span>CREATE LOBBY</span>
        </button>
      </div>
    </div>
  );
};
