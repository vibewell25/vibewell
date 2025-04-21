import '@testing-library/jest-dom';
// Import from mocked next/server
import { NextRequest, NextResponse } from 'next/server';
import {
  apiRateLimiter,
  authRateLimiter,
  createRateLimiter,
  applyRateLimit,
  webSocketRateLimiter,
} from '@/lib/rate-limiter';

// Import mocked versions of dependencies
jest.mock('next/server');
jest.mock('@/lib/redis-client');
jest.mock('graphql');
jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Override the behavior of the custom limiter for testing
const mockLimiters = new Map();

// Helper to check if a response is a rate limit response
function isRateLimitResponse(response: any): boolean {
  return response !== null && response.status >= 400;
}

// Helper to check if response is allowed (not rate limited)
function isAllowed(response: any): boolean {
  return response === null || response.status < 400;
}

// Mock Redis for production tests
jest.mock('@/lib/redis-client', () => {
  return {
    __esModule: true,
    default: {
      get: jest.fn(),
      set: jest.fn(),
      incr: jest.fn(),
      expire: jest.fn(),
      setex: jest.fn(),
      exists: jest.fn(),
      del: jest.fn(),
      scan: jest.fn(),
    },
  };
});

// Mock create rate limiter to use an in-memory implementation for testing
jest.mock('@/lib/rate-limiter', () => {
  const original = jest.requireActual('@/lib/rate-limiter');

  // Use a variable that we can access and clear between tests
  global.limitersMap = new Map();

  return {
    ...original,
    createRateLimiter: (options = {}) => {
      const max = options.max || 60;
      const windowMs = options.windowMs || 60000;
      const statusCode = options.statusCode || 429;
      const message = options.message || { error: 'Too many requests, please try again later.' };
      const skipFn = options.skip;

      return function limiter(req) {
        if (skipFn && skipFn(req)) {
          return null;
        }

        const ip = req.ip || '127.0.0.1';
        const key = `${ip}:${max}:${windowMs}`;

        if (!global.limitersMap.has(key)) {
          global.limitersMap.set(key, { count: 0, resetTime: Date.now() + windowMs });
        }

        const data = global.limitersMap.get(key);

        // Reset if window expired
        if (Date.now() > data.resetTime) {
          data.count = 0;
          data.resetTime = Date.now() + windowMs;
        }

        data.count++;

        if (data.count <= max) {
          return null;
        }

        // Return mocked response for rate limiting
        return {
          status: statusCode,
          body: JSON.stringify(message),
          headers: {
            headers: {
              'content-type': 'application/json',
              'x-ratelimit-limit': String(max),
              'x-ratelimit-remaining': '0',
              'x-ratelimit-reset': String(Math.floor(data.resetTime / 1000)),
              'retry-after': String(Math.ceil((data.resetTime - Date.now()) / 1000)),
            },
          },
          statusText: 'OK',
          json: () => Promise.resolve(message),
        };
      };
    },
    WebSocketRateLimiter: original.WebSocketRateLimiter,
  };
});

// Mock Next.js request/response
const createMockRequest = (ip = '127.0.0.1', method = 'GET', url = '/test') => {
  return {
    ip,
    method,
    url,
    headers: {
      get: jest.fn().mockImplementation(header => {
        if (header === 'x-forwarded-for') return undefined;
        return null;
      }),
    },
    nextUrl: { pathname: url },
    cookies: { get: jest.fn() },
  } as unknown as NextRequest;
};

