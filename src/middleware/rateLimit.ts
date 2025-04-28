import { NextResponse } from 'next/server';
import { Redis } from 'ioredis';
import { getClientIp } from 'request-ip';

const redis = new Redis(process.env.REDIS_URL);

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later.',
  statusCode: 429,
};

export async function rateLimit(
  req: Request,
  config: Partial<RateLimitConfig> = {},
): Promise<NextResponse | null> {
  const finalConfig = { ...defaultConfig, ...config };
  const ip = getClientIp(req);
  const key = `rate-limit:${ip}`;

  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, finalConfig.windowMs / 1000);
    }

    if (current > finalConfig.max) {
      return NextResponse.json({ error: finalConfig.message }, { status: finalConfig.statusCode });
    }

    return null;
  } catch (error) {
    console.error('Rate limit error:', error);
    return null;
  }
}

export async function validateRequest(req: Request): Promise<NextResponse | null> {
  // Validate content type
  const contentType = req.headers.get('content-type');
  if (contentType && !contentType.includes('application/json')) {
    return NextResponse.json(
      { error: 'Invalid content type. Expected application/json' },
      { status: 415 },
    );
  }

  // Validate request size
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 1024 * 1024) {
    // 1MB limit
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
  }

  // Validate HTTP method
  const method = req.method;
  if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return NextResponse.json({ error: 'Invalid HTTP method' }, { status: 405 });
  }

  return null;
}

export async function sanitizeInput(input: any): Promise<any> {
  if (typeof input !== 'object' || input === null) {
    return input;
  }

  const sanitized: any = Array.isArray(input) ? [] : {};

  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') {
      sanitized[key] = value
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/data:/gi, ''); // Remove data: protocol
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = await sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export async function validateAndSanitizeRequest(
  req: Request,
): Promise<{ error: NextResponse | null; data: any }> {
  // Validate request
  const validationError = await validateRequest(req);
  if (validationError) {
    return { error: validationError, data: null };
  }

  // Apply rate limiting
  const rateLimitError = await rateLimit(req);
  if (rateLimitError) {
    return { error: rateLimitError, data: null };
  }

  // Parse and sanitize request body
  let data = null;
  if (req.method !== 'GET') {
    try {
      data = await req.json();
      data = await sanitizeInput(data);
    } catch (error) {
      return {
        error: NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 }),
        data: null,
      };
    }
  }

  return { error: null, data };
}
