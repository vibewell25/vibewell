/**
 * Redis Connection Resilience Tests
 * 
 * This test suite verifies that the rate-limiting system properly falls back
 * to in-memory storage when Redis is unavailable.
 */

import { applyRateLimit, apiRateLimiter } from '../src/lib/rate-limiter';
import { NextRequest } from 'next/server';
import Redis from 'ioredis-mock';

// Mock process.env
const originalEnv = process.env;

// Mock NextRequest
class MockNextRequest implements Partial<NextRequest> {
  private headers: Map<string, string>;
  readonly method: string;
  readonly url: string;

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
      const response = await applyRateLimit(req, apiRateLimiter);
      if (response) {
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
    
    // Import Redis client and configure it to simulate failure
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
      new MockNextRequest('GET', 'http://localhost:3000/api/test', {
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
          rateLimitedCount++;
        } else {
          successCount++;
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
    const redisClient = require('../src/lib/redis-client').default;
    redisClient.get.mockImplementation(() => {
      throw new Error('Redis connection error');
    });
    
    // Import multiple rate limiters
    const { authRateLimiter, sensitiveApiRateLimiter } = require('../src/lib/rate-limiter');
    
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
      const response = await applyRateLimit(req, authRateLimiter);
      if (response) {
        authLimitedCount++;
      }
    }
    
    // Test sensitive rate limiter
    let sensitiveLimitedCount = 0;
    for (const req of sensitiveRequests) {
      const response = await applyRateLimit(req, sensitiveApiRateLimiter);
      if (response) {
        sensitiveLimitedCount++;
      }
    }
    
    // Verify that each rate limiter applied its own limits independently
    expect(authLimitedCount).toBeGreaterThan(0);
    expect(sensitiveLimitedCount).toBeGreaterThan(0);
  });
}); 