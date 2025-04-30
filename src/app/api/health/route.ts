import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Add any critical service checks here
    // For example, database connection check
    
    return NextResponse.json(
      { status: 'healthy', timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { status: 'unhealthy', error: 'Service check failed' },
      { status: 503 }
    );
  }
}
