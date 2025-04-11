import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, sensitiveApiRateLimiter } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  // Apply sensitive operations rate limiting
  const rateLimitResult = await applyRateLimit(req, sensitiveApiRateLimiter);
  if (rateLimitResult) {
    return rateLimitResult;
  }
  
  // Simulate sensitive operation
  return NextResponse.json({ 
    status: 'success', 
    message: 'Sensitive operations API endpoint',
    timestamp: new Date().toISOString()
  });
} 