import { NextResponse } from 'next/server';
import { checkHealth } from '@/lib/monitoring/index';

export async function GET() {
  try {
    const healthStatus = checkHealth();
    
    // Format the response according to the expected schema
    const response = {
      status: healthStatus.status,
      checks: healthStatus.checks,
      timestamp: new Date().toISOString(),
      version: process.env['NEXT_PUBLIC_APP_VERSION'] || '1.0.0'
    };

    // Log the response for debugging
    console.log('Health check response:', response);
    
    return NextResponse.json(response, {
      status: healthStatus.status === 'healthy' ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorResponse = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Service check failed',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
} 