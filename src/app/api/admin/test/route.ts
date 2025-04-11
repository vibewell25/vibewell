import { NextRequest, NextResponse } from 'next/server';
import { adminRateLimiter } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  const rateLimitResult = await adminRateLimiter(req);
  if (rateLimitResult) {
    return rateLimitResult;
  }
  
  return NextResponse.json({ status: 'success', message: 'Admin API endpoint' });
} 