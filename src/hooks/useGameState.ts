import { useState, useEffect, useRef } from 'react';
import { Room, RoomState } from '../types';

interface GameEvents {
  onGameStarted?: () => void;
  onRoundStarted?: (round: number) => void;
  onGuessSubmitted?: (userId: string) => void;
  onRoundEnded?: () => void;
  onGameEnded?: () => void;
}

/**
 * Hook to manage and synchronize game state across all players.
 * Handles the synchronized timer and game event triggers.
 * 
 * @param room The current room state from useRoom.
 * @param events Optional callbacks for game events.
 * @returns Synchronized timer and derived game state.
 */
export function useGameState(room: Room | null, events?: GameEvents) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const prevRoomState = useRef<RoomState | null>(null);
  const prevRound = useRef<number>(0);
  const prevGuessesCount = useRef<number>(0);

  // Synchronized Timer Logic
  useEffect(() => {
    if (!room || room.state !== 'playing' || !room.startTime) {
      setTimeLeft(0);
      return;
    }

    const timerSeconds = room.settings.timerSeconds;
    
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = (now - room.startTime!) / 1000;
      const remaining = Math.max(0, Math.ceil(timerSeconds - elapsed));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [room?.startTime, room?.state, room?.settings.timerSeconds]);

  // Event Trigger Logic
  useEffect(() => {
    if (!room) return;

    // Game Started
    if (prevRoomState.current === 'lobby' && room.state === 'playing') {
      events?.onGameStarted?.();
    }

    // Round Started
    if (room.state === 'playing' && room.currentRound !== prevRound.current) {
      events?.onRoundStarted?.(room.currentRound);
    }

    // Guess Submitted
    const currentGuessesCount = Object.keys(room.guesses || {}).length;
    if (currentGuessesCount > prevGuessesCount.current) {
      // Find who guessed
      const newGuesser = Object.keys(room.guesses).find(uid => !prevRoomState.current || !room.guesses[uid]);
      if (newGuesser) events?.onGuessSubmitted?.(newGuesser);
    }

    // Round Ended
    if (prevRoomState.current === 'playing' && room.state === 'round_end') {
      events?.onRoundEnded?.();
    }

    // Game Ended
    if (prevRoomState.current !== 'game_end' && room.state === 'game_end') {
      events?.onGameEnded?.();
    }

    // Update refs for next change
    prevRoomState.current = room.state;
    prevRound.current = room.currentRound;
    prevGuessesCount.current = currentGuessesCount;
  }, [room, events]);

  return {
    timeLeft,
    isTimeUp: timeLeft === 0 && room?.state === 'playing',
    currentRound: room?.currentRound || 0,
    totalRounds: room?.settings.maxRounds || 0,
    gameState: room?.state || 'lobby'
  };
}
