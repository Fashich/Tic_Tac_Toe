import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { stringToBoard, makeMove, checkWinner, boardToString, getOpponent } from '@/lib/game';
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const { gameId, position, isAI = false } = await request.json();
    if (!gameId || position === undefined) {
      return NextResponse.json(
        { error: 'Game ID and position are required' },
        { status: 400 }
      );
    }
    if (position < 0 || position > 8) {
      return NextResponse.json(
        { error: 'Invalid position' },
        { status: 400 }
      );
    }
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        player1: true,
        player2: true,
        moves: {
          orderBy: {
            moveNumber: 'asc',
          },
        },
      },
    });
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }
    if (game.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Game is not in progress' },
        { status: 400 }
      );
    }
    if (game.winner || game.isDraw) {
      return NextResponse.json(
        { error: 'Game is already finished' },
        { status: 400 }
      );
    }
    if (!isAI) {
      const isPlayer1 = game.player1Id === user.id;
      const isPlayer2 = game.player2Id === user.id;      
      if (!isPlayer1 && !isPlayer2) {
        return NextResponse.json(
          { error: 'You are not a player in this game' },
          { status: 403 }
        );
      }
      const expectedSymbol = isPlayer1 ? 'X' : 'O';
      if (game.currentTurn !== expectedSymbol) {
        return NextResponse.json(
          { error: 'Not your turn' },
          { status: 400 }
        );
      }
    }
    const board = stringToBoard(game.board);
    if (board[position] !== '') {
      return NextResponse.json(
        { error: 'Position already occupied' },
        { status: 400 }
      );
    }
    const newBoard = makeMove(board, position, game.currentTurn as 'X' | 'O');
    const result = checkWinner(newBoard);
    const nextTurn = getOpponent(game.currentTurn as 'X' | 'O');
    await prisma.move.create({
      data: {
        gameId: game.id,
        userId: isAI ? null : user.id,
        position,
        symbol: game.currentTurn,
        moveNumber: game.moves.length + 1,
      },
    });
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        board: boardToString(newBoard),
        currentTurn: result.winner ? game.currentTurn : nextTurn,
        winner: result.winner === 'draw' ? null : result.winner,
        isDraw: result.winner === 'draw',
        status: result.winner ? 'COMPLETED' : 'IN_PROGRESS',
      },
      include: {
        player1: true,
        player2: true,
        moves: {
          include: {
            user: true,
          },
          orderBy: {
            moveNumber: 'asc',
          },
        },
      },
    });
    return NextResponse.json({ game: updatedGame });
  } catch (error) {
    console.error('Make move error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}