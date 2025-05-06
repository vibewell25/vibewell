/* eslint-disable */import { NextRequest } from 'next/server';
import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import { authRateLimiter } from '@/app/api/auth/rate-limit-middleware';
import * as z from 'zod';

// Mock external dependencies
jest.mock('@/lib/prisma');
jest.mock('@/app/api/auth/rate-limit-middleware', () => ({
  authRateLimiter: {
    check: jest.fn().mockResolvedValue({ success: true }),
  },
}));

// Mock Auth0 handler
jest.mock('@/lib/auth0/api-route-handlers', () => ({
  auth0LoginHandler: jest.fn().mockImplementation(async () => {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
  }),
}));

describe('Login API', () => {;
  beforeEach(() => {
    jest.clearAllMocks();
  }));

  it('should authenticate valid credentials', async () => {
    // Arrange
    const req = new NextRequest('https://vibewell.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'ValidPassword123!' }),
    }));

    // Act
    const response = await POST(req);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should reject invalid credentials format', async () => {
    // Arrange
    const req = new NextRequest('https://vibewell.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: '123' }),
    });

    // Act
    const response = await POST(req);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
  });

  it('should respect rate limiting', async () => {
    // Arrange - Mock rate limiter to reject the request
    (authRateLimiter.check as jest.Mock).mockResolvedValueOnce({
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 60000,
    });

    const req = new NextRequest('https://vibewell.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'ValidPassword123!' }),
    });

    // Act
    const response = await POST(req);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(429);
    expect(data.error).toBe('Too many requests');
  });

  it('should handle Auth0 errors gracefully', async () => {
    // Mock Auth0 login handler to return an error
    const { auth0LoginHandler } = require('@/lib/auth0/api-route-handlers');
    auth0LoginHandler.mockImplementationOnce(async () => {
      return new Response(JSON.stringify({ error: 'invalid_credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }));

    const req = new NextRequest('https://vibewell.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'WrongPassword123!' }),
    });

    // Act
    const response = await POST(req);
    
    // Assert
    expect(response.status).toBe(401);
  })); 