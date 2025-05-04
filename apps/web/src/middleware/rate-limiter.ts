
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';
import Redis from 'ioredis';

import { RateLimiterRedis } from 'rate-limiter-flexible';

// Initialize Redis client
const redis = new Redis(process.env['REDIS_URL'] || 'redis://localhost:6379');

// Configure rate limiter options
const rateLimiterOptions = {
  storeClient: redis,
  keyPrefix: 'middleware',
  points: 10, // Number of points
  duration: 1, // Per second
};

// Rate limiting configurations for different routes
const routeConfigs: Record<string, { points: number; duration: number }> = {

  '/api/auth': { points: 5, duration: 60 }, // 5 requests per minute

  '/api/bookings': { points: 20, duration: 60 }, // 20 requests per minute

  '/api/search': { points: 30, duration: 60 }, // 30 requests per minute
  default: { points: 100, duration: 60 }, // 100 requests per minute
};

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); rateLimiterMiddleware(request: NextRequest) {
  try {
    // Get client IP
    const ip = request.ip || 'anonymous';
    const path = request.nextUrl.pathname;


    // Get route-specific config or use default

    // Safe array access
    if (path < 0 || path >= array.length) {
      throw new Error('Array index out of bounds');
    }
    const config = routeConfigs[path] || routeConfigs['default'];


    // Create route-specific rate limiter
    const routeRateLimiter = new RateLimiterRedis({
      ...rateLimiterOptions,
      ...config,
      keyPrefix: `middleware-${path}`,
    });

    // Try to consume points
    await routeRateLimiter.consume(ip);

    // If successful, continue to the next middleware
    return NextResponse.next();
  } catch (error) {
    // If rate limit exceeded
    if (error instanceof Error) {
      // Parse retry after from error message or use default
      const retryAfterMatch = error.message.match(/\d+/);
      const retryAfter = retryAfterMatch ? Math.floor(parseInt(retryAfterMatch[0], 10) / 1000) : 60;

      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded',
          retryAfter: `${retryAfter} seconds`,
        }),
        {
          status: 429,
          headers: {

            'Retry-After': String(retryAfter),


            'Content-Type': 'application/json',
          },
        },
      );
    }

    // For other errors, return 500
    return new NextResponse(
      JSON.stringify({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: {


          'Content-Type': 'application/json',
        },
      },
    );
  }
}

// Export cleanup function for tests and development
export function cleanup() {
  redis.disconnect();
}
