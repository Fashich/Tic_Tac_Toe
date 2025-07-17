import type { CellValue, Player, GameState, AIDifficulty } from './types';
export const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
export function createEmptyBoard(): CellValue[] {
  return Array(9).fill('');
}
export function checkWinner(board: CellValue[]): { winner: Player | 'draw' | null; winningLine?: number[] } {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, winningLine: combination };
    }
  }
  if (board.every(cell => cell !== '')) {
    return { winner: 'draw' };
  }
  return { winner: null };
}
export function makeMove(board: CellValue[], position: number, player: Player): CellValue[] {
  if (board[position] !== '' || position < 0 || position > 8) {
    return board;
  }  
  const newBoard = [...board];
  newBoard[position] = player;
  return newBoard;
}
export function getAvailableMoves(board: CellValue[]): number[] {
  return board.map((cell, index) => cell === '' ? index : -1).filter(index => index !== -1);
}
export function getOpponent(player: Player): Player {
  return player === 'X' ? 'O' : 'X';
}
export function minimax(board: CellValue[], depth: number, isMaximizing: boolean, alpha: number = -Infinity, beta: number = Infinity): number {
  const result = checkWinner(board);  
  if (result.winner === 'O') return 10 - depth;
  if (result.winner === 'X') return depth - 10;
  if (result.winner === 'draw') return 0;
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'O';
        const evaluation = minimax(board, depth + 1, false, alpha, beta);
        board[i] = '';
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'X';
        const evaluation = minimax(board, depth + 1, true, alpha, beta);
        board[i] = '';
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
    }
    return minEval;
  }
}
export function getAIMove(board: CellValue[], difficulty: AIDifficulty): number {
  const availableMoves = getAvailableMoves(board);  
  if (availableMoves.length === 0) return -1;  
  switch (difficulty) {
    case 'EASY':
      if (Math.random() < 0.7) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      }
      break;      
    case 'MEDIUM':
      if (Math.random() < 0.4) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      }
      break;      
    case 'HARD':
      if (Math.random() < 0.15) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      }
      break;      
    case 'EXPERT':
      break;
  }
  let bestMove = availableMoves[0];
  let bestValue = -Infinity;
  
  for (const move of availableMoves) {
    const newBoard = [...board];
    newBoard[move] = 'O';
    const moveValue = minimax(newBoard, 0, false);
    
    if (moveValue > bestValue) {
      bestValue = moveValue;
      bestMove = move;
    }
  }
  
  return bestMove;
}
export function boardToString(board: CellValue[]): string {
  return board.map(cell => cell || ' ').join('');
}
export function stringToBoard(boardString: string): CellValue[] {
  return boardString.split('').map(char => char === ' ' ? '' : char as CellValue);
}
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
export function createGameState(board: CellValue[], currentPlayer: Player): GameState {
  const result = checkWinner(board);
  return {
    board,
    currentPlayer,
    winner: result.winner,
    isGameOver: result.winner !== null,
    winningLine: result.winningLine,
  };
}
export const TUTORIAL_STEPS = [
  {
    id: 1,
    title: "Welcome to Tic-Tac-Toe!",
    description: "This is a 3x3 grid where you'll place your marks. You are X, and you'll go first.",
    highlight: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    action: 'wait' as const,
  },
  {
    id: 2,
    title: "Make Your First Move",
    description: "Click on any empty square to place your X. Try clicking the center square!",
    highlight: [4],
    action: 'click' as const,
    position: 4,
  },
  {
    id: 3,
    title: "AI's Turn",
    description: "Great! Now the AI (O) will make its move. Watch where it places its mark.",
    action: 'wait' as const,
  },
  {
    id: 4,
    title: "Your Goal",
    description: "Try to get three X's in a row - horizontally, vertically, or diagonally. Make another move!",
    action: 'click' as const,
  },
  {
    id: 5,
    title: "Keep Playing",
    description: "Continue making moves. Try to win or block the AI from winning!",
    action: 'click' as const,
  },
  {
    id: 6,
    title: "Game Complete!",
    description: "Well done! You've learned how to play. Now you can start a real game from the main menu.",
    action: 'wait' as const,
  },
];