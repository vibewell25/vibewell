import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client if credentials are provided
// Otherwise, use in-memory store for development
let redis: Redis | null = null;

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// In-memory store as fallback (not suitable for production with multiple instances)
const inMemoryStore: Record<string, { count: number; resetTime: number }> = {};

// Create rate limiters for different auth actions
export const loginRateLimiter = {
  // 10 requests per minute for login attempts
  limit: 10,
  window: 60, // 1 minute in seconds
  keyPrefix: 'ratelimit_login',
};

export const signupRateLimiter = {
  // 5 requests per 5 minutes for signup attempts
  limit: 5,
  window: 300, // 5 minutes in seconds
  keyPrefix: 'ratelimit_signup',
};

export const passwordResetRateLimiter = {
  // 3 requests per 5 minutes for password reset attempts
  limit: 3,
  window: 300, // 5 minutes in seconds
  keyPrefix: 'ratelimit_pwreset',
};

export const mfaRateLimiter = {
  // 5 requests per minute for MFA verification attempts
  limit: 5,
  window: 60, // 1 minute in seconds
  keyPrefix: 'ratelimit_mfa',
};

export const apiRateLimiter = {
  // 50 requests per minute for general API endpoints
  limit: 50,
  window: 60, // 1 minute in seconds
  keyPrefix: 'ratelimit_api',
};

/**
 * Apply rate limiting to a request
 * 
 * @param req - The Next.js request object
 * @param config - Rate limiting configuration
 * @returns NextResponse with 429 Too Many Requests status if rate limit is exceeded, null otherwise
 */
export async function applyRateLimit(
  req: NextRequest,
  config: { limit: number; window: number; keyPrefix: string }
): Promise<NextResponse | null> {
  const ip = req.ip || 'anonymous';
  const userId = req.headers.get('x-user-id') || '';
  
  // Generate a unique key based on IP (and user ID if available)
  // This prevents users from bypassing limits by switching accounts
  const key = `${config.keyPrefix}_${ip}${userId ? `_${userId}` : ''}`;
  
  // Use Upstash Redis rate limiter if available
  if (redis) {
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.limit, `${config.window}s`),
      analytics: true, // Enable analytics to track usage
      prefix: config.keyPrefix,
    });

    const { success, limit, reset, remaining } = await ratelimit.limit(key);

    if (!success) {
      console.log(`Rate limit exceeded: ${key}`);
      
      // Return error response with retry-after header
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
          },
        }
      );
    }
    
    // Add rate limit headers to track usage
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', limit.toString());
    headers.set('X-RateLimit-Remaining', remaining.toString());
    headers.set('X-RateLimit-Reset', reset.toString());
    
    // No need to return a response here, the request can continue
    return null;
  } else {
    // Fallback to in-memory rate limiting for development
    const now = Date.now();
    
    // Initialize rate limit entry if it doesn't exist
    if (!inMemoryStore[key]) {
      inMemoryStore[key] = {
        count: 0,
        resetTime: now + config.window * 1000,
      };
    }
    
    // Reset count if window has passed
    if (now > inMemoryStore[key].resetTime) {
      inMemoryStore[key] = {
        count: 0,
        resetTime: now + config.window * 1000,
      };
    }
    
    // Increment count
    inMemoryStore[key].count++;
    
    // Check if limit exceeded
    if (inMemoryStore[key].count > config.limit) {
      console.log(`Rate limit exceeded: ${key}`);
      
      // Calculate retry-after in seconds
      const retryAfter = Math.ceil((inMemoryStore[key].resetTime - now) / 1000);
      
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
          },
        }
      );
    }
    
    // No need to return a response here, the request can continue
    return null;
  }
}

/**
 * Apply rate limiting middleware based on different scenarios
 */
export const rateLimitMiddleware = {
  login: async (req: NextRequest) => applyRateLimit(req, loginRateLimiter),
  signup: async (req: NextRequest) => applyRateLimit(req, signupRateLimiter),
  passwordReset: async (req: NextRequest) => applyRateLimit(req, passwordResetRateLimiter),
  mfa: async (req: NextRequest) => applyRateLimit(req, mfaRateLimiter),
  api: async (req: NextRequest) => applyRateLimit(req, apiRateLimiter),
}; 