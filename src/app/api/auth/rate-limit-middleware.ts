/**
 * Rate limiting middleware for App Router API routes
 * 
 * This module provides middleware functions to apply rate limiting to App Router API routes.
 * It uses our custom rate limiter and adapts it for Next.js App Router API handlers.
 */
import { NextRequest, NextResponse } from 'next/server';
import { 
  redisApiRateLimiter, 
  redisAuthRateLimiter, 
  redisSensitiveApiRateLimiter,
  redisPasswordResetRateLimiter,
  redisSignupRateLimiter,
  redisTokenRateLimiter,
  redisFinancialRateLimiter,
  redisAdminRateLimiter
} from '@/lib/redis-rate-limiter';
import { logger } from '@/lib/logger';
import redisClient from '@/lib/redis-client';

// Define RateLimiter interface
interface RateLimiter {
  name: string;
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  retryAfter?: number;
}

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string | object;
}

// In-memory store for rate limiting
// In production, use Redis or another distributed store for better scalability
type RateLimitStore = Map<string, { count: number; resetTime: number }>;
const memoryStore: RateLimitStore = new Map();

// Apply rate limiting to an App Router API route handler
export function withAppRouteRateLimit(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute
  const max = options.max || 60; // 60 requests per minute
  const message = options.message || { error: 'Too many requests, please try again later.' };
  
  return async function rateLimit(req: NextRequest): Promise<NextResponse | null> {
    // In production, skip in-memory rate limiting to use Redis instead
    if (process.env.NODE_ENV === 'production') {
      return null;
    }
    
    const ip = req.headers.get('x-forwarded-for') || 
              req.headers.get('x-real-ip') || 
              'unknown';
    
    const now = Date.now();
    const resetTime = now + windowMs;
    
    // Get or create entry for this IP
    if (!memoryStore.has(ip)) {
      memoryStore.set(ip, { count: 1, resetTime });
      
      // Log rate limiting event
      logger.rateLimit({
        ip,
        path: req.nextUrl.pathname,
        rateLimiter: 'memory',
        exceeded: false,
        remaining: max - 1,
        resetTime,
      });
      
      return null; // Allow the request
    }
    
    const record = memoryStore.get(ip)!;
    
    // Reset counter if window has passed
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = resetTime;
      
      // Log rate limiting event
      logger.rateLimit({
        ip,
        path: req.nextUrl.pathname,
        rateLimiter: 'memory',
        exceeded: false,
        remaining: max - 1,
        resetTime,
      });
      
      return null; // Allow the request
    }
    
    // Increment counter
    record.count++;
    
    // Check if over limit
    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      
      // Log rate limiting event
      logger.rateLimit({
        ip,
        path: req.nextUrl.pathname,
        rateLimiter: 'memory',
        exceeded: true,
        remaining: -1, // Exceeded by 1
        resetTime: record.resetTime,
      });
      
      return NextResponse.json(message, {
        status: 429,
        headers: {
          // Rate limiting headers
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(max),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(record.resetTime / 1000)),
          
          // Security headers
          'Content-Security-Policy': "default-src 'self'",
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Cache-Control': 'no-store, max-age=0',
          'Pragma': 'no-cache',
        },
      });
    }
    
    // Log rate limiting event
    logger.rateLimit({
      ip,
      path: req.nextUrl.pathname,
      rateLimiter: 'memory',
      exceeded: false,
      remaining: max - record.count,
      resetTime: record.resetTime,
    });
    
    // Under limit, allow the request
    return null;
  };
}

// Default rate limiters for different endpoint types
export const apiRateLimiter = withAppRouteRateLimit();

export const authRateLimiter = withAppRouteRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  message: { error: 'Too many login attempts, please try again later.' },
});

export const sensitiveApiRateLimiter = withAppRouteRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 requests per hour
  message: { error: 'Request limit exceeded for sensitive operations.' },
});

// New specialized rate limiters
export const passwordResetRateLimiter = withAppRouteRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: { error: 'Too many password reset attempts, please try again later.' },
});

export const signupRateLimiter = withAppRouteRateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 account creations per 24 hours
  message: { error: 'Account creation rate limit exceeded.' },
});

export const tokenRateLimiter = withAppRouteRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 token requests per minute
  message: { error: 'Too many token requests, please try again later.' },
});

export const financialRateLimiter = withAppRouteRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 financial operations per hour
  message: { error: 'Financial operation rate limit exceeded.' },
});

export const adminRateLimiter = withAppRouteRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 admin operations per 5 minutes
  message: { error: 'Admin operation rate limit exceeded.' },
});

