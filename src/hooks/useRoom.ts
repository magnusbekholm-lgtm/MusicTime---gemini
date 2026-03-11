import { useState, useEffect } from 'react';
import { Room } from '../types';
import { subscribeToRoom } from '../services/game';

/**
 * Hook to subscribe to a music game room in real-time.
 * 
 * @param roomId The ID of the room to subscribe to.
 * @returns The current room state and a loading flag.
 */
export function useRoom(roomId: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      setRoom(updatedRoom);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  return { room, loading, error };
}
