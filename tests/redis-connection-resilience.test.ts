import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { applyRateLimit, apiRateLimiter, authRateLimiter, sensitiveApiRateLimiter } from '../src/lib/rate-limiter';
import { NextRequest } from 'next/server';

// Mock process.env
const originalEnv = process.env;

// Mock Headers class
class MockHeaders implements Headers {
  private headerMap: Map<string, string>;

  constructor(headers: Record<string, string> = {}) {
    this.headerMap = new Map(Object.entries(headers));
  }

  append(name: string, value: string): void {
    const existingValue = this.headerMap.get(name.toLowerCase());
    if (existingValue) {
      this.headerMap.set(name.toLowerCase(), `${existingValue}, ${value}`);
    } else {
      this.headerMap.set(name.toLowerCase(), value);
    }
  }

  delete(name: string): void {
    this.headerMap.delete(name.toLowerCase());
  }

  get(name: string): string | null {
    return this.headerMap.get(name.toLowerCase()) || null;
  }

  has(name: string): boolean {
    return this.headerMap.has(name.toLowerCase());
  }

  set(name: string, value: string): void {
    this.headerMap.set(name.toLowerCase(), value);
  }

  forEach(callbackfn: (value: string, key: string, parent: Headers) => void): void {
    this.headerMap.forEach((value, key) => callbackfn(value, key, this));
  }

  // Implementing required methods to satisfy the Headers interface
  getSetCookie(): string[] {
    return [];
  }

  *entries(): IterableIterator<[string, string]> {
    yield* this.headerMap.entries();
  }

  *keys(): IterableIterator<string> {
    yield* this.headerMap.keys();
  }

  *values(): IterableIterator<string> {
    yield* this.headerMap.values();
  }

  [Symbol.iterator](): IterableIterator<[string, string]> {
    return this.entries();
  }
}

// Mock NextRequest
class MockNextRequest implements Partial<NextRequest> {
  readonly method: string;
  readonly url: string;
  readonly headers: Headers;

  constructor(method = 'GET', url = 'http://localhost:3000/api/test', headers: Record<string, string> = {}) {
    this.method = method;
    this.url = url;
    this.headers = new MockHeaders(headers);
  }
}

// Create a mock Redis client
const mockRedisClient = {
  get: vi.fn(),
  set: vi.fn(),
  setex: vi.fn(),
  incr: vi.fn(),
  exists: vi.fn(),
  del: vi.fn(),
  isIPBlocked: vi.fn().mockResolvedValue(false),
  connect: vi.fn(),
  disconnect: vi.fn(),
};

// Mock logger
const mockLogger = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Mock Redis client
vi.mock('../src/lib/redis-client', () => {
  return {
    getRedisClient: () => mockRedisClient
  };
});

// Mock logger
vi.mock('../src/lib/logger', () => {
  return {
    logger: mockLogger
  };
});

