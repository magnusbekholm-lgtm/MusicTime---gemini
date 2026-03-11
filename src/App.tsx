import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { CreateGame } from './pages/CreateGame';
import { JoinGame } from './pages/JoinGame';
import { Lobby } from './pages/Lobby';
import { Game } from './components/Game';
import { Results } from './pages/Results';
import { SinglePlayerGame } from './pages/SinglePlayerGame';
import { SinglePlayerResults } from './pages/SinglePlayerResults';
import { createRoom, joinRoom } from './services/game';
import { useRoom } from './hooks/useRoom';
import { Room, Player, GameSettings, SinglePlayerState } from './types';
import { LogIn, Music } from 'lucide-react';

type Page = 'home' | 'create' | 'join' | 'lobby' | 'game' | 'results' | 'single_player' | 'single_player_results';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState<string | null>(null);
  const { room: gameState } = useRoom(roomId);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [singlePlayerState, setSinglePlayerState] = useState<SinglePlayerState | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const userRef = doc(db, 'users', u.uid);
        await setDoc(userRef, {
          uid: u.uid,
          displayName: u.displayName || 'Anonymous',
          photoURL: u.photoURL || '',
          email: u.email || ''
        }, { merge: true });
        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (gameState) {
      if (gameState.state === 'lobby') setCurrentPage('lobby');
      else if (gameState.state === 'game_end') setCurrentPage('results');
      else setCurrentPage('game');
    }
  }, [gameState?.state]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleCreateRoom = async (settings: GameSettings) => {
    if (!user) return;
    const player: Player = {
      uid: user.uid,
      displayName: user.displayName || 'Anonymous',
      photoURL: user.photoURL || ''
    };
    const roomId = await createRoom(player, settings);
    setRoomId(roomId);
  };

  const handleJoinRoom = async (code: string) => {
    if (!user) return;
    const player: Player = {
      uid: user.uid,
      displayName: user.displayName || 'Anonymous',
      photoURL: user.photoURL || ''
    };
    try {
      await joinRoom(code, player);
      setRoomId(code);
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center">
          <div className="animate-pulse text-emerald-500 flex flex-col items-center space-y-4">
            <Music size={48} className="animate-bounce" />
            <p className="font-mono uppercase tracking-widest">Loading Experience...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="h-[80vh] flex flex-col items-center justify-center space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-8xl font-black tracking-tighter uppercase italic">
              Hitster <span className="text-emerald-500">Clone</span>
            </h1>
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Sign in to start your musical journey</p>
          </div>
          <button
            onClick={handleLogin}
            className="bg-white text-black font-black px-8 py-4 rounded-2xl flex items-center space-x-3 hover:scale-105 transition-all"
          >
            <LogIn size={20} />
            <span>SIGN IN WITH GOOGLE</span>
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {currentPage === 'home' && (
        <Home 
          onCreateClick={() => setCurrentPage('create')} 
          onJoinClick={() => setCurrentPage('join')} 
          onSinglePlayerClick={() => setCurrentPage('single_player')}
        />
      )}
      {currentPage === 'create' && (
        <CreateGame 
          onBack={() => setCurrentPage('home')} 
          onCreate={handleCreateRoom} 
        />
      )}
      {currentPage === 'join' && (
        <JoinGame 
          onBack={() => setCurrentPage('home')} 
          onJoin={handleJoinRoom} 
        />
      )}
      {currentPage === 'lobby' && gameState && (
        <Lobby room={gameState} userId={user.uid} />
      )}
      {currentPage === 'game' && gameState && (
        <Game state={gameState} userId={user.uid} />
      )}
      {currentPage === 'results' && gameState && (
        <Results room={gameState} userId={user.uid} onHome={() => {
          setRoomId(null);
          setCurrentPage('home');
        }} />
      )}
      {currentPage === 'single_player' && (
        <SinglePlayerGame 
          onGameEnd={(finalState) => {
            setSinglePlayerState(finalState);
            setCurrentPage('single_player_results');
          }} 
        />
      )}
      {currentPage === 'single_player_results' && singlePlayerState && (
        <SinglePlayerResults 
          state={singlePlayerState} 
          onHome={() => {
            setSinglePlayerState(null);
            setCurrentPage('home');
          }}
          onRestart={() => {
            setSinglePlayerState(null);
            setCurrentPage('single_player');
          }}
        />
      )}
    </Layout>
  );
}
