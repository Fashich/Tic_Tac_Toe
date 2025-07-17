'use client';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { Game, GameState, CellValue, Player, GameType, AIDifficulty } from '@/lib/types';
import { createGameState, getAIMove, makeMove, getOpponent } from '@/lib/game';
import { useAuth } from './AuthContext';
interface GameContextType {
  currentGame: Game | null;
  gameState: GameState | null;
  createGame: (type: GameType, aiDifficulty?: AIDifficulty) => Promise<string | null>;
  joinGame: (roomCode: string) => Promise<boolean>;
  makeGameMove: (position: number) => Promise<boolean>;
  loadGame: (gameId: string) => Promise<boolean>;  
  socket: Socket | null;
  isConnected: boolean;
  loading: boolean;
  error: string | null;
}
const GameContext = createContext<GameContextType | undefined>(undefined);
export function GameProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (user) {
      initializeSocket();
    } else {
      disconnectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [user]);
  const initializeSocket = () => {
    const newSocket = io({
      auth: {
        token: localStorage.getItem('token'),
      },
    });
    newSocket.on('connect', () => {
      setIsConnected(true);
    });
    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });
    newSocket.on('gameUpdate', (game: Game) => {
      setCurrentGame(game);
      updateGameState(game);
    });
    newSocket.on('playerJoined', (game: Game) => {
      setCurrentGame(game);
      updateGameState(game);
    });
    newSocket.on('moveMade', (game: Game) => {
      setCurrentGame(game);
      updateGameState(game);
    });
    setSocket(newSocket);
  };
  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };
  const updateGameState = (game: Game) => {
    const board = game.board.split('').map(char => char === ' ' ? '' : char as CellValue);
    const newGameState = createGameState(board, game.currentTurn as Player);
    setGameState(newGameState);
  };
  const createGame = async (type: GameType, aiDifficulty?: AIDifficulty): Promise<string | null> => {
    if (!user) return null;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/games/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ type, aiDifficulty }),
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentGame(data.game);
        updateGameState(data.game);
        
        if (socket && (type === 'ONLINE' || type === 'PUBLIC')) {
          socket.emit('joinRoom', data.game.id);
        }        
        return data.game.id;
      } else {
        setError(data.error || 'Failed to create game');
        return null;
      }
    } catch (error) {
      setError('Network error');
      return null;
    } finally {
      setLoading(false);
    }
  };
  const joinGame = async (roomCode: string): Promise<boolean> => {
    if (!user) return false;    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/games/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ roomCode }),
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentGame(data.game);
        updateGameState(data.game);        
        if (socket) {
          socket.emit('joinRoom', data.game.id);
        }        
        return true;
      } else {
        setError(data.error || 'Failed to join game');
        return false;
      }
    } catch (error) {
      setError('Network error');
      return false;
    } finally {
      setLoading(false);
    }
  };
  const makeGameMove = async (position: number): Promise<boolean> => {
    if (!currentGame || !gameState || !user) return false;
    const isPlayer1 = currentGame.player1Id === user.id;
    const isPlayer2 = currentGame.player2Id === user.id;
    const expectedSymbol = isPlayer1 ? 'X' : 'O';    
    if (gameState.currentPlayer !== expectedSymbol) return false;
    if (gameState.board[position] !== '') return false;
    if (gameState.isGameOver) return false;
    try {
      const response = await fetch('/api/games/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          gameId: currentGame.id,
          position,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentGame(data.game);
        updateGameState(data.game);
        if (socket) {
          socket.emit('makeMove', {
            gameId: currentGame.id,
            position,
            game: data.game,
          });
        }
        if (data.game.gameType === 'AI' && !data.game.winner && !data.game.isDraw) {
          setTimeout(async () => {
            await handleAIMove(data.game);
          }, 500);
        }        
        return true;
      } else {
        setError(data.error || 'Failed to make move');
        return false;
      }
    } catch (error) {
      setError('Network error');
      return false;
    }
  };
  const handleAIMove = async (game: Game) => {
    if (!game.aiDifficulty) return;    
    const board = game.board.split('').map(char => char === ' ' ? '' : char as CellValue);
    const aiPosition = getAIMove(board, game.aiDifficulty);    
    if (aiPosition === -1) return;
    try {
      const response = await fetch('/api/games/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          gameId: game.id,
          position: aiPosition,
          isAI: true,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentGame(data.game);
        updateGameState(data.game);
      }
    } catch (error) {
      console.error('AI move failed:', error);
    }
  };
  const loadGame = async (gameId: string): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentGame(data.game);
        updateGameState(data.game);        
        if (socket && (data.game.gameType === 'ONLINE' || data.game.gameType === 'PUBLIC')) {
          socket.emit('joinRoom', data.game.id);
        }        
        return true;
      } else {
        setError(data.error || 'Failed to load game');
        return false;
      }
    } catch (error) {
      setError('Network error');
      return false;
    } finally {
      setLoading(false);
    }
  };
  return (
    <GameContext.Provider value={{
      currentGame,
      gameState,
      createGame,
      joinGame,
      makeGameMove,
      loadGame,
      socket,
      isConnected,
      loading,
      error,
    }}>
      {children}
    </GameContext.Provider>
  );
}
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}