'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Users, Gamepad2 } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
function JoinGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { joinGame, loading } = useGame();
  
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setRoomCode(codeFromUrl.toUpperCase());
    }
  }, [searchParams]);
  useEffect(() => {
    if (user && roomCode && !loading) {
      handleJoinGame();
    }
  }, [user, roomCode]);
  const handleJoinGame = async () => {
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    setError('');
    const success = await joinGame(roomCode.trim().toUpperCase());    
    if (!success) {
      setError('Failed to join game. Please check the room code and try again.');
    }
  };
  const handleGoHome = () => {
    router.push('/');
  };
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }
  if (!user) {
    router.push('/');
    return null;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gamepad2 className="h-8 w-8 text-blue-600" />
            <CardTitle className="text-2xl">Join Game</CardTitle>
          </div>
          <CardDescription>
            Enter the room code to join a friend's game
          </CardDescription>
        </CardHeader>        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="roomCode">Room Code</Label>
            <Input
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              maxLength={6}
              className="uppercase text-center text-lg font-mono"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 text-center">
              Room codes are 6 characters long (letters and numbers)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="flex-1"
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <Button
              onClick={handleJoinGame}
              disabled={!roomCode.trim() || loading}
              className="flex-1"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Join Game
                </>
              )}
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              {"Don't have a room code? "}
              <Button
                variant="link"
                className="p-0 h-auto font-normal"
                onClick={handleGoHome}
                disabled={loading}
              >
                Create a new game
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default function JoinGamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    }>
      <JoinGameContent />
    </Suspense>
  );
}