// Helper function to apply rate limiting to an API route handler
export async function applyRateLimit(
  req: NextRequest,
  rateLimiter = apiRateLimiter
): Promise<NextResponse | null> {
  try {
    // Extract useful information from the request
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const path = req.nextUrl.pathname;
    const userId = req.headers.get('x-user-id') || undefined;
    
    // First try Redis rate limiting in production
    if (process.env.NODE_ENV === 'production') {
      // Map in-memory limiters to Redis limiters
      const redisLimiter = getRedisLimiterForEnvironment(rateLimiter);
      const response = await redisLimiter(req);
      
      // Log the rate limiting event (with Redis)
      if (response) {
        // Rate limit exceeded
        logger.rateLimit({
          ip,
          userId,
          path,
          rateLimiter: getLimiterName(rateLimiter),
          exceeded: true,
          resetTime: parseInt(response.headers.get('X-RateLimit-Reset') || '0', 10) * 1000,
        });
        
        // Add security headers to the response
        const enhancedResponse = NextResponse.json(
          response.json(),
          {
            status: response.status,
            headers: {
              ...Object.fromEntries(response.headers.entries()),
              'Content-Security-Policy': "default-src 'self'",
              'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
              'X-Content-Type-Options': 'nosniff',
              'X-Frame-Options': 'DENY',
              'X-XSS-Protection': '1; mode=block',
              'Cache-Control': 'no-store, max-age=0',
              'Pragma': 'no-cache',
            },
          }
        );
        
        return enhancedResponse;
      } else {
        // Request allowed
        logger.debug(`Rate limit check passed for ${path}`, 'rate-limiter', {
          ip,
          userId,
          path,
          rateLimiter: getLimiterName(rateLimiter),
        });
      }
      
      return response;
    }
    
    // Fallback to in-memory rate limiting in development
    const response = await rateLimiter(req);
    
    return response;
  } catch (error) {
    logger.error('Rate limiter error', 'rate-limiter', { error });
    
    // Generic error message that doesn't leak implementation details
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { 
        status: 503,
        headers: {
          'Retry-After': '60',
          'Content-Security-Policy': "default-src 'self'",
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Cache-Control': 'no-store, max-age=0',
          'Pragma': 'no-cache',
        }
      }
    );
  }
}

// Helper to get the appropriate Redis limiter based on the in-memory limiter
function getRedisLimiterForEnvironment(memoryLimiter: any) {
  if (memoryLimiter === authRateLimiter) {
    return redisAuthRateLimiter;
  } else if (memoryLimiter === sensitiveApiRateLimiter) {
    return redisSensitiveApiRateLimiter;
  } else if (memoryLimiter === passwordResetRateLimiter) {
    return redisPasswordResetRateLimiter;
  } else if (memoryLimiter === signupRateLimiter) {
    return redisSignupRateLimiter;
  } else if (memoryLimiter === tokenRateLimiter) {
    return redisTokenRateLimiter;
  } else if (memoryLimiter === financialRateLimiter) {
    return redisFinancialRateLimiter;
  } else if (memoryLimiter === adminRateLimiter) {
    return redisAdminRateLimiter;
  } else {
    return redisApiRateLimiter; // Default to API rate limiter
  }
}

// Helper function to get a client's IP address from a request
function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for') || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

// Check if the request IP is blocked
async function isIPBlocked(req: NextRequest): Promise<boolean> {
  const ip = getClientIP(req);
  return await redisClient.isIPBlocked(ip);
}

// Enhanced helper to get limiter name for logging with more descriptive names
function getLimiterName(limiter: any): string {
  if (limiter === authRateLimiter) return 'Authentication';
  if (limiter === sensitiveApiRateLimiter) return 'Sensitive API';
  if (limiter === passwordResetRateLimiter) return 'Password Reset';
  if (limiter === signupRateLimiter) return 'User Signup';
  if (limiter === tokenRateLimiter) return 'Token Request';
  if (limiter === financialRateLimiter) return 'Financial Operations';
  if (limiter === adminRateLimiter) return 'Admin Operations';
  return 'Global API';
}

// In-memory store for detailed rate limiting in development
const rateStore: Record<string, Record<string, { count: number, resetTime: number }>> = {};

