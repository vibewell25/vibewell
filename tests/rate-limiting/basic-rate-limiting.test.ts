/**
 * Rate Limiting Tests
 * 
 * This test suite verifies that rate limiting is properly implemented
 * in both in-memory and Redis modes, and tests fallback behavior.
 */
import axios from 'axios';
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { createServer } from 'http';
import { apiRateLimiter, authRateLimiter } from '@/app/api/auth/rate-limit-middleware';
import { NextRequest, NextResponse } from 'next/server';
import redisClient from '@/lib/redis-client';

const TEST_PORT = 3333;
const TEST_URL = `http://localhost:${TEST_PORT}`;

// Mock server to test rate limiting
let server: any;

// Helper function to create a mock Next.js request
const createMockRequest = (ip: string, path: string): NextRequest => {
  const headers = new Headers();
  headers.set('x-forwarded-for', ip);
  
  return {
    ip,
    headers,
    nextUrl: { pathname: path },
    method: 'GET',
  } as unknown as NextRequest;
};

describe('Rate Limiting Tests', () => {
  beforeAll(() => {
    // Start a test server
    server = createServer((req, res) => {
      res.writeHead(200);
      res.end('OK');
    }).listen(TEST_PORT);
  });

  afterAll(() => {
    // Close the test server
    server.close();
  });

  describe('In-Memory Rate Limiting', () => {
    it('should allow requests within the rate limit', async () => {
      const testIp = '192.168.1.1';
      const mockReq = createMockRequest(testIp, '/api/test');
      
      // Make requests within limit
      for (let i = 0; i < 60; i++) {
        const result = await apiRateLimiter(mockReq);
        expect(result).toBeNull(); // Null means request is allowed
      }
    });

    it('should block requests exceeding the rate limit', async () => {
      const testIp = '192.168.1.2';
      const mockReq = createMockRequest(testIp, '/api/test');
      
      // Make requests within limit first
      for (let i = 0; i < 60; i++) {
        await apiRateLimiter(mockReq);
      }
      
      // Next request should be blocked
      const result = await apiRateLimiter(mockReq);
      expect(result).not.toBeNull();
      expect(result?.status).toBe(429);
    });

    it('should apply stricter limits for auth endpoints', async () => {
      const testIp = '192.168.1.3';
      const mockReq = createMockRequest(testIp, '/api/auth/login');
      
      // Make requests within auth limit
      for (let i = 0; i < 10; i++) {
        const result = await authRateLimiter(mockReq);
        expect(result).toBeNull();
      }
      
      // Next request should be blocked
      const result = await authRateLimiter(mockReq);
      expect(result).not.toBeNull();
      expect(result?.status).toBe(429);
    });
  });

  describe('Redis Rate Limiting', () => {
    // Mock process.env for testing
    const originalEnv = process.env;
    
    beforeAll(() => {
      process.env.NODE_ENV = 'production';
      process.env.REDIS_URL = 'redis://localhost:6379';
    });
    
    afterAll(() => {
      process.env = originalEnv;
    });
    
    it('should connect to Redis successfully', async () => {
      // Test Redis connection
      const pingResult = await redisClient.set('test-key', 'test-value');
      expect(pingResult).toBe('OK');
      
      const getValue = await redisClient.get('test-key');
      expect(getValue).toBe('test-value');
      
      // Clean up
      await redisClient.del('test-key');
    });
    
    it('should handle Redis failures gracefully', async () => {
      // Mock Redis failure
      const originalGet = redisClient.get;
      redisClient.get = jest.fn().mockRejectedValue(new Error('Redis connection error'));
      
      const testIp = '192.168.1.4';
      const mockReq = createMockRequest(testIp, '/api/test');
      
      // Should fall back to in-memory rate limiting
      const result = await apiRateLimiter(mockReq);
      expect(result).toBeNull(); // Request should be allowed
      
      // Restore Redis functionality
      redisClient.get = originalGet;
    });
  });
  
  describe('API Endpoint Rate Limiting', () => {
    it('should rate limit the login endpoint', async () => {
      // Make multiple requests to test rate limiting
      const requests = Array(15).fill(null).map(() => 
        axios.post(`${TEST_URL}/api/auth/login`, {
          email: 'test@example.com',
          password: 'password123'
        }).catch(err => err.response)
      );
      
      const responses = await Promise.all(requests);
      
      // Some of the later requests should be rate limited (429)
      const rateLimitedResponses = responses.filter(r => r && r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
    
    it('should apply stricter rate limits for password reset', async () => {
      // Make multiple requests to test rate limiting
      const requests = Array(5).fill(null).map(() => 
        axios.post(`${TEST_URL}/api/auth/password-reset`, {
          email: 'test@example.com'
        }).catch(err => err.response)
      );
      
      const responses = await Promise.all(requests);
      
      // Some of the later requests should be rate limited (429)
      const rateLimitedResponses = responses.filter(r => r && r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
}); 