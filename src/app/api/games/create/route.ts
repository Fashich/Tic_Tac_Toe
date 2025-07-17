import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { generateRoomCode } from '@/lib/game';
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const { type, aiDifficulty } = await request.json();
    if (!type || !['LOCAL', 'AI', 'ONLINE', 'PUBLIC'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid game type' },
        { status: 400 }
      );
    }
    if (type === 'AI' && (!aiDifficulty || !['EASY', 'MEDIUM', 'HARD', 'EXPERT'].includes(aiDifficulty))) {
      return NextResponse.json(
        { error: 'AI difficulty is required for AI games' },
        { status: 400 }
      );
    }
    const roomCode = (type === 'ONLINE' || type === 'PUBLIC') ? generateRoomCode() : undefined;
    const game = await prisma.game.create({
      data: {
        gameType: type,
        status: type === 'LOCAL' || type === 'AI' ? 'IN_PROGRESS' : 'WAITING',
        player1Id: user.id,
        roomCode,
        aiDifficulty: type === 'AI' ? aiDifficulty : undefined,
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
    return NextResponse.json({ game });
  } catch (error) {
    console.error('Create game error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}