// Enhanced rate limiting middleware with Redis logging
export async function enhancedRateLimit(
  req: NextRequest,
  limiter: RateLimiter,
  skipFn?: (req: NextRequest) => boolean
): Promise<RateLimitResult> {
  // Check if IP is blocked first
  const ip = getClientIP(req);
  const isBlocked = await redisClient.isIPBlocked(ip);
  
  if (isBlocked) {
    logger.warn(`Blocked IP ${ip} attempted to access ${req.nextUrl.pathname}`);
    
    // Log the blocked attempt
    await redisClient.logRateLimitEvent({
      ip,
      path: req.nextUrl.pathname,
      method: req.method,
      limiterType: getLimiterName(limiter),
      exceeded: true,
      blocked: true, // Special flag for blocked IPs
      resetTime: Date.now() + 24 * 60 * 60 * 1000, // Just a placeholder
      suspicious: true
    });
    
    return {
      success: false,
      limit: 0,
      remaining: 0,
      retryAfter: 86400, // 24 hours
      blocked: true
    };
  }
  
  // Skip rate limiting if the skip function returns true
  if (skipFn && skipFn(req)) {
    return { success: true, limit: limiter.limit, remaining: limiter.limit };
  }

  const key = `${limiter.name}:${ip}`;
  const now = Date.now();
  let result: RateLimitResult;

  if (process.env.REDIS_ENABLED === 'true') {
    // Redis implementation for distributed rate limiting
    result = await redisRateLimit(key, limiter);
    
    // Log rate limit event to Redis for analysis
    const isExceeded = !result.success;
    await redisClient.logRateLimitEvent({
      ip,
      path: req.nextUrl.pathname,
      method: req.method,
      limiterType: getLimiterName(limiter),
      exceeded: isExceeded,
      remaining: result.remaining,
      resetTime: now + (result.retryAfter || 0) * 1000,
      suspicious: isExceeded && (result.retryAfter || 0) > 60, // Suspicious if retry is long
    });
    
  } else {
    // In-memory implementation for local development
    if (!rateStore[limiter.name]) {
      rateStore[limiter.name] = {};
      logger.debug(`Created new rate limit store for ${getLimiterName(limiter)}`);
    }

    if (!rateStore[limiter.name][ip]) {
      // New IP, initialize counter
      rateStore[limiter.name][ip] = {
        count: 1,
        resetTime: now + limiter.windowMs,
      };
      logger.debug(
        `Added new IP to rate limit store: ${ip}, limiter: ${getLimiterName(limiter)}, count: 1, reset: ${new Date(now + limiter.windowMs).toISOString()}`
      );
      
      // Log to Redis for analysis
      await redisClient.logRateLimitEvent({
        ip,
        path: req.nextUrl.pathname,
        method: req.method,
        limiterType: getLimiterName(limiter),
        exceeded: false,
        remaining: limiter.limit - 1,
        resetTime: now + limiter.windowMs,
        suspicious: false
      });
      
      result = {
        success: true,
        limit: limiter.limit,
        remaining: limiter.limit - 1,
      };
    } else {
      const record = rateStore[limiter.name][ip];
      
      // Check if the time window has passed and we should reset the counter
      if (now > record.resetTime) {
        // Reset counter for new time window
        record.count = 1;
        record.resetTime = now + limiter.windowMs;
        
        logger.debug(
          `Reset rate limit counter for IP: ${ip}, limiter: ${getLimiterName(limiter)}, count: 1, reset: ${new Date(record.resetTime).toISOString()}`
        );
        
        // Log to Redis for analysis
        await redisClient.logRateLimitEvent({
          ip,
          path: req.nextUrl.pathname,
          method: req.method,
          limiterType: getLimiterName(limiter),
          exceeded: false,
          remaining: limiter.limit - 1,
          resetTime: record.resetTime,
          suspicious: false
        });
        
        result = {
          success: true,
          limit: limiter.limit,
          remaining: limiter.limit - 1,
        };
      } else if (record.count >= limiter.limit) {
        // Rate limit exceeded
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        
        // Calculate how many times over the limit this request is
        const overLimitFactor = Math.floor(record.count / limiter.limit);
        const isSuspicious = overLimitFactor >= 2; // If more than 2x the limit, might be suspicious
        
        logger.warn(
          `Rate limit exceeded for IP: ${ip}, limiter: ${getLimiterName(limiter)}, count: ${record.count}, limit: ${limiter.limit}, retry: ${retryAfter}s, suspicious: ${isSuspicious}`
        );
        
        // Increment counter even when over limit to track abuse attempts
        record.count++;
        
        // Log to Redis for analysis
        await redisClient.logRateLimitEvent({
          ip,
          path: req.nextUrl.pathname,
          method: req.method,
          limiterType: getLimiterName(limiter),
          exceeded: true,
          count: record.count,
          limit: limiter.limit,
          retryAfter,
          resetTime: record.resetTime,
          suspicious: isSuspicious,
          overLimitFactor
        });
        
        result = {
          success: false,
          limit: limiter.limit,
          remaining: 0,
          retryAfter,
        };
      } else {
        // Increment counter
        record.count++;
        const remaining = limiter.limit - record.count;
        
        logger.debug(
          `Rate limited request processed: ${ip}, limiter: ${getLimiterName(limiter)}, count: ${record.count}, remaining: ${remaining}`
        );
        
        // Log to Redis for analysis if we're approaching the limit (80% or more used)
        if (remaining <= Math.ceil(limiter.limit * 0.2)) {
          await redisClient.logRateLimitEvent({
            ip,
            path: req.nextUrl.pathname,
            method: req.method,
            limiterType: getLimiterName(limiter),
            exceeded: false,
            count: record.count,
            remaining,
            resetTime: record.resetTime,
            approaching: true, // Approaching limit
            suspicious: false
          });
        }
        
        result = {
          success: true,
          limit: limiter.limit,
          remaining,
        };
      }
    }
  }

  return result;
}

