'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, X, Lightbulb } from 'lucide-react';
import { GameBoard } from './GameBoard';
import { createEmptyBoard, makeMove, getAIMove, createGameState, TUTORIAL_STEPS } from '@/lib/game';
import type { CellValue, Player, GameState, TutorialStep } from '@/lib/types';
interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [board, setBoard] = useState<CellValue[]>(createEmptyBoard());
  const [gameState, setGameState] = useState<GameState>(createGameState(createEmptyBoard(), 'X'));
  const [waitingForAI, setWaitingForAI] = useState(false);
  const step = TUTORIAL_STEPS[currentStep];
  useEffect(() => {
    if (isOpen) {
      resetTutorial();
    }
  }, [isOpen]);
  const resetTutorial = () => {
    setCurrentStep(0);
    const emptyBoard = createEmptyBoard();
    setBoard(emptyBoard);
    setGameState(createGameState(emptyBoard, 'X'));
    setWaitingForAI(false);
  };
  const handleCellClick = (position: number) => {
    if (waitingForAI || gameState.isGameOver) return;    
    const currentStepData = TUTORIAL_STEPS[currentStep];
    if (currentStepData.position !== undefined && position !== currentStepData.position) {
      return;
    }
    if (board[position] !== '') return;
    const newBoard = makeMove(board, position, 'X');
    setBoard(newBoard);    
    const newGameState = createGameState(newBoard, 'O');
    setGameState(newGameState);
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 500);
    }
    if (!newGameState.isGameOver) {
      setWaitingForAI(true);
      setTimeout(() => {
        makeAIMove(newBoard);
      }, 1000);
    }
  };
  const makeAIMove = (currentBoard: CellValue[]) => {
    const aiPosition = getAIMove(currentBoard, 'EASY');
    if (aiPosition !== -1) {
      const newBoard = makeMove(currentBoard, aiPosition, 'O');
      setBoard(newBoard);
      setGameState(createGameState(newBoard, 'X'));
    }
    setWaitingForAI(false);
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 500);
    }
  };
  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  const getHighlightCells = () => {
    if (step.highlight) {
      return step.highlight;
    }
    return [];
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <DialogTitle>Tutorial</DialogTitle>
            </div>
            <Badge variant="outline">
              Step {currentStep + 1} of {TUTORIAL_STEPS.length}
            </Badge>
          </div>
          <DialogDescription>
            Learn how to play Tic-Tac-Toe with this interactive tutorial
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{step.title}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
          </Card>
          {}
          <div className="flex justify-center">
            <GameBoard
              gameState={gameState}
              onCellClick={handleCellClick}
              disabled={waitingForAI || (step.action === 'wait')}
              highlightCells={getHighlightCells()}
              className="max-w-xs"
            />
          </div>
          {}
          <div className="text-center">
            {waitingForAI && (
              <p className="text-blue-600 font-medium">AI is thinking...</p>
            )}
            {gameState.isGameOver && (
              <div className="space-y-2">
                {gameState.winner === 'draw' ? (
                  <p className="text-yellow-600 font-medium">{"It's a draw!"}</p>
                ) : (
                  <p className={`font-medium ${
                    gameState.winner === 'X' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {gameState.winner === 'X' ? 'You won!' : 'AI won!'}
                  </p>
                )}
              </div>
            )}
            {!gameState.isGameOver && !waitingForAI && step.action === 'click' && (
              <p className="text-gray-600">
                {gameState.currentPlayer === 'X' ? "Your turn (X)" : "AI's turn (O)"}
              </p>
            )}
          </div>
          {}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={resetTutorial}
                size="sm"
              >
                Reset
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                size="sm"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Close
              </Button>
            </div>
            {currentStep < TUTORIAL_STEPS.length - 1 ? (
              <Button
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={onClose}
                className="flex items-center gap-2"
              >
                Finish
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}