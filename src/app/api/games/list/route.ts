import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'my' | 'public' | 'waiting'
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    let whereClause: any = {};
    switch (type) {
      case 'my':
        whereClause = {
          OR: [
            { player1Id: user.id },
            { player2Id: user.id },
          ],
        };
        break;
      case 'public':
        whereClause = {
          gameType: 'PUBLIC',
          status: 'WAITING',
        };
        break;
      case 'waiting':
        whereClause = {
          status: 'WAITING',
          OR: [
            { gameType: 'PUBLIC' },
            { player1Id: user.id },
          ],
        };
        break;
      default:
        whereClause = {
          OR: [
            { player1Id: user.id },
            { player2Id: user.id },
            { gameType: 'PUBLIC' },
          ],
        };
    }
    const games = await prisma.game.findMany({
      where: whereClause,
      include: {
        player1: true,
        player2: true,
        _count: {
          select: {
            moves: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
    const total = await prisma.game.count({
      where: whereClause,
    });
    return NextResponse.json({
      games,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('List games error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}