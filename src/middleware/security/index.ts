import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { csrfMiddleware, generateCsrfToken, verifyCsrfToken, getCsrfToken } from './csrf';

// In-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; timestamp: number }>();

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

export const rateLimitConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
};

/**
 * Check if a request should be rate limited
 *
 * @param req - Next.js request
 * @returns NextResponse with 429 status if rate limited, null otherwise
 */
export function checkRateLimit(req: NextRequest): NextResponse | null {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

  const now = Date.now();
  const windowStart = now - rateLimitConfig.windowMs;

  // Clean old entries
  if (rateLimitStore.size > 10000) {
    // Prevent memory leak
    // Convert to array first to avoid iteration issues
    Array.from(rateLimitStore.entries()).forEach(([key, data]) => {
      if (data.timestamp < windowStart) {
        rateLimitStore.delete(key);
      }
    });
  }

  // Get or create record
  const record = rateLimitStore.get(ip) || { count: 0, timestamp: now };

  // Reset if window expired
  if (record.timestamp < windowStart) {
    record.count = 0;
    record.timestamp = now;
  }

  // Increment count
  record.count += 1;
  rateLimitStore.set(ip, record);

  // Check if over limit
  if (record.count > rateLimitConfig.max) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests', message: rateLimitConfig.message }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': `${Math.ceil(rateLimitConfig.windowMs / 1000)}`,
        },
      },
    );
  }

  return null;
}

// CORS configuration
export const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN'],
};

// Security headers middleware
export async function securityMiddleware(request: NextRequest) {
  // Check rate limit first
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Apply CSRF middleware next
  const csrfResponse = csrfMiddleware(request);

  // If CSRF validation failed, return the error response
  if (csrfResponse.status !== 200) {
    return csrfResponse;
  }

  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' ${process.env.API_URL || ''};
  `
      .replace(/\s+/g, ' ')
      .trim(),
  );

  return response;
}

// Field-level encryption utility
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export const fieldEncryption = {
  encrypt: (text: string, key: string = process.env.ENCRYPTION_KEY || ''): string => {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  },

  decrypt: (text: string, key: string = process.env.ENCRYPTION_KEY || ''): string => {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  },
};

// Export CSRF utilities
export { generateCsrfToken, verifyCsrfToken, getCsrfToken };

// Named exports
export { csrfMiddleware };

// Default export
export default {
  rateLimitConfig,
  checkRateLimit,
  corsOptions,
  securityMiddleware,
  fieldEncryption,
  generateCsrfToken,
  verifyCsrfToken,
  getCsrfToken,
  csrfMiddleware,
};
