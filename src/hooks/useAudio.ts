import { useState, useEffect, useRef } from 'react';

export function useAudio(url: string | null, durationLimit?: number) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!url) {
      setPlaying(false);
      setProgress(0);
      return;
    }
    
    audioRef.current = new Audio(url);
    audioRef.current.addEventListener('ended', () => setPlaying(false));
    
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [url]);

  const toggle = () => setPlaying(!playing);

  useEffect(() => {
    if (playing && audioRef.current) {
      audioRef.current.play().catch(console.error);
      
      // Handle progress and duration limit
      timerRef.current = window.setInterval(() => {
        if (audioRef.current) {
          const current = audioRef.current.currentTime;
          setProgress(current);

          if (durationLimit && current >= durationLimit) {
            setPlaying(false);
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        }
      }, 100);
    } else {
      audioRef.current?.pause();
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [playing, durationLimit]);

  return { playing, toggle, setPlaying, progress };
}
