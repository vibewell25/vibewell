import { NextRequest, NextResponse } from 'next/server';

import { authRateLimiter } from '@/lib/rate-limiter';

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); POST(req: NextRequest) {
  const rateLimitResult = await authRateLimiter(req);
  if (rateLimitResult) {
    return rateLimitResult;
return NextResponse.json({ status: 'success', message: 'Auth API endpoint' });
