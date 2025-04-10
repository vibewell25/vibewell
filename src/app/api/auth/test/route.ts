import { NextRequest, NextResponse } from 'next/server';
import { authRateLimiter } from '@/app/api/auth/rate-limit-middleware';

export async function POST(req: NextRequest) {
  const rateLimitResult = await authRateLimiter(req);
  if (rateLimitResult) {
    return rateLimitResult;
  }
  
  return NextResponse.json({ status: 'success', message: 'Auth API endpoint' });
} 