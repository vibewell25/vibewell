import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, authRateLimiter } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  const rateLimitResult = await applyRateLimit(req, authRateLimiter);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  return NextResponse.json({ status: 'success', message: 'Authentication API endpoint' });
}
