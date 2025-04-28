/**
 * HTTP Rate Limiter Implementation
 *
 * This module provides rate limiting adapters for HTTP/REST API routes
 * supporting both App Router and Pages Router in Next.js.
 */

import { NextRequest, NextResponse } from 'next/server';
import { RateLimitOptions, DEFAULT_OPTIONS } from './types';
import { checkRateLimit, logRateLimitEvent, shouldUseRedis, getIdentifier } from './core';

/**
 * Create a rate limiter middleware for use with any HTTP request
 */
export function createRateLimiter(options: RateLimitOptions = {}) {
  const mergedOptions: RateLimitOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  /**
   * App Router handler (Next.js App Router)
   */
  const appRouterHandler = async (req: NextRequest): Promise<NextResponse | null> => {
    // Skip rate limiting if specified
    if (mergedOptions.skip && mergedOptions.skip(req)) {
      return null;
    }

    // Get identifier for this request (usually IP-based)
    const identifier = getIdentifier(req, mergedOptions);

    // Check rate limit
    const useRedis = shouldUseRedis();
    const result = await checkRateLimit(identifier, mergedOptions, useRedis);

    // Log the rate limit event
    await logRateLimitEvent(identifier, req.nextUrl.pathname, req.method, 'http', result);

    // If within limit, allow the request
    if (result.success) {
      return null;
    }

    // If over limit, return rate limit response
    const message = mergedOptions.message || DEFAULT_OPTIONS.message!;
    const statusCode = mergedOptions.statusCode || DEFAULT_OPTIONS.statusCode!;

    return NextResponse.json(typeof message === 'string' ? { error: message } : message, {
      status: statusCode,
      headers: {
        'Retry-After': String(result.retryAfter || 60),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
      },
    });
  };

  /**
   * Pages Router handler (Next.js Pages Router)
   */
  const pagesRouterHandler = async (req: any, res: any, next?: () => void) => {
    // Skip rate limiting if specified
    if (mergedOptions.skip && mergedOptions.skip(req)) {
      return next ? next() : undefined;
    }

    // Get identifier for this request (usually IP-based)
    const identifier = getIdentifier(req, mergedOptions);

    // Check rate limit
    const useRedis = shouldUseRedis();
    const result = await checkRateLimit(identifier, mergedOptions, useRedis);

    // Log the rate limit event
    await logRateLimitEvent(identifier, req.url || '/', req.method, 'http', result);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', String(result.limit));
    res.setHeader('X-RateLimit-Remaining', String(result.remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)));

    // If within limit, proceed
    if (result.success) {
      return next ? next() : undefined;
    }

    // If over limit, return rate limit response
    const message = mergedOptions.message || DEFAULT_OPTIONS.message!;
    const statusCode = mergedOptions.statusCode || DEFAULT_OPTIONS.statusCode!;

    res.status(statusCode);
    res.setHeader('Retry-After', String(result.retryAfter || 60));

    return res.json(typeof message === 'string' ? { error: message } : message);
  };

  /**
   * Universal handler that detects the request type and applies appropriate limiter
   */
  return function universalRateLimiter(req: any, res?: any, next?: any) {
    // App Router (NextRequest object)
    if (req.nextUrl && req.cookies && !res) {
      return appRouterHandler(req as NextRequest);
    }
    // Pages Router (req, res objects)
    else if (req && res && res.setHeader) {
      return pagesRouterHandler(req, res, next);
    }
    // Fallback for custom implementations
    else {
      throw new Error('Unsupported request type for rate limiter');
    }
  };
}

/**
 * Apply rate limiting to a request using a specific limiter
 */
export async function applyRateLimit(
  req: NextRequest,
  limiter = apiRateLimiter,
): Promise<NextResponse | null> {
  return limiter(req);
}

/**
 * Higher-order function to wrap an API handler with rate limiting
 */
export function withRateLimit(handler: any, limiter = apiRateLimiter) {
  return async function rateLimit(req: any, res: any) {
    // App Router
    if (req.nextUrl) {
      const rateLimit = await limiter(req);
      if (rateLimit) return rateLimit;
      return handler(req);
    }
    // Pages Router
    else {
      await limiter(req, res, () => handler(req, res));
    }
  };
}

/**
 * Default HTTP rate limiter with standard settings
 */
export const apiRateLimiter = createRateLimiter();

/**
 * Specialized HTTP rate limiters for different types of routes
 */
export {};

export {};

export {};

export {};

export {};

export {};

export {};
