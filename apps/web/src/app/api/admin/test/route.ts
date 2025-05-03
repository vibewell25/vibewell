import { NextRequest, NextResponse } from 'next/server';
import { adminRateLimiter } from '@/lib/rate-limiter';

// POST /api/admin/test
export async function POST(req: NextRequest) {
  try {
    // Perform rate limiting logic
    const result = await adminRateLimiter(req);
    if (result) {
      return result;
    }
    // Default response if no rate-limit action taken
    return NextResponse.json({ status: 'success', message: 'Admin API endpoint' });
  } catch (error) {
    console.error('Error in admin test route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