describe('Redis Connection Resilience Tests', () => {
  // Store original env for restoration
  const originalEnv = { ...process.env };
  
  // Reset mocks and env after each test
  afterEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  /**
   * Test that rate limiting works in development mode without Redis
   */
  it('should use in-memory rate limiting in development mode', async () => {
    // Set environment to development without Redis
    process.env.NODE_ENV = 'development';
    process.env.REDIS_ENABLED = 'false';
    
    // Create multiple test requests with the same IP
    const ip = '127.0.0.1';
    const requests = Array(100).fill(null).map(() => 
      new MockNextRequest('GET', 'http://localhost:3000/api/test', {
        'x-forwarded-for': ip,
      }) as unknown as NextRequest
    );
    
    // Process requests and check for rate limiting
    let rateLimitedCount = 0;
    
    for (const req of requests) {
      const response = await applyRateLimit(req, {
        ...apiRateLimiter,
        limit: 5  // Set a very low limit to ensure rate limiting kicks in
      });
      if (response) {
        if (rateLimitedCount > Number.MAX_SAFE_INTEGER || rateLimitedCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow');
        rateLimitedCount++;
      }
    }
    
    // Expect some requests to be rate limited
    expect(rateLimitedCount).toBeGreaterThan(0);
  });

  /**
   * Test that rate limiting falls back to in-memory when Redis is configured but unavailable
   */
  it('should fall back to in-memory rate limiting when Redis is unavailable', async () => {
    // Set environment to production with Redis enabled
    process.env.NODE_ENV = 'production';
    process.env.REDIS_ENABLED = 'true';
    process.env.REDIS_URL = 'redis://localhost:6379';
    
    // Make Redis client methods throw errors to simulate connection issues
    mockRedisClient.get.mockImplementation(() => {
      throw new Error('Redis connection error');
    });
    mockRedisClient.set.mockImplementation(() => {
      throw new Error('Redis connection error');
    });
    mockRedisClient.setex.mockImplementation(() => {
      throw new Error('Redis connection error');
    });
    mockRedisClient.incr.mockImplementation(() => {
      throw new Error('Redis connection error');
    });
    
    // Create multiple test requests with the same IP
    const ip = '127.0.0.2';
    const requests = Array(100).fill(null).map(() => 
      new MockNextRequest('GET', 'http://localhost:3000/api/test', {
        'x-forwarded-for': ip,
      }) as unknown as NextRequest
    );
    
    // Process requests and check for rate limiting
    let rateLimitedCount = 0;
    let successCount = 0;
    
    for (const req of requests) {
      try {
        const response = await applyRateLimit(req, {
          ...apiRateLimiter,
          limit: 5  // Set a very low limit to ensure rate limiting kicks in
        });
        if (response) {
          if (rateLimitedCount > Number.MAX_SAFE_INTEGER || rateLimitedCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow');
          rateLimitedCount++;
        } else {
          if (successCount > Number.MAX_SAFE_INTEGER || successCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow');
          successCount++;
        }
      } catch (error) {
        // Test should not throw when Redis fails
        fail('Rate limiting threw an error when Redis is unavailable');
      }
    }
    
    // Verify that the system is still rate limiting despite Redis being down
    expect(rateLimitedCount).toBeGreaterThan(0);
    
    // Test succeeds even if Redis methods weren't called, as we're checking
    // that rate limiting works in the fallback scenario
  });

  /**
   * Test that multiple rate limiters work independently in fallback mode
   */
  it('should handle multiple rate limiters independently in fallback mode', async () => {
    // Set environment to production with Redis enabled but unavailable
    process.env.NODE_ENV = 'production';
    process.env.REDIS_ENABLED = 'true';
    
    // Make Redis client throw errors
    mockRedisClient.get.mockImplementation(() => {
      throw new Error('Redis connection error');
    });
    
    // Create test requests for both limiters
    const ip = '127.0.0.3';
    const authRequests = Array(15).fill(null).map(() => 
      new MockNextRequest('POST', 'http://localhost:3000/api/auth/login', {
        'x-forwarded-for': ip,
      }) as unknown as NextRequest
    );
    
    const sensitiveRequests = Array(20).fill(null).map(() => 
      new MockNextRequest('POST', 'http://localhost:3000/api/payments', {
        'x-forwarded-for': ip,
      }) as unknown as NextRequest
    );
    
    // Test auth rate limiter
    let authLimitedCount = 0;
    for (const req of authRequests) {
      const response = await applyRateLimit(req, {
        ...authRateLimiter,
        limit: 2  // Set a very low limit to ensure rate limiting kicks in
      });
      if (response) {
        if (authLimitedCount > Number.MAX_SAFE_INTEGER || authLimitedCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow');
        authLimitedCount++;
      }
    }
    
    // Test sensitive rate limiter
    let sensitiveLimitedCount = 0;
    for (const req of sensitiveRequests) {
      const response = await applyRateLimit(req, {
        ...sensitiveApiRateLimiter,
        limit: 2  // Set a very low limit to ensure rate limiting kicks in
      });
      if (response) {
        if (sensitiveLimitedCount > Number.MAX_SAFE_INTEGER || sensitiveLimitedCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow');
        sensitiveLimitedCount++;
      }
    }
    
    // Verify that each rate limiter applied its own limits independently
    expect(authLimitedCount).toBeGreaterThan(0);
    expect(sensitiveLimitedCount).toBeGreaterThan(0);
  });
});