// Redis rate limiting implementation
async function redisRateLimit(key: string, limiter: RateLimiter): Promise<RateLimitResult> {
  try {
    // Use Redis for production/distributed rate limiting
    const redisKey = `ratelimit:${key}`;
    
    // Get the current count
    let count = await redisClient.get(redisKey);
    const now = Date.now();
    
    if (!count) {
      // First request in the window
      await redisClient.set(redisKey, '1', { ex: Math.ceil(limiter.windowMs / 1000) });
      
      return {
        success: true,
        limit: limiter.limit,
        remaining: limiter.limit - 1,
      };
    }
    
    const currentCount = parseInt(count, 10);
    
    // Get TTL to determine reset time
    const ttl = await redisClient.ttl(redisKey);
    const resetTime = now + (ttl * 1000);
    
    if (currentCount >= limiter.limit) {
      // Rate limit exceeded
      const retryAfter = Math.ceil(ttl);
      
      // Increment anyway to track potential abuse
      await redisClient.incr(redisKey);
      
      return {
        success: false,
        limit: limiter.limit,
        remaining: 0,
        retryAfter,
      };
    }
    
    // Increment the counter
    await redisClient.incr(redisKey);
    
    return {
      success: true,
      limit: limiter.limit,
      remaining: limiter.limit - (currentCount + 1),
    };
  } catch (error) {
    // Log the error but allow the request through
    logger.error(
      `Redis rate limiting error, allowing request: ${error instanceof Error ? error.message : String(error)}`
    );
    
    // Fallback to allowing the request if Redis fails
    return {
      success: true,
      limit: limiter.limit,
      remaining: 1,
    };
  }
}

// Apply middleware to an API route
export async function applyRateLimitMiddleware(
  req: NextRequest,
  limiter: RateLimiter = defaultRateLimiter
): Promise<NextResponse | null> {
  try {
    // Check if the IP is blocked first
    const ip = getClientIP(req);
    const isBlocked = await redisClient.isIPBlocked(ip);
    
    if (isBlocked) {
      logger.warn(`Blocked IP ${ip} attempted to access ${req.nextUrl.pathname}`);
      
      // Return a 403 Forbidden response
      return NextResponse.json(
        { error: 'Access denied' },
        {
          status: 403,
          headers: {
            'Content-Security-Policy': "default-src 'self'",
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Cache-Control': 'no-store, max-age=0',
            'Pragma': 'no-cache',
          }
        }
      );
    }
    
    // Apply rate limiting
    const result = await enhancedRateLimit(req, limiter);
    
    if (!result.success) {
      // Rate limit exceeded
      const headers: Record<string, string> = {
        'Retry-After': String(result.retryAfter || 60),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil((Date.now() + (result.retryAfter || 60) * 1000) / 1000)),
        'Content-Security-Policy': "default-src 'self'",
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Cache-Control': 'no-store, max-age=0',
        'Pragma': 'no-cache',
      };
      
      return NextResponse.json(
        { error: 'Too many requests, please try again later' },
        {
          status: 429,
          headers
        }
      );
    }
    
    // Request allowed
    return null;
  } catch (error) {
    logger.error(`Rate limit middleware error: ${error instanceof Error ? error.message : String(error)}`);
    
    // Allow the request through on error
    return null;
  }
}

// Default rate limiter configuration
const defaultRateLimiter: RateLimiter = {
  name: 'global',
  limit: 60,
  windowMs: 60 * 1000 // 1 minute
};

// Specialized rate limiters
export const authRateLimiter: RateLimiter = {
  name: 'auth',
  limit: 10,
  windowMs: 15 * 60 * 1000 // 15 minutes
};

export const signupRateLimiter: RateLimiter = {
  name: 'signup',
  limit: 5,
  windowMs: 60 * 60 * 1000 // 1 hour
};

// ... other rate limiters ...

// Export default limiter
export default defaultRateLimiter; 