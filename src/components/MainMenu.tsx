'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gamepad2, Users, Bot, Globe, BookOpen, History, Plus, UserPlus } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import type { AIDifficulty } from '@/lib/types';
interface MainMenuProps {
  onStartTutorial: () => void;
  onShowHistory: () => void;
}
export function MainMenu({ onStartTutorial, onShowHistory }: MainMenuProps) {
  const { createGame, joinGame, loading } = useGame();
  const { user } = useAuth();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('MEDIUM');
  const handleCreateLocalGame = async () => {
    const gameId = await createGame('LOCAL');
    if (gameId) {
      window.location.href = `/game/${gameId}`;
    }
  };
  const handleCreateAIGame = async () => {
    const gameId = await createGame('AI', aiDifficulty);
    if (gameId) {
      setShowAIDialog(false);
      window.location.href = `/game/${gameId}`;
    }
  };
  const handleCreateOnlineGame = async () => {
    const gameId = await createGame('ONLINE');
    if (gameId) {
      window.location.href = `/game/${gameId}`;
    }
  };
  const handleCreatePublicGame = async () => {
    const gameId = await createGame('PUBLIC');
    if (gameId) {
      window.location.href = `/game/${gameId}`;
    }
  };
  const handleJoinGame = async () => {
    if (!roomCode.trim()) return;    
    const success = await joinGame(roomCode.trim().toUpperCase());
    if (success) {
      setShowJoinDialog(false);
      setRoomCode('');
    }
  };
  const menuItems = [
    {
      title: 'Play vs Friend',
      description: 'Play locally on the same device',
      icon: Users,
      onClick: handleCreateLocalGame,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Play vs AI',
      description: 'Challenge the computer',
      icon: Bot,
      onClick: () => setShowAIDialog(true),
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'Create Online Room',
      description: 'Create a private room for friends',
      icon: Plus,
      onClick: handleCreateOnlineGame,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Join Room',
      description: 'Join a game with a room code',
      icon: UserPlus,
      onClick: () => setShowJoinDialog(true),
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      title: 'Public Match',
      description: 'Play with random players',
      icon: Globe,
      onClick: handleCreatePublicGame,
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      title: 'Tutorial',
      description: 'Learn how to play',
      icon: BookOpen,
      onClick: onStartTutorial,
      color: 'bg-yellow-500 hover:bg-yellow-600',
    },
    {
      title: 'Game History',
      description: 'View your past games',
      icon: History,
      onClick: onShowHistory,
      color: 'bg-gray-500 hover:bg-gray-600',
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gamepad2 className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800">
              Tic-Tac-Toe
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Welcome back, {user?.username}! Choose your game mode.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={item.onClick}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? 'Loading...' : 'Start'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {}
        <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join Game</DialogTitle>
              <DialogDescription>
                Enter the room code to join a game
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="roomCode">Room Code</Label>
                <Input
                  id="roomCode"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code"
                  maxLength={6}
                  className="uppercase"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleJoinGame}
                  disabled={!roomCode.trim() || loading}
                  className="flex-1"
                >
                  {loading ? 'Joining...' : 'Join Game'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowJoinDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {}
        <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose AI Difficulty</DialogTitle>
              <DialogDescription>
                Select how challenging you want the AI to be
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={aiDifficulty} onValueChange={(value: AIDifficulty) => setAiDifficulty(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy - Makes random moves often</SelectItem>
                    <SelectItem value="MEDIUM">Medium - Balanced gameplay</SelectItem>
                    <SelectItem value="HARD">Hard - Smart moves most of the time</SelectItem>
                    <SelectItem value="EXPERT">Expert - Perfect play, very challenging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateAIGame}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Creating...' : 'Start Game'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAIDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}