import { NextResponse } from 'next/server'
import { createTablesManually, testConnection } from '@/lib/db'
export async function GET() {
  try {
    const connectionTest = await testConnection()
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionTest.error
      }, { status: 500 })
    }
    const result = await createTablesManually()    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Database tables created successfully!',
        details: 'All tables (users, games, moves) have been created with proper constraints.'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to create tables',
        details: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Force create tables error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
export async function POST() {
  return GET()
}