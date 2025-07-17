"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Bot, Globe, Clock, Copy, Share2 } from "lucide-react";
import type { Game } from "@/lib/types";

interface GameModeSelectorProps {
  game: Game;
  onInviteFriend?: () => void;
}
export function GameModeSelector({
  game,
  onInviteFriend,
}: GameModeSelectorProps) {
  const copyRoomCode = async () => {
    if (game.roomCode) {
      try {
        await navigator.clipboard.writeText(game.roomCode);
      } catch (error) {
        console.error("Failed to copy room code:", error);
      }
    }
  };
  const shareGameLink = async () => {
    const gameUrl = `${window.location.origin}/game/join?code=${game.roomCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Tic-Tac-Toe game!",
          text: `Join my game with code: ${game.roomCode}`,
          url: gameUrl,
        });
      } catch (error) {
        console.error("Failed to share:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(gameUrl);
      } catch (error) {
        console.error("Failed to copy link:", error);
      }
    }
  };
  const getGameTypeInfo = () => {
    switch (game.gameType) {
      case "LOCAL":
        return {
          icon: Users,
          title: "Local Game",
          description: "Playing on the same device",
          color: "bg-blue-100 text-blue-800",
        };
      case "AI":
        return {
          icon: Bot,
          title: "AI Game",
          description: `Playing against AI (${game.aiDifficulty})`,
          color: "bg-green-100 text-green-800",
        };
      case "ONLINE":
        return {
          icon: Users,
          title: "Private Online Game",
          description: "Playing with a friend online",
          color: "bg-purple-100 text-purple-800",
        };
      case "PUBLIC":
        return {
          icon: Globe,
          title: "Public Game",
          description: "Playing with a random player",
          color: "bg-red-100 text-red-800",
        };
      default:
        return {
          icon: Users,
          title: "Game",
          description: "Tic-Tac-Toe game",
          color: "bg-gray-100 text-gray-800",
        };
    }
  };
  const getStatusInfo = () => {
    switch (game.status) {
      case "WAITING":
        return {
          text: "Waiting for opponent",
          color: "bg-yellow-100 text-yellow-800",
        };
      case "IN_PROGRESS":
        return {
          text: "Game in progress",
          color: "bg-blue-100 text-blue-800",
        };
      case "COMPLETED":
        return {
          text: "Game completed",
          color: "bg-green-100 text-green-800",
        };
      case "ABANDONED":
        return {
          text: "Game abandoned",
          color: "bg-red-100 text-red-800",
        };
      default:
        return {
          text: "Unknown status",
          color: "bg-gray-100 text-gray-800",
        };
    }
  };
  const gameTypeInfo = getGameTypeInfo();
  const statusInfo = getStatusInfo();
  const GameTypeIcon = gameTypeInfo.icon;
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${gameTypeInfo.color}`}>
              <GameTypeIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{gameTypeInfo.title}</CardTitle>
              <CardDescription>{gameTypeInfo.description}</CardDescription>
            </div>
          </div>
          <Badge className={statusInfo.color}>{statusInfo.text}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {}
        {game.roomCode && (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Room Code</p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-2xl font-mono font-bold bg-gray-100 px-4 py-2 rounded-lg">
                  {game.roomCode}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyRoomCode}
                  className="flex items-center gap-1"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={shareGameLink}
                className="flex-1 flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share Link
              </Button>
              {onInviteFriend && (
                <Button onClick={onInviteFriend} className="flex-1">
                  Invite Friend
                </Button>
              )}
            </div>
          </div>
        )}
        {}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Players</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
              <span className="text-sm">Player 1 (X)</span>
              <span className="text-sm font-medium">
                {game.player1?.username || "You"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
              <span className="text-sm">Player 2 (O)</span>
              <span className="text-sm font-medium">
                {game.gameType === "AI"
                  ? "AI"
                  : game.player2?.username || "Waiting..."}
              </span>
            </div>
          </div>
        </div>
        {}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Created {new Date(game.createdAt).toLocaleString()}</span>
          </div>
          {game.moves.length > 0 && (
            <div>
              <span>Moves: {game.moves.length}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
