'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import type { CellValue, GameState } from '@/lib/types';
interface GameBoardProps {
  gameState: GameState;
  onCellClick: (position: number) => void;
  disabled?: boolean;
  highlightCells?: number[];
  className?: string;
}
export function GameBoard({ 
  gameState, 
  onCellClick, 
  disabled = false, 
  highlightCells = [],
  className 
}: GameBoardProps) {
  const { board, isGameOver, winningLine } = gameState;
  const getCellClassName = (index: number, value: CellValue) => {
    const isWinningCell = winningLine?.includes(index);
    const isHighlighted = highlightCells.includes(index);    
    return cn(
      'aspect-square flex items-center justify-center text-4xl md:text-6xl font-bold',
      'border-2 border-gray-300 bg-white hover:bg-gray-50 transition-colors',
      'cursor-pointer select-none',
      {
        'bg-green-100 border-green-400': isWinningCell,
        'bg-blue-100 border-blue-400': isHighlighted && !isWinningCell,
        'cursor-not-allowed opacity-50': disabled || value !== '' || isGameOver,
        'hover:bg-gray-50': !disabled && value === '' && !isGameOver,
        'text-blue-600': value === 'X',
        'text-red-600': value === 'O',
      }
    );
  };
  const handleCellClick = (index: number) => {
    if (disabled || board[index] !== '' || isGameOver) return;
    onCellClick(index);
  };
  return (
    <div className={cn('grid grid-cols-3 gap-2 w-full max-w-md mx-auto', className)}>
      {board.map((cell, index) => (
        <button
          key={index}
          className={getCellClassName(index, cell)}
          onClick={() => handleCellClick(index)}
          disabled={disabled || cell !== '' || isGameOver}
          aria-label={`Cell ${index + 1}${cell ? `, contains ${cell}` : ', empty'}`}
        >
          {cell}
        </button>
      ))}
    </div>
  );
}