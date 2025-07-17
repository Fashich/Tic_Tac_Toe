'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, RotateCcw, Trophy, Users, Clock, Home } from 'lucide-react';
import { GameBoard } from '@/components/GameBoard';
import { GameModeSelector } from '@/components/GameModeSelector';
import { MobileControls } from '@/components/MobileControls';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import { stringToBoard } from '@/lib/game';
export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { currentGame, gameState, makeGameMove, loadGame, loading, error } = useGame();
  const [gameLoaded, setGameLoaded] = useState(false);
  const gameId = params.id as string;
  useEffect(() => {
    if (gameId && !gameLoaded) {
      loadGame(gameId).then((success) => {
        setGameLoaded(true);
        if (!success) {
          router.push('/');
        }
      });
    }
  }, [gameId, gameLoaded, loadGame, router]);
  const handleCellClick = async (position: number) => {
    await makeGameMove(position);
  };
  const handleGoHome = () => {
    router.push('/');
  };
  const handleRestart = () => {
    router.push('/');
  };
  if (loading || !gameLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading game..." />
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGoHome} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (!currentGame || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Game Not Found</CardTitle>
            <CardDescription>The game you're looking for doesn't exist or you don't have access to it.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGoHome} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  const isPlayerTurn = () => {
    if (!user || !currentGame) return false;    
    const isPlayer1 = currentGame.player1Id === user.id;
    const isPlayer2 = currentGame.player2Id === user.id;
    const expectedSymbol = isPlayer1 ? 'X' : 'O';    
    return gameState.currentPlayer === expectedSymbol && !gameState.isGameOver;
  };
  const getGameStatus = () => {
    if (gameState.isGameOver) {
      if (gameState.winner === 'draw') {
        return { text: "It's a draw!", color: 'text-yellow-600' };
      } else {
        const isPlayer1 = currentGame.player1Id === user?.id;
        const playerSymbol = isPlayer1 ? 'X' : 'O';
        const won = gameState.winner === playerSymbol;
        
        if (currentGame.gameType === 'AI') {
          return {
            text: won ? 'You won!' : 'AI won!',
            color: won ? 'text-green-600' : 'text-red-600'
          };
        } else {
          return {
            text: won ? 'You won!' : 'You lost!',
            color: won ? 'text-green-600' : 'text-red-600'
          };
        }
      }
    } else if (currentGame.status === 'WAITING') {
      return { text: 'Waiting for opponent...', color: 'text-blue-600' };
    } else if (isPlayerTurn()) {
      return { text: 'Your turn', color: 'text-green-600' };
    } else {
      const opponentName = currentGame.gameType === 'AI' ? 'AI' : 
                          currentGame.player1Id === user?.id ? 
                          (currentGame.player2?.username || 'Opponent') :
                          (currentGame.player1?.username || 'Opponent');
      return { text: `${opponentName}'s turn`, color: 'text-blue-600' };
    }
  };
  const status = getGameStatus();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 pb-20 md:pb-4">
      <div className="max-w-4xl mx-auto">
        {}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={handleGoHome}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Home
          </Button>          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Tic-Tac-Toe
          </h1>          
          <Button variant="outline" onClick={handleRestart}>
            <RotateCcw className="h-4 w-4 mr-2" />
            New Game
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="lg:col-span-1">
            <GameModeSelector game={currentGame} />
          </div>
          {}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Game Board
                </CardTitle>
                <CardDescription className={status.color}>
                  {status.text}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                <GameBoard
                  gameState={gameState}
                  onCellClick={handleCellClick}
                  disabled={!isPlayerTurn() || currentGame.status !== 'IN_PROGRESS'}
                />
                {}
                {gameState.isGameOver && (
                  <Alert className="max-w-md">
                    <Trophy className="h-4 w-4" />
                    <AlertDescription className="font-medium">
                      {status.text}
                    </AlertDescription>
                  </Alert>
                )}
                {}
                {!gameState.isGameOver && currentGame.status === 'IN_PROGRESS' && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        gameState.currentPlayer === 'X' ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <span className="text-sm">X</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        gameState.currentPlayer === 'O' ? 'bg-red-500' : 'bg-gray-300'
                      }`} />
                      <span className="text-sm">O</span>
                    </div>
                  </div>
                )}
                {}
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Move {currentGame.moves.length + 1}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {}
      <MobileControls
        onHome={handleGoHome}
        onRestart={handleRestart}
      />
    </div>
  );
}