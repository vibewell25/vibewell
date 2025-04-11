import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, adminRateLimiter } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  // Use regular API rate limiter but with admin-specific logic
  const rateLimitResult = await applyRateLimit(req, adminRateLimiter);
  if (rateLimitResult) {
    return rateLimitResult;
  }
  
  // Simulate admin-only operation
  return NextResponse.json({ 
    status: 'success', 
    message: 'Admin operations API endpoint',
    timestamp: new Date().toISOString()
  });
} 