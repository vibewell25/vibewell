import { Redis } from 'ioredis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const redis = new Redis(process.env['REDIS_URL'] || 'redis://localhost:6379');

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  max: number;       // Max number of requests in the window
  keyPrefix?: string; // Prefix for Redis keys
}

export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    keyPrefix: 'rl_webauthn'
  }
) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const key = `${config.keyPrefix}:${ip}`;

  const multi = redis.multi();
  multi.incr(key);
  multi.pttl(key);

  const results = await multi.exec();
  if (!results) {
    // If Redis command failed, fail open
    return null;
  }

  // Ensure results[0] and results[1] exist and have valid values
  if (!Array.isArray(results[0]) || !Array.isArray(results[1])) {
    return null;
  }

  const count = typeof results[0][1] === 'number' ? results[0][1] : 0;
  const ttl = typeof results[1][1] === 'number' ? results[1][1] : 0;

  // If this is the first request, set the expiry
  if (count === 1) {
    await redis.pexpire(key, config.windowMs);
  }

  // Check if the request exceeds the rate limit
  if (count > config.max) {
    const retryAfter = Math.ceil(ttl / 1000);
    const resetTime = Date.now() + ttl;

    return NextResponse.json(
      {
        error: 'Too many requests',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(config.max),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(resetTime),
        },
      }
    );
  }

  // Return null to allow the request to proceed
  return null;
}
