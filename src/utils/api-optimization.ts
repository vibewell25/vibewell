import { NextResponse } from 'next/server';
import { Redis } from 'ioredis';
import { gzip } from 'zlib';
import { promisify } from 'util';
import { createHash } from 'crypto';
import { MonitoringService } from '../types/monitoring';

const gzipAsync = promisify(gzip);

// Initialize Redis client
const redis = new Redis(process.env['REDIS_URL'] || 'redis://localhost:6379');

interface CacheConfig {
  duration: number; // Duration in seconds
  key: string;
}

interface CompressionConfig {
  threshold: number; // Size in bytes
  level: number; // Compression level (1-9)
}

interface OptimizationOptions {
  cache?: CacheConfig;
  compression?: CompressionConfig;
  etag?: boolean;
  cors?: boolean;
  rateLimit?: {
    max: number;
    windowMs: number;
  };
}

const DEFAULT_OPTIONS: OptimizationOptions = {
  cache: {
    duration: 300, // 5 minutes
    key: '',
  },
  compression: {
    threshold: 1024, // 1KB
    level: 6,
  },
  etag: true,
  cors: true,
  rateLimit: {
    max: 100,
    windowMs: 60000, // 1 minute
  },
};

// Rate limiting implementation
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, options: OptimizationOptions): boolean {
  const now = Date.now();
  const limit = options.rateLimit!;
  const store = rateLimitStore.get(ip) || { count: 0, resetTime: now + limit.windowMs };

  if (now > store.resetTime) {
    store.count = 1;
    store.resetTime = now + limit.windowMs;
  } else if (store.count >= limit.max) {
    return false;
  } else {
    store.count++;
  }

  rateLimitStore.set(ip, store);
  return true;
}

// Generate ETag for response
function generateETag(data: any): string {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `"${hash.toString(36)}"`;
}

// Optimize API response
export async function optimizeResponse(
  data: any,
  options: OptimizationOptions = DEFAULT_OPTIONS,
  request: Request
): Promise<NextResponse> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const headers = new Headers();

  // Check rate limit
  if (mergedOptions.rateLimit) {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIp, mergedOptions)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests' }),
        { status: 429, headers }
      );
    }
  }

  // Try cache first
  if (mergedOptions.cache?.key) {
    const cached = await redis.get(mergedOptions.cache.key);
    if (cached) {
      const parsedCache = JSON.parse(cached);
      headers.set('X-Cache', 'HIT');
      return new NextResponse(
        parsedCache.data,
        { 
          headers: new Headers({
            ...parsedCache.headers,
            'X-Cache': 'HIT',
          })
        }
      );
    }
  }

  // Prepare response
  let responseBody = JSON.stringify(data);
  
  // Compress if needed
  if (
    mergedOptions.compression &&
    responseBody.length > mergedOptions.compression.threshold &&
    request.headers.get('accept-encoding')?.includes('gzip')
  ) {
    const compressed = await gzipAsync(Buffer.from(responseBody));
    responseBody = compressed.toString('base64');
    headers.set('Content-Encoding', 'gzip');
  }

  // Set CORS headers
  if (mergedOptions.cors) {
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Set ETag
  if (mergedOptions.etag) {
    const etag = generateETag(data);
    headers.set('ETag', etag);
    
    // Check if-none-match
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304, headers });
    }
  }

  // Cache response if needed
  if (mergedOptions.cache?.key) {
    await redis.set(
      mergedOptions.cache.key,
      JSON.stringify({
        data: responseBody,
        headers: Object.fromEntries(headers.entries()),
      }),
      'EX',
      mergedOptions.cache.duration
    );
    headers.set('X-Cache', 'MISS');
  }

  // Set standard headers
  headers.set('Content-Type', 'application/json');
  headers.set('X-Response-Time', Date.now().toString());

  return new NextResponse(responseBody, { headers });
}

// Cache warming utility
export async function warmCache(
  urls: string[],
  options: OptimizationOptions = DEFAULT_OPTIONS
): Promise<void> {
  const requests = urls.map(url =>
    fetch(url)
      .then(res => res.json())
      .then(async data => {
        if (options.cache?.key) {
          await redis.set(
            options.cache.key,
            JSON.stringify({ data, headers: {} }),
            'EX',
            options.cache.duration
          );
        }
      })
      .catch(console.error)
  );

  await Promise.all(requests);
}

// Cache invalidation utility
export async function invalidateApiCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
} 