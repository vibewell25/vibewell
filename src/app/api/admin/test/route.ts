import { NextRequest, NextResponse } from 'next/server';
import { adminRateLimiter } from '@/app/api/auth/rate-limit-middleware';

export async function POST(req: NextRequest) {
  const rateLimitResult = await adminRateLimiter(req);
  if (rateLimitResult) {
    return rateLimitResult;
  }
  
  return NextResponse.json({ status: 'success', message: 'Admin API endpoint' });
} 