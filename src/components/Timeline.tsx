import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { Check, Calendar } from 'lucide-react';

const START_YEAR = 1926;
const END_YEAR = new Date().getFullYear();
const TOTAL_YEARS = END_YEAR - START_YEAR;

interface TimelineProps {
  onConfirm: (year: number) => void;
  disabled?: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({ onConfirm, disabled }) => {
  const [selectedYear, setSelectedYear] = useState(Math.floor((START_YEAR + END_YEAR) / 2));
  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  // Map x position to year
  useEffect(() => {
    const unsubscribe = x.on('change', (latestX) => {
      if (constraintsRef.current) {
        const width = constraintsRef.current.offsetWidth;
        if (width === 0) return;
        
        const percentage = Math.max(0, Math.min(1, latestX / width));
        const year = Math.round(START_YEAR + percentage * TOTAL_YEARS);
        setSelectedYear(year);
      }
    });
    return () => unsubscribe();
  }, [x]);

  // Initial position
  useEffect(() => {
    const setInitialPos = () => {
      if (constraintsRef.current) {
        const width = constraintsRef.current.offsetWidth;
        const initialPercentage = (selectedYear - START_YEAR) / TOTAL_YEARS;
        x.set(initialPercentage * width);
      }
    };

    setInitialPos();
    // Re-calculate on window resize
    window.addEventListener('resize', setInitialPos);
    return () => window.removeEventListener('resize', setInitialPos);
  }, []);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !constraintsRef.current) return;
    const rect = constraintsRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const year = Math.round(START_YEAR + percentage * TOTAL_YEARS);
    
    x.set(clickX);
    setSelectedYear(year);
  };

  return (
    <div className="w-full space-y-8 select-none">
      {/* Year Indicator */}
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="flex items-center space-x-3 text-emerald-500">
          <Calendar size={20} />
          <span className="text-xs font-mono uppercase tracking-[0.3em] font-bold">Selected Year</span>
        </div>
        <motion.div 
          key={selectedYear}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-7xl font-black italic text-white tabular-nums tracking-tighter"
        >
          {selectedYear}
        </motion.div>
      </div>

      {/* Timeline Track */}
      <div className="relative px-4">
        <div 
          ref={constraintsRef}
          className="relative h-16 bg-zinc-900 rounded-2xl border border-zinc-800 cursor-pointer overflow-visible"
          onClick={handleTimelineClick}
        >
          {/* Tick marks */}
          <div className="absolute inset-0 flex justify-between px-6 items-center pointer-events-none opacity-20">
            {[...Array(21)].map((_, i) => (
              <div 
                key={i} 
                className={`w-px bg-white transition-all ${i % 5 === 0 ? 'h-8 w-0.5 opacity-50' : 'h-4 opacity-30'}`} 
              />
            ))}
          </div>

          {/* Progress bar */}
          <motion.div 
            className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 rounded-l-2xl border-r border-emerald-500/30 pointer-events-none"
            style={{ width: x }}
          />

          {/* Timeline Marker (Draggable) */}
          <motion.div
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0}
            dragMomentum={false}
            style={{ x }}
            className="absolute top-1/2 -translate-y-1/2 -ml-5 w-10 h-10 bg-white rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.3)] cursor-grab active:cursor-grabbing flex items-center justify-center z-20 hover:scale-110 transition-transform"
          >
            <div className="w-1 h-4 bg-zinc-900 rounded-full" />
          </motion.div>
        </div>

        {/* Labels */}
        <div className="flex justify-between mt-4 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-600">
          <span>{START_YEAR}</span>
          <span>{Math.round(START_YEAR + TOTAL_YEARS / 2)}</span>
          <span>{END_YEAR}</span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={() => onConfirm(selectedYear)}
          disabled={disabled}
          className="group relative bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed text-black font-black py-5 px-12 rounded-2xl transition-all flex items-center gap-3 shadow-[0_10px_40px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_50px_rgba(16,185,129,0.4)] active:scale-95"
        >
          <Check size={24} strokeWidth={3} />
          <span className="text-xl italic uppercase tracking-tight">Submit Guess</span>
        </button>
      </div>
    </div>
  );
};
