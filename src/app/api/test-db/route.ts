import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';export async function GET() {
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
        return NextResponse.json({ 
      success: true, 
      message: 'Database connected successfully',
      userCount 
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Database connection or table access failed'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}