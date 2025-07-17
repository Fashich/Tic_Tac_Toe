export type GameType = 'LOCAL' | 'AI' | 'ONLINE' | 'PUBLIC';
export type GameStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
export type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
export type Player = 'X' | 'O';
export type CellValue = 'X' | 'O' | '';
export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}
export interface Game {
  id: string;
  roomCode?: string;
  gameType: GameType;
  status: GameStatus;
  board: string;
  currentTurn: Player;
  winner?: string;
  isDraw: boolean;
  createdAt: string;
  updatedAt: string;
  player1Id?: string;
  player2Id?: string;
  player1?: User;
  player2?: User;
  aiDifficulty?: AIDifficulty;
  moves: Move[];
}
export interface Move {
  id: string;
  gameId: string;
  userId?: string;
  position: number;
  symbol: Player;
  moveNumber: number;
  createdAt: string;
  user?: User;
}
export interface GameState {
  board: CellValue[];
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  isGameOver: boolean;
  winningLine?: number[];
}
export interface AuthUser {
  id: string;
  email: string;
  username: string;
}
export interface LoginCredentials {
  email: string;
  password: string;
}
export interface SignupCredentials {
  email: string;
  username: string;
  password: string;
}
export interface GameRoom {
  id: string;
  code: string;
  host: User;
  guest?: User;
  status: 'waiting' | 'playing' | 'finished';
}
export interface TutorialStep {
  id: number;
  title: string;
  description: string;
  highlight?: number[];
  action?: 'click' | 'wait';
  position?: number;
}