/**
 * Rate limiter implementation
 */
import { NextRequest, NextResponse } from 'next/server';

// Rate limiter configuration
export interface RateLimiterConfig {
  limit: number;
  windowMs: number;
  keyGenerator?: (req: NextRequest) => string;
  message?: string;
  statusCode?: number;
}

// In-memory store for rate limiting
const inMemoryStore: Record<string, { count: number; resetTime: number }> = {};

// Default key generator function
const defaultKeyGenerator = (req: NextRequest): string => {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  return `${ip}:${req.method}:${req.url}`;
};

// Default rate limiter options
const defaultRateLimiterConfig: RateLimiterConfig = {
  limit: 100,
  windowMs: 60 * 1000, // 1 minute
  keyGenerator: defaultKeyGenerator,
  message: 'Too many requests, please try again later.',
  statusCode: 429
};

// Predefined rate limiters
export const apiRateLimiter: RateLimiterConfig = {
  ...defaultRateLimiterConfig,
  limit: 100,
  windowMs: 60 * 1000 // 1 minute
};

export const authRateLimiter: RateLimiterConfig = {
  ...defaultRateLimiterConfig,
  limit: 10,
  windowMs: 60 * 1000 // 1 minute
};

export const sensitiveApiRateLimiter: RateLimiterConfig = {
  ...defaultRateLimiterConfig,
  limit: 5,
  windowMs: 60 * 1000 // 1 minute
};

/**
 * Apply rate limiting to a request
 */
export async function applyRateLimit(
  req: NextRequest,
  options: RateLimiterConfig = defaultRateLimiterConfig
): Promise<NextResponse | null> {
  const mergedOptions = {
    ...defaultRateLimiterConfig,
    ...options
  };
  
  const { limit, windowMs, message, statusCode } = mergedOptions;
  // We know this is safe because defaultRateLimiterConfig always has keyGenerator
  const keyGenerator = mergedOptions.keyGenerator || defaultKeyGenerator;

  // Generate a unique key for this request
  const key = keyGenerator(req);
  const now = Date.now();

  // Try to use Redis if available
  try {
    // For testing, we'll just use the in-memory store
    if (!inMemoryStore[key]) {
      inMemoryStore[key] = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    // Reset count if the window has expired
    if (now > inMemoryStore[key].resetTime) {
      inMemoryStore[key] = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    // Increment the count
    inMemoryStore[key].count++;

    // Check if the request exceeds the limit
    if (inMemoryStore[key].count > limit) {
      // Return a rate limit response
      return new NextResponse(message, {
        status: statusCode,
        headers: {
          'Content-Type': 'text/plain',
          'Retry-After': String(Math.ceil(windowMs / 1000))
        }
      });
    }

    // Request is within rate limit
    return null;
  } catch (error) {
    console.error('Rate limiter error:', error);
    
    // Fall back to in-memory rate limiting
    if (!inMemoryStore[key]) {
      inMemoryStore[key] = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    // Reset count if the window has expired
    if (now > inMemoryStore[key].resetTime) {
      inMemoryStore[key] = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    // Increment the count
    inMemoryStore[key].count++;

    // Check if the request exceeds the limit
    if (inMemoryStore[key].count > limit) {
      // Return a rate limit response
      return new NextResponse(message, {
        status: statusCode,
        headers: {
          'Content-Type': 'text/plain',
          'Retry-After': String(Math.ceil(windowMs / 1000))
        }
      });
    }

    // Request is within rate limit
    return null;
  }
} 