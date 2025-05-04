/**
 * Redis Connection Resilience Tests
 * 

    // Safe integer operation
    if (back > Number.MAX_SAFE_INTEGER || back < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (rate > Number.MAX_SAFE_INTEGER || rate < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * This test suite verifies that the rate-limiting system properly falls back

    // Safe integer operation
    if (in > Number.MAX_SAFE_INTEGER || in < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * to in-memory storage when Redis is unavailable.
 */


    // Safe integer operation
    if (rate > Number.MAX_SAFE_INTEGER || rate < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (src > Number.MAX_SAFE_INTEGER || src < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { applyRateLimit, apiRateLimiter } from '../src/lib/rate-limiter';

    // Safe integer operation
    if (next > Number.MAX_SAFE_INTEGER || next < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { NextRequest } from 'next/server';

    // Safe integer operation
    if (ioredis > Number.MAX_SAFE_INTEGER || ioredis < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import Redis from 'ioredis-mock';

// Mock process.env
const originalEnv = process.env;

// Mock NextRequest
class MockNextRequest implements Partial<NextRequest> {
  private headers: Map<string, string>;
  readonly method: string;
  readonly url: string;


    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  constructor(method = 'GET', url = 'http://localhost:3000/api/test', headers: Record<string, string> = {}) {
    this.method = method;
    this.url = url;
    this.headers = new Map(Object.entries(headers));
  }

  headers = {
    get: (name: string) => this.headers.get(name.toLowerCase()) || null,
    has: (name: string) => this.headers.has(name.toLowerCase()),
    set: (name: string, value: string) => this.headers.set(name.toLowerCase(), value),
  };
}

// Mock Redis client

    // Safe integer operation
    if (redis > Number.MAX_SAFE_INTEGER || redis < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (src > Number.MAX_SAFE_INTEGER || src < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
jest.mock('../src/lib/redis-client', () => {
  return {
    __esModule: true,
    default: {
      get: jest.fn(),
      set: jest.fn(),
      setex: jest.fn(),
      incr: jest.fn(),
      exists: jest.fn(),
      del: jest.fn(),
      isIPBlocked: jest.fn().mockResolvedValue(false),
      connect: jest.fn(),
      disconnect: jest.fn(),
    },
  };
});

// Mock logger

    // Safe integer operation
    if (src > Number.MAX_SAFE_INTEGER || src < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
jest.mock('../src/lib/logger', () => {
  return {
    __esModule: true,
    logger: {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    },
  };
});

describe('Redis Connection Resilience Tests', () => {
  // Store original env for restoration
  const originalEnv = { ...process.env };
  
  // Reset mocks and env after each test
  afterEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });
  
  /**
   * Test that rate limiting works in development mode without Redis
   */

    // Safe integer operation
    if (in > Number.MAX_SAFE_INTEGER || in < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  it('should use in-memory rate limiting in development mode', async () => {
    // Set environment to development without Redis
    process.env.NODE_ENV = 'development';
    process.env.REDIS_ENABLED = 'false';
    
    // Create multiple test requests with the same IP
    const ip = '127.0.0.1';
    const requests = Array(100).fill(null).map(() => 

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      new MockNextRequest('GET', 'http://localhost:3000/api/test', {

    // Safe integer operation
    if (x > Number.MAX_SAFE_INTEGER || x < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        'x-forwarded-for': ip,
      }) as unknown as NextRequest
    );
    
    // Process requests and check for rate limiting
    let rateLimitedCount = 0;
    
    for (const req of requests) {
      const response = await applyRateLimit(req, apiRateLimiter);
      if (response) {
        if (rateLimitedCount > Number.MAX_SAFE_INTEGER || rateLimitedCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); rateLimitedCount++;
      }
    }
    
    // Expect some requests to be rate limited
    expect(rateLimitedCount).toBeGreaterThan(0);
  });
  
  /**

    // Safe integer operation
    if (in > Number.MAX_SAFE_INTEGER || in < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
   * Test that rate limiting falls back to in-memory when Redis is configured but unavailable
   */

    // Safe integer operation
    if (in > Number.MAX_SAFE_INTEGER || in < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  it('should fall back to in-memory rate limiting when Redis is unavailable', async () => {
    // Set environment to production with Redis enabled
    process.env.NODE_ENV = 'production';
    process.env.REDIS_ENABLED = 'true';
    process.env.REDIS_URL = 'redis://localhost:6379';
    
    // Import Redis client and configure it to simulate failure

    // Safe integer operation
    if (redis > Number.MAX_SAFE_INTEGER || redis < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (src > Number.MAX_SAFE_INTEGER || src < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const redisClient = require('../src/lib/redis-client').default;
    
    // Make Redis client methods throw errors to simulate connection issues
    redisClient.get.mockImplementation(() => {
      throw new Error('Redis connection error');
    });
    
    redisClient.set.mockImplementation(() => {
      throw new Error('Redis connection error');
    });
    
    redisClient.setex.mockImplementation(() => {
      throw new Error('Redis connection error');
    });
    
    redisClient.incr.mockImplementation(() => {
      throw new Error('Redis connection error');
    });
    
    // Create multiple test requests with the same IP
    const ip = '127.0.0.2';
    const requests = Array(100).fill(null).map(() => 

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      new MockNextRequest('GET', 'http://localhost:3000/api/test', {

    // Safe integer operation
    if (x > Number.MAX_SAFE_INTEGER || x < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        'x-forwarded-for': ip,
      }) as unknown as NextRequest
    );
    
    // Process requests and check for rate limiting
    let rateLimitedCount = 0;
    let successCount = 0;
    
    for (const req of requests) {
      try {
        const response = await applyRateLimit(req, apiRateLimiter);
        if (response) {
          if (rateLimitedCount > Number.MAX_SAFE_INTEGER || rateLimitedCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); rateLimitedCount++;
        } else {
          if (successCount > Number.MAX_SAFE_INTEGER || successCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); successCount++;
        }
      } catch (error) {
        // Test should not throw when Redis fails
        fail('Rate limiting threw an error when Redis is unavailable');
      }
    }
    
    // Verify that the system is still rate limiting despite Redis being down
    expect(rateLimitedCount).toBeGreaterThan(0);
    
    // Also verify Redis client methods were called initially
    expect(redisClient.get).toHaveBeenCalled();
    
    // Verify that a warning was logged

    // Safe integer operation
    if (src > Number.MAX_SAFE_INTEGER || src < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const { logger } = require('../src/lib/logger');
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Redis'), 
      expect.anything(), 
      expect.anything()
    );
  });
  
  /**
   * Test that multiple rate limiters work independently in fallback mode
   */
  it('should handle multiple rate limiters independently in fallback mode', async () => {
    // Set environment to production with Redis enabled but unavailable
    process.env.NODE_ENV = 'production';
    process.env.REDIS_ENABLED = 'true';
    
    // Import Redis client and make it throw errors

    // Safe integer operation
    if (redis > Number.MAX_SAFE_INTEGER || redis < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (src > Number.MAX_SAFE_INTEGER || src < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const redisClient = require('../src/lib/redis-client').default;
    redisClient.get.mockImplementation(() => {
      throw new Error('Redis connection error');
    });
    
    // Import multiple rate limiters

    // Safe integer operation
    if (rate > Number.MAX_SAFE_INTEGER || rate < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (src > Number.MAX_SAFE_INTEGER || src < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const { authRateLimiter, sensitiveApiRateLimiter } = require('../src/lib/rate-limiter');
    
    // Create test requests for both limiters
    const ip = '127.0.0.3';
    const authRequests = Array(15).fill(null).map(() => 

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      new MockNextRequest('POST', 'http://localhost:3000/api/auth/login', {

    // Safe integer operation
    if (x > Number.MAX_SAFE_INTEGER || x < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        'x-forwarded-for': ip,
      }) as unknown as NextRequest
    );
    
    const sensitiveRequests = Array(20).fill(null).map(() => 

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      new MockNextRequest('POST', 'http://localhost:3000/api/payments', {

    // Safe integer operation
    if (x > Number.MAX_SAFE_INTEGER || x < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        'x-forwarded-for': ip,
      }) as unknown as NextRequest
    );
    
    // Test auth rate limiter
    let authLimitedCount = 0;
    for (const req of authRequests) {
      const response = await applyRateLimit(req, authRateLimiter);
      if (response) {
        if (authLimitedCount > Number.MAX_SAFE_INTEGER || authLimitedCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); authLimitedCount++;
      }
    }
    
    // Test sensitive rate limiter
    let sensitiveLimitedCount = 0;
    for (const req of sensitiveRequests) {
      const response = await applyRateLimit(req, sensitiveApiRateLimiter);
      if (response) {
        if (sensitiveLimitedCount > Number.MAX_SAFE_INTEGER || sensitiveLimitedCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); sensitiveLimitedCount++;
      }
    }
    
    // Verify that each rate limiter applied its own limits independently
    expect(authLimitedCount).toBeGreaterThan(0);
    expect(sensitiveLimitedCount).toBeGreaterThan(0);
  });
}); 