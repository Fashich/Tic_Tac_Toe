'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Users, Bot, Globe, Clock, Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import type { Game } from '@/lib/types';
interface GameHistoryProps {
  onBack: () => void;
}
export function GameHistory({ onBack }: GameHistoryProps) {
  const { user } = useAuth();
  const { loadGame } = useGame();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchGames();
  }, []);
  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/games/list?type=my', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setGames(data.games);
      } else {
        setError('Failed to load games');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueGame = async (gameId: string) => {
    const success = await loadGame(gameId);
    if (success) {
      window.location.href = `/game/${gameId}`;
    }
  };
  const getGameTypeIcon = (type: string) => {
    switch (type) {
      case 'AI': return Bot;
      case 'LOCAL': return Users;
      case 'ONLINE': return Users;
      case 'PUBLIC': return Globe;
      default: return Users;
    }
  };
  const getGameTypeColor = (type: string) => {
    switch (type) {
      case 'AI': return 'bg-green-100 text-green-800';
      case 'LOCAL': return 'bg-blue-100 text-blue-800';
      case 'ONLINE': return 'bg-purple-100 text-purple-800';
      case 'PUBLIC': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getGameResult = (game: Game) => {
    if (!user) return 'Unknown';    
    if (game.isDraw) return 'Draw';
    if (!game.winner) return 'In Progress';    
    const isPlayer1 = game.player1Id === user.id;
    const playerSymbol = isPlayer1 ? 'X' : 'O';    
    return game.winner === playerSymbol ? 'Won' : 'Lost';
  };
  const getResultColor = (result: string) => {
    switch (result) {
      case 'Won': return 'text-green-600';
      case 'Lost': return 'text-red-600';
      case 'Draw': return 'text-yellow-600';
      case 'In Progress': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menu
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Game History</h1>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your games...</p>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menu
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Game History</h1>
          </div>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchGames}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Menu
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Game History</h1>
        </div>
        {games.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">No games yet</h2>
            <p className="text-gray-500 mb-6">Start playing to see your game history here!</p>
            <Button onClick={onBack}>Start Your First Game</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {games.map((game) => {
              const GameTypeIcon = getGameTypeIcon(game.gameType);
              const result = getGameResult(game);
              const opponent = game.player1Id === user?.id ? game.player2 : game.player1;              
              return (
                <Card key={game.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getGameTypeColor(game.gameType)}`}>
                          <GameTypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {game.gameType === 'AI' ? 'vs AI' : 
                             game.gameType === 'LOCAL' ? 'Local Game' :
                             opponent ? `vs ${opponent.username}` : 'Waiting for opponent'}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {new Date(game.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={getResultColor(result)}>
                          {result}
                        </Badge>
                        {game.roomCode && (
                          <p className="text-sm text-gray-500 mt-1">
                            Room: {game.roomCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Status:</span> {game.status.replace('_', ' ')}
                        </div>
                        {game.aiDifficulty && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Difficulty:</span> {game.aiDifficulty}
                          </div>
                        )}
                      </div>
                      {game.status === 'IN_PROGRESS' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleContinueGame(game.id)}
                          className="flex items-center gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Continue
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}