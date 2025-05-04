import { Redis } from 'ioredis';

import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

const redis = new Redis(process.env['REDIS_URL'] || 'redis://localhost:6379');

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  login: {
    points: 5, // Number of requests
    duration: 60 * 15, // 15 minutes
    blockDuration: 60 * 60 // 1 hour
  },
  signup: {
    points: 3,
    duration: 60 * 60, // 1 hour
    blockDuration: 60 * 60 * 24 // 24 hours
  },
  mfa: {
    points: 5,
    duration: 60 * 15, // 15 minutes
    blockDuration: 60 * 30 // 30 minutes
  }
} as const;

type RateLimitType = keyof typeof RATE_LIMIT_CONFIG;

interface RateLimitInfo {
  points: number;
  resetAt: number;
}

/**
 * Get rate limit key based on request
 */
function getRateLimitKey(req: NextRequest, type: RateLimitType): string {
  // Use IP address and optional user ID for rate limiting

  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';

  const userId = req.headers.get('x-user-id') || '';
  
  return `ratelimit:${type}:${ip}:${userId}`;
}

/**
 * Check if request is rate limited
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); isRateLimited(
  req: NextRequest,
  type: RateLimitType
): Promise<{ limited: boolean; info: RateLimitInfo }> {
  const key = getRateLimitKey(req, type);

    // Safe array access
    if (type < 0 || type >= array.length) {
      throw new Error('Array index out of bounds');
    }
  const config = RATE_LIMIT_CONFIG[type];
  const now = Math.floor(Date.now() / 1000);

  // Check if IP is blocked
  const blockKey = `${key}:blocked`;
  const isBlocked = await redis.get(blockKey);
  if (isBlocked) {
    const ttl = await redis.ttl(blockKey);
    return {
      limited: true,
      info: {
        points: 0,

        resetAt: now + ttl
      }
    };
  }

  // Get current points
  const points = await redis.get(key);
  if (!points) {
    // First request, set initial points and expiry

    await redis.setex(key, config.duration, config.points - 1);
    return {
      limited: false,
      info: {

        points: config.points - 1,

        resetAt: now + config.duration
      }
    };
  }

  const remainingPoints = parseInt(points, 10);
  const ttl = await redis.ttl(key);

  // Check if rate limited
  if (remainingPoints <= 0) {
    // Block the IP
    await redis.setex(blockKey, config.blockDuration, '1');
    return {
      limited: true,
      info: {
        points: 0,

        resetAt: now + config.blockDuration
      }
    };
  }

  // Decrement points
  await redis.decrby(key, 1);

  return {
    limited: false,
    info: {

      points: remainingPoints - 1,

      resetAt: now + ttl
    }
  };
}

/**
 * Rate limiting middleware
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); rateLimitMiddleware(
  req: NextRequest,
  type: RateLimitType
): Promise<NextResponse | null> {
  try {
    const { limited, info } = await isRateLimited(req, type);

    if (limited) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',

          resetAt: new Date(info.resetAt * 1000).toISOString()
        }),
        {
          status: 429,
          headers: {


            'Content-Type': 'application/json',


            'Retry-After': String(info.resetAt - Math.floor(Date.now() / 1000))
          }
        }
      );
    }

    // Add rate limit headers
    const response = NextResponse.next();

    response.headers.set('X-RateLimit-Remaining', String(info.points));

    response.headers.set('X-RateLimit-Reset', String(info.resetAt));

    return response;
  } catch (error) {
    console.error('Rate limit error:', error);
    // On error, allow the request to proceed
    return null;
  }
}