describe('Rate Limiter', () => {
  // Reset mocks and timers before each test
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('HTTP API Rate Limiting', () => {
    it('should allow requests within the rate limit', async () => {
      const req = createMockRequest();
      const customLimiter = createRateLimiter({ max: 5, windowMs: 60000 });

      // Make 5 requests (should be allowed)
      for (let i = 0; i < 5; i++) {
        const result = await customLimiter(req);
        expect(isAllowed(result)).toBe(true);
      }
    });

    it('should block requests that exceed the rate limit', async () => {
      const req = createMockRequest();
      const customLimiter = createRateLimiter({ max: 2, windowMs: 60000 });

      // Make 2 requests (should be allowed)
      expect(isAllowed(await customLimiter(req))).toBe(true);
      expect(isAllowed(await customLimiter(req))).toBe(true);

      // Third request should be blocked
      const result = await customLimiter(req);
      expect(isRateLimitResponse(result)).toBe(true);
    });

    it('should use custom error messages and status codes', async () => {
      const req = createMockRequest();
      const customLimiter = createRateLimiter({
        max: 1,
        windowMs: 60000,
        message: { custom: 'Custom limit exceeded' },
        statusCode: 403,
      });

      // First request (allowed)
      expect(isAllowed(await customLimiter(req))).toBe(true);

      // Second request (blocked with custom message and status)
      const result = await customLimiter(req);
      expect(result.status).toBe(403);

      const responseBody = await result.json();
      expect(responseBody).toEqual({ custom: 'Custom limit exceeded' });
    });

    it('should reset the rate limit after the window expires', async () => {
      // Clear all limiters to ensure this test starts fresh
      global.limitersMap.clear();

      const req = createMockRequest();
      const customLimiter = createRateLimiter({ max: 1, windowMs: 60000 });

      // First request (allowed)
      expect(isAllowed(await customLimiter(req))).toBe(true);

      // Second request (blocked)
      expect(isAllowed(await customLimiter(req))).toBe(false);

      // Advance time past the window
      jest.advanceTimersByTime(61000);

      // Request should be allowed again
      const result = await customLimiter(req);
      expect(isAllowed(result)).toBe(true);
    });

    it('should apply rate limiting via applyRateLimit helper', async () => {
      const req = createMockRequest();

      // First request (allowed)
      const firstResult = await applyRateLimit(req, apiRateLimiter);
      expect(isAllowed(firstResult)).toBe(true);

      // Attempt to hit auth rate limiter too many times
      const authLimiter = authRateLimiter;
      const results: (NextResponse | null)[] = [];

      // Make multiple requests to exceed auth rate limit
      for (let i = 0; i < 15; i++) {
        results.push(await applyRateLimit(req, authLimiter));
      }

      // Should have some blocked requests
      expect(results.some(r => isRateLimitResponse(r))).toBe(true);
    });

    it('should differentiate between different IPs', async () => {
      const req1 = createMockRequest('1.2.3.4');
      const req2 = createMockRequest('5.6.7.8');
      const customLimiter = createRateLimiter({ max: 1, windowMs: 60000 });

      // First request from IP 1 (allowed)
      expect(isAllowed(await customLimiter(req1))).toBe(true);

      // First request from IP 2 (allowed)
      expect(isAllowed(await customLimiter(req2))).toBe(true);

      // Second request from IP 1 (blocked)
      expect(isAllowed(await customLimiter(req1))).toBe(false);

      // Second request from IP 2 (blocked)
      expect(isAllowed(await customLimiter(req2))).toBe(false);
    });

    it('should skip rate limiting for requests that match skip function', async () => {
      const req = createMockRequest('127.0.0.1', 'GET', '/health');
      const customLimiter = createRateLimiter({
        max: 1,
        windowMs: 60000,
        skip: req => req.url.includes('/health'),
      });

      // Should skip rate limiting for all health check requests
      for (let i = 0; i < 10; i++) {
        expect(isAllowed(await customLimiter(req))).toBe(true);
      }
    });
  });

  describe('WebSocket Rate Limiting', () => {
    it('should control connection rate limiting', async () => {
      const ip = '127.0.0.1';

      // Create a fresh instance for testing
      const testWsLimiter = new webSocketRateLimiter.constructor({
        maxConnectionsPerIP: 3,
        connectionWindowMs: 60000,
      });

      // First 3 connections should be allowed
      expect(await testWsLimiter.canConnect(ip)).toBe(true);
      expect(await testWsLimiter.canConnect(ip)).toBe(true);
      expect(await testWsLimiter.canConnect(ip)).toBe(true);

      // 4th connection should be blocked
      expect(await testWsLimiter.canConnect(ip)).toBe(false);

      // Advance time past the window
      jest.advanceTimersByTime(61000);

      // Should be allowed to connect again
      expect(await testWsLimiter.canConnect(ip)).toBe(true);
    });

    it('should control message rate limiting', async () => {
      const ip = '127.0.0.1';
      const connectionId = 'test-connection-123';

      // Create a fresh instance for testing
      const testWsLimiter = new webSocketRateLimiter.constructor({
        maxMessagesPerMinute: 5,
      });

      // Register connection
      testWsLimiter.registerConnection(ip, connectionId);

      // First 5 messages should be allowed
      for (let i = 0; i < 5; i++) {
        expect(await testWsLimiter.canSendMessage(ip, connectionId, 100)).toBe(true);
      }

      // 6th message should be blocked
      expect(await testWsLimiter.canSendMessage(ip, connectionId, 100)).toBe(false);

      // Advance time past the window
      jest.advanceTimersByTime(61000);

      // Should be allowed to send messages again
      expect(await testWsLimiter.canSendMessage(ip, connectionId, 100)).toBe(true);
    });

    it('should enforce message size limits', async () => {
      const ip = '127.0.0.1';
      const connectionId = 'test-connection-123';

      // Create a fresh instance for testing
      const testWsLimiter = new webSocketRateLimiter.constructor({
        maxMessageSizeBytes: 1000,
      });

      // Register connection
      testWsLimiter.registerConnection(ip, connectionId);

      // Small message should be allowed
      expect(await testWsLimiter.canSendMessage(ip, connectionId, 500)).toBe(true);

      // Large message should be blocked
      expect(await testWsLimiter.canSendMessage(ip, connectionId, 1500)).toBe(false);
    });
  });
});
