/**
 * Redis-backed rate limiter for production environments
 * 
 * This module provides rate limiting for Next.js App Router using Redis as a backing store
 * for distributed rate limiting across multiple application instances.
 */

import { NextRequest, NextResponse } from 'next/server';
import redisClient from './redis-client';

interface RedisRateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string | object;
  keyPrefix?: string;
  identifierGenerator?: (req: NextRequest) => string;
}

/**
 * Create a Redis-backed rate limiter for App Router API routes
 */
export function createRedisRateLimiter(options: RedisRateLimitOptions = {}) {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute
  const max = options.max || 60; // 60 requests per minute
  const message = options.message || { error: 'Too many requests, please try again later.' };
  const keyPrefix = options.keyPrefix || 'ratelimit:';
  
  // Default identifier generator uses IP
  const identifierGenerator = options.identifierGenerator || ((req: NextRequest) => {
    return req.headers.get('x-forwarded-for') || 
           req.headers.get('x-real-ip') || 
           'unknown';
  });

  return async function rateLimit(req: NextRequest): Promise<NextResponse | null> {
    try {
      const identifier = identifierGenerator(req);
      const key = `${keyPrefix}${identifier}`;
      const windowKey = `${key}:window`;
      
      // Get the current count and window expiration
      const [currentCount, windowExpires] = await Promise.all([
        redisClient.get(key),
        redisClient.get(windowKey),
      ]);
      
      const now = Date.now();
      let resetTime: number;
      
      // If window doesn't exist or has expired, create a new one
      if (!windowExpires || parseInt(windowExpires, 10) < now) {
        resetTime = now + windowMs;
        await Promise.all([
          redisClient.set(key, '1'),
          redisClient.set(windowKey, resetTime.toString(), { ex: Math.ceil(windowMs / 1000) }),
        ]);
        
        return null; // Allow the request
      }
      
      resetTime = parseInt(windowExpires, 10);
      
      // Check if over limit
      const count = currentCount ? parseInt(currentCount, 10) : 0;
      if (count >= max) {
        const retryAfter = Math.ceil((resetTime - now) / 1000);
        
        return NextResponse.json(message, {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(max),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
          },
        });
      }
      
      // Increment the counter
      await redisClient.incr(key);
      
      // Set remaining headers for successful response
      const remaining = max - (count + 1);
      
      // Add rate limit headers to the original response
      const headers = {
        'X-RateLimit-Limit': String(max),
        'X-RateLimit-Remaining': String(Math.max(0, remaining)),
        'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
      };
      
      // Return null to indicate the request should proceed
      // The headers will be applied in the calling code
      return null;
    } catch (error) {
      console.error('Redis rate limiter error:', error);
      
      // Fail open - allow the request if there's an error with Redis
      return null;
    }
  };
}

// Create specialized rate limiters for different types of endpoints
export const redisApiRateLimiter = createRedisRateLimiter({
  keyPrefix: 'ratelimit:api:',
});

export const redisAuthRateLimiter = createRedisRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per 15 minutes
  message: { error: 'Too many login attempts, please try again later.' },
  keyPrefix: 'ratelimit:auth:',
});

export const redisSensitiveApiRateLimiter = createRedisRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 requests per hour
  message: { error: 'Too many sensitive operations, please try again later.' },
  keyPrefix: 'ratelimit:sensitive:',
});

// Additional specialized rate limiters for specific endpoints

// For password reset/recovery (stricter than regular auth)
export const redisPasswordResetRateLimiter = createRedisRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: { error: 'Too many password reset attempts, please try again later.' },
  keyPrefix: 'ratelimit:password:',
});

// For user creation/registration
export const redisSignupRateLimiter = createRedisRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 account creations per 24 hours
  message: { error: 'Account creation rate limit exceeded.' },
  keyPrefix: 'ratelimit:signup:',
});

// For API token endpoints
export const redisTokenRateLimiter = createRedisRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 token requests per minute
  message: { error: 'Too many token requests, please try again later.' },
  keyPrefix: 'ratelimit:token:',
});

// For financial operations
export const redisFinancialRateLimiter = createRedisRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 financial operations per hour
  message: { error: 'Financial operation rate limit exceeded.' },
  keyPrefix: 'ratelimit:financial:',
});

// For admin operations
export const redisAdminRateLimiter = createRedisRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 admin operations per 5 minutes
  message: { error: 'Admin operation rate limit exceeded.' },
  keyPrefix: 'ratelimit:admin:',
}); 