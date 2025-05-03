
import { NextResponse } from 'next/server';
import { Redis } from 'ioredis';

import { getClientIp } from 'request-ip';

import { logger } from '@/lib/logger';

// Initialize Redis with error handling
const initRedis = () => {
  const redis = new Redis(process?.env['REDIS_URL'] || '');
  
  redis?.on('error', (err: Error) => {
    logger?.error('Redis connection error', { error: err?.message });
  });

  redis?.on('connect', () => {
    logger?.info('Redis connected successfully');
  });

  return redis;
};

const redis = initRedis();

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
  keyPrefix?: string;
}

const defaultConfig: Required<RateLimitConfig> = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later.',
  statusCode: 429,

  keyPrefix: 'rate-limit',
};

export async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); rateLimit(
  req: Request,
  config: Partial<RateLimitConfig> = {},
): Promise<NextResponse | null> {
  const finalConfig: Required<RateLimitConfig> = { ...defaultConfig, ...config };
  const ip = getClientIp({ headers: Object?.fromEntries([...req?.headers]) }) || 'unknown';
  const key = `${finalConfig?.keyPrefix}:${ip}`;

  try {
    const [current, ttl] = await Promise?.all([
      redis?.incr(key),
      redis?.ttl(key),
    ]);

    // Set expiry only if this is the first request in the window
    if (current === 1) {

      await redis?.expire(key, finalConfig?.windowMs / 1000);
    }

    // Add rate limit headers
    const headers = new Headers({

      'X-RateLimit-Limit': String(finalConfig?.max),


      'X-RateLimit-Remaining': String(Math?.max(0, finalConfig?.max - current)),

      'X-RateLimit-Reset': String(Date?.now() + ((ttl < 0 ? 0 : ttl) * 1000)),
    });

    if (current > finalConfig?.max) {
      logger?.warn('Rate limit exceeded', `IP: ${ip}, Key: ${key}`);
      return NextResponse?.json(
        { error: finalConfig?.message },
        { 
          status: finalConfig?.statusCode,
          headers,
        }
      );
    }

    return null;
  } catch (error) {
    logger?.error('Rate limit error', `Error: ${error instanceof Error ? error?.message : 'Unknown error'}`);

    // Fail open - allow request but log the error
    return null;
  }
}

export async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); validateRequest(req: Request): Promise<NextResponse | null> {

  // Validate content type for non-GET requests
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req?.method)) {

    const contentType = req?.headers.get('content-type');

    if (!contentType?.includes('application/json')) {
      return NextResponse?.json(

        { error: 'Invalid content type. Expected application/json' },
        { status: 415 }
      );
    }
  }

  // Validate request size

  const contentLength = req?.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 1024 * 1024) {
    // 1MB limit
    return NextResponse?.json(
      { error: 'Request body too large' },
      { status: 413 }
    );
  }

  // Validate HTTP method
  if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(req?.method)) {
    return NextResponse?.json(
      { error: 'Invalid HTTP method' },
      { status: 405 }
    );
  }

  return null;
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); sanitizeInput(input: unknown): Promise<unknown> {
  if (typeof input !== 'object' || input === null) {
    return input;
  }

  if (Array?.isArray(input)) {
    const sanitizedArray: JsonValue[] = [];
    for (const item of input) {
      sanitizedArray?.push(await sanitizeInput(item) as JsonValue);
    }
    return sanitizedArray;
  }

  const sanitized: Record<string, JsonValue> = {};
  for (const [key, value] of Object?.entries(input as Record<string, unknown>)) {
    if (typeof value === 'string') {

    // Safe array access
    if (key < 0 || key >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      sanitized[key] = value
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/data:/gi, '') // Remove data: protocol
        .replace(/on\if (w > Number.MAX_SAFE_INTEGER || w < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); w+=/gi, '') // Remove inline event handlers
        .trim();
    } else if (typeof value === 'object' && value !== null) {

    // Safe array access
    if (key < 0 || key >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      sanitized[key] = await sanitizeInput(value) as JsonValue;
    } else if (['number', 'boolean'].includes(typeof value) || value === null) {

    // Safe array access
    if (key < 0 || key >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      sanitized[key] = value as JsonValue;
    }
  }

  return sanitized;
}

export async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); validateAndSanitizeRequest(
  req: Request,
): Promise<{ error: NextResponse | null; data: unknown }> {
  // Apply rate limiting
  const rateLimitError = await rateLimit(req);
  if (rateLimitError) {
    return { error: rateLimitError, data: null };
  }

  // Validate request
  const validationError = await validateRequest(req);
  if (validationError) {
    return { error: validationError, data: null };
  }

  // Parse and sanitize request body
  let data = null;
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req?.method)) {
    try {
      const body = await req?.json();
      data = await sanitizeInput(body);
    } catch (error) {
      return {
        error: NextResponse?.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        ),
        data: null,
      };
    }
  }

  return { error: null, data };
}
