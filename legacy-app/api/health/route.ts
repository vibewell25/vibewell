import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks: [
      {
        name: 'API',
        status: 'healthy',
        responseTime: Math.floor(Math.random() * 20 + 5),
      }
    ]
  });
} 