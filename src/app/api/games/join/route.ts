import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const { roomCode } = await request.json();
    if (!roomCode) {
      return NextResponse.json(
        { error: 'Room code is required' },
        { status: 400 }
      );
    }
    const game = await prisma.game.findUnique({
      where: { roomCode },
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
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }
    if (game.status !== 'WAITING') {
      return NextResponse.json(
        { error: 'Game is not available to join' },
        { status: 400 }
      );
    }
    if (game.player1Id === user.id) {
      return NextResponse.json(
        { error: 'You cannot join your own game' },
        { status: 400 }
      );
    }
    if (game.player2Id) {
      return NextResponse.json(
        { error: 'Game is already full' },
        { status: 400 }
      );
    }
    const updatedGame = await prisma.game.update({
      where: { id: game.id },
      data: {
        player2Id: user.id,
        status: 'IN_PROGRESS',
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
    console.error('Join game error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}