/**
 * Rate Limiter for API routes
 * 
 * This module provides a configurable rate limiter for Next.js API routes.
 * It uses express-rate-limit under the hood but adapts it for Next.js API handlers.
 * 
 * In a production environment, you should use a persistent store like Redis 
 * instead of the in-memory store to ensure rate limits are maintained across instances.
 */

import rateLimit from 'express-rate-limit';
import { NextApiRequest, NextApiResponse } from 'next';

// Define rate limiter options interface
interface RateLimiterOptions {
  windowMs?: number; // Time window in milliseconds
  max?: number; // Maximum number of requests in the time window
  message?: string | object; // Response message when rate limit is exceeded
  statusCode?: number; // Status code for rate limit exceeded response
  keyGenerator?: (req: NextApiRequest) => string; // Function to generate keys
  skip?: (req: NextApiRequest) => boolean; // Function to skip rate limiting
  headers?: boolean; // Whether to add rate limit headers
}

// Default rate limiter options
const defaultOptions: RateLimiterOptions = {
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per minute
  message: { error: 'Too many requests, please try again later.' },
  statusCode: 429,
  headers: true,
};

/**
 * Create a rate limiter middleware for Next.js API routes
 * 
 * @param options Rate limiter options
 * @returns A middleware function for Next.js API routes
 */
export function createRateLimiter(options: RateLimiterOptions = {}) {
  // Merge default options with provided options
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Create a rate limiter instance with express-rate-limit
  const limiter = rateLimit({
    windowMs: mergedOptions.windowMs!,
    max: mergedOptions.max!,
    standardHeaders: mergedOptions.headers,
    legacyHeaders: false,
    keyGenerator: (req: any) => {
      // Default to IP-based limiting, but allow custom key generation
      if (mergedOptions.keyGenerator) {
        return mergedOptions.keyGenerator(req as NextApiRequest);
      }
      
      return req.headers['x-real-ip'] || 
             req.headers['x-forwarded-for'] || 
             req.ip || 
             'unknown';
    },
    skip: (req: any) => {
      // Allow skipping rate limit based on custom logic
      return mergedOptions.skip ? mergedOptions.skip(req as NextApiRequest) : false;
    },
    handler: (_, res: any) => {
      // Custom handler for rate limit exceeded
      res.status(mergedOptions.statusCode!).json(mergedOptions.message!);
    },
  });

  // Return a middleware function for Next.js API routes
  return async function rateLimiterMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    next?: () => void
  ) {
    return new Promise<void>((resolve, reject) => {
      limiter(req as any, res as any, (error?: Error) => {
        if (error) {
          reject(error);
          return;
        }
        
        // If next is provided, call it (for API route handlers)
        if (next) {
          next();
        }
        
        resolve();
      });
    });
  };
}

/**
 * Different rate limiters for different API endpoints
 */
export const apiRateLimiter = createRateLimiter();

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login/signup attempts per 15 minutes
  message: { error: 'Too many login attempts, please try again later.' },
});

export const sensitiveApiRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // limit each IP to 30 requests per hour for sensitive operations
});

// Helper to apply rate limiting to an API route
export function withRateLimit(handler: any, limiter = apiRateLimiter) {
  return async function rateLimit(req: NextApiRequest, res: NextApiResponse) {
    try {
      await limiter(req, res);
      return handler(req, res);
    } catch (error) {
      console.error('Rate limiter error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
} 