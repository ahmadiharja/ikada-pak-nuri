import { NextResponse } from 'next/server';
import { testConnection, db } from '@/lib/db';

export async function GET() {
  try {
    // Test connection using Vercel Postgres
    const result = await db`SELECT NOW() as current_time, version() as postgres_version`;
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        current_time: result[0].current_time,
        postgres_version: result[0].postgres_version,
        connection_info: 'Connected to Neon PostgreSQL'
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}