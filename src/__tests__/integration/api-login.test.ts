/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping *//// <reference types="jest" />

// Add type declaration for toHaveProperty matcher
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveProperty(property: string, value?: any): R;
    }
  }
}

import { NextRequest, NextResponse } from 'next/server';
// Import the POST function properly with type information
import { POST } from '@/app/api/auth/login/route';
import { expect } from '@jest/globals';

// Mock the dependencies
jest.mock('next/headers', () => ({
  cookies: () => ({
    getAll: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
  }),
}));

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
    },
  })),
}));

jest.mock('@/app/api/auth/rate-limit-middleware', () => ({
  authRateLimiter: {},
  applyRateLimit: jest.fn().mockResolvedValue(null), // No rate limit by default
}));

describe('Login API Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 400 for invalid email', async () => {
    // Create a sample request with invalid email
    const req = new NextRequest('https://vibewell.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'password123',
      }),
    });

    // Execute the handler
    const response = await POST(req);
    const data = await response.json();

    // Verify error response
    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error', 'Invalid request data');
    expect(data).toHaveProperty('details.email');
  });

  test('should return 400 for short password', async () => {
    // Create a sample request with short password
    const req = new NextRequest('https://vibewell.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'valid@example.com',
        password: '12345', // Too short
      }),
    });

    // Execute the handler
    const response = await POST(req);
    const data = await response.json();

    // Verify error response
    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error', 'Invalid request data');
    expect(data).toHaveProperty('details.password');
  });

  test('should return 401 for invalid credentials', async () => {
    // Setup mock to return an error
    const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs');
    createRouteHandlerClient.mockReturnValue({
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({
          data: {},
          error: { message: 'Invalid login credentials' },
        }),
      },
    });

    // Create a sample request with valid format but invalid credentials
    const req = new NextRequest('https://vibewell.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
      }),
    });

    // Execute the handler
    const response = await POST(req);
    const data = await response.json();

    // Verify error response
    expect(response.status).toBe(401);
    expect(data).toHaveProperty('error', 'Invalid credentials');
  });

  test('should return 429 when rate limit is exceeded', async () => {
    // Setup rate limit middleware to return a rate limit response
    const { applyRateLimit } = require('@/app/api/auth/rate-limit-middleware');
    applyRateLimit.mockResolvedValue(
      NextResponse.json(
        { error: 'Too many requests', retryAfter: 60 },
        { status: 429, headers: { 'Retry-After': '60' } },
      ),
    );

    // Create a sample request
    const req = new NextRequest('https://vibewell.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
      }),
    });

    // Execute the handler
    const response = await POST(req);
    const data = await response.json();

    // Verify rate limit response
    expect(response.status).toBe(429);
    expect(data).toHaveProperty('error', 'Too many requests');
    expect(data).toHaveProperty('retryAfter', 60);
    expect(response.headers.get('Retry-After')).toBe('60');
  });

  test('should return 200 and user data for successful login', async () => {
    // Setup mock to return success
    const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs');
    createRouteHandlerClient.mockReturnValue({
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: 'user-123',
              email: 'user@example.com',
              user_metadata: { role: 'customer' },
            },
          },
          error: null,
        }),
      },
    });

    // Create a sample request with valid credentials
    const req = new NextRequest('https://vibewell.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
      }),
    });

    // Execute the handler
    const response = await POST(req);
    const data = await response.json();

    // Verify success response
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('user.id', 'user-123');
    expect(data).toHaveProperty('user.email', 'user@example.com');
    expect(data).toHaveProperty('user.role', 'customer');
  });

  test('should return 500 when an unexpected error occurs', async () => {
    // Setup mock to throw an error
    const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs');
    createRouteHandlerClient.mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    // Create a sample request
    const req = new NextRequest('https://vibewell.com/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
      }),
    });

    // Execute the handler
    const response = await POST(req);
    const data = await response.json();

    // Verify error response
    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error', 'Internal server error');
  });
});
