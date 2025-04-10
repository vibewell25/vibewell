import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, sensitiveApiRateLimiter } from '@/app/api/auth/rate-limit-middleware';

export async function POST(req: NextRequest) {
  // Apply sensitive operations rate limiting
  const rateLimitResult = await applyRateLimit(req, sensitiveApiRateLimiter);
  if (rateLimitResult) {
    return rateLimitResult;
  }
  
  // Simulate sensitive operation
  return NextResponse.json({ 
    status: 'success', 
    message: 'Sensitive operations endpoint',
    timestamp: new Date().toISOString()
  });
} 