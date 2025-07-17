import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const gameId = params.id;
    const game = await prisma.game.findUnique({
      where: { id: gameId },
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
    const hasAccess = 
      game.player1Id === user.id ||
      game.player2Id === user.id ||
      game.gameType === 'PUBLIC';
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    return NextResponse.json({ game });
  } catch (error) {
    console.error('Get game error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const gameId = params.id;
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }
    if (game.player1Id !== user.id) {
      return NextResponse.json(
        { error: 'Only the game creator can delete the game' },
        { status: 403 }
      );
    }
    await prisma.game.delete({
      where: { id: gameId },
    });
    return NextResponse.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Delete game error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}