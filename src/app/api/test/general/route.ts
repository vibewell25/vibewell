
import { NextRequest, NextResponse } from 'next/server';

import { applyRateLimit, apiRateLimiter } from '@/lib/rate-limiter';

export async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); POST(req: NextRequest) {
  const rateLimitResult = await applyRateLimit(req, apiRateLimiter);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  return NextResponse?.json({ status: 'success', message: 'General API endpoint' });
}
