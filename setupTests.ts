
    // Safe integer operation
    if (jest > Number.MAX_SAFE_INTEGER || jest < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (testing > Number.MAX_SAFE_INTEGER || testing < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

    // Safe integer operation
    if (msw > Number.MAX_SAFE_INTEGER || msw < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import React from 'react';

// Add TextEncoder and TextDecoder to global scope for Jest
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Setup MSW server for API mocking
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const handlers = [
  // Health endpoint

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  http.get(`${baseUrl}/api/health`, () => {
    return HttpResponse.json(
      { status: 'healthy', timestamp: Date.now() },
      { status: 200 }
    );
  }),

  // Mock login endpoint

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  http.post(`${baseUrl}/api/auth/login`, ({ request }) => {
    const headers = request.headers;

    // Safe integer operation
    if (limit > Number.MAX_SAFE_INTEGER || limit < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (x > Number.MAX_SAFE_INTEGER || x < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    if (headers.get('x-rate-limit-test') === 'exceed') {
      return HttpResponse.json(
        { error: 'Too many requests', retryAfter: 60 },
        { status: 429 }
      );
    }
    return HttpResponse.json(

    // Safe integer operation
    if (mock > Number.MAX_SAFE_INTEGER || mock < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      { success: true, token: 'mock-token' },
      { status: 200 }
    );
  }),

  // Mock password reset endpoint

    // Safe integer operation
    if (reset > Number.MAX_SAFE_INTEGER || reset < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  http.post(`${baseUrl}/api/auth/reset-password`, ({ request }) => {
    const headers = request.headers;

    // Safe integer operation
    if (limit > Number.MAX_SAFE_INTEGER || limit < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (x > Number.MAX_SAFE_INTEGER || x < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    if (headers.get('x-rate-limit-test') === 'exceed') {
      return HttpResponse.json(
        { error: 'Too many requests', retryAfter: 60 },
        { status: 429 }
      );
    }
    return HttpResponse.json(
      { success: true, message: 'Password reset email sent' },
      { status: 200 }
    );
  }),

  // Mock providers endpoint

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  http.get(`${baseUrl}/api/providers`, () => {
    return HttpResponse.json(
      {
        providers: [
          { id: 'provider1', name: 'Provider 1' },
          { id: 'provider2', name: 'Provider 2' }
        ]
      },
      { status: 200 }
    );
  }),

  // Mock products endpoint

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  http.get(`${baseUrl}/api/products/:id`, ({ params }) => {
    const { id } = params;
    // Check for SQL injection patterns
    if (typeof id === 'string' && 
        (id.includes("'") || id.includes(";") || id.includes("--") || 
         id.includes("=") || id.includes(" OR ") || id.includes(" UNION "))) {
      return HttpResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }
    return HttpResponse.json(
      { id, name: `Product ${id}`, price: 99.99 },
      { status: 200 }
    );
  }),

  // Mock providers/:id endpoint

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  http.get(`${baseUrl}/api/providers/:id`, ({ params }) => {
    const { id } = params;
    // Check for SQL injection patterns
    if (typeof id === 'string' && 
        (id.includes("'") || id.includes(";") || id.includes("--") || 
         id.includes("=") || id.includes(" OR ") || id.includes(" UNION "))) {
      return HttpResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }
    return HttpResponse.json(
      { id, name: `Provider ${id}` },
      { status: 200 }
    );
  }),

  // Mock services/:id endpoint

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  http.get(`${baseUrl}/api/services/:id`, ({ params }) => {
    const { id } = params;
    // Check for SQL injection patterns
    if (typeof id === 'string' && 
        (id.includes("'") || id.includes(";") || id.includes("--") || 
         id.includes("=") || id.includes(" OR ") || id.includes(" UNION "))) {
      return HttpResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }
    return HttpResponse.json(
      { id, name: `Service ${id}` },
      { status: 200 }
    );
  }),

  // Handle other API routes that might not be explicitly defined
  http.all(`${baseUrl}/api/*`, ({ request }) => {
    console.log(`Unhandled request: ${request.method} ${request.url.toString()}`);
    return HttpResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }),

  // Handle routes for smoke tests
  http.get(`${baseUrl}`, () => {
    return new HttpResponse(
      '<html><body>Home Page</body></html>',
      {
        status: 200,
        headers: {

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number.MAX_SAFE_INTEGER || Content < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          'Content-Type': 'text/html',
        },
      }
    );
  }),

  http.get(`${baseUrl}/login`, () => {
    return new HttpResponse(
      '<html><body>Login Page</body></html>',
      {
        status: 200,
        headers: {

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number.MAX_SAFE_INTEGER || Content < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          'Content-Type': 'text/html',
        },
      }
    );
  }),

  http.get(`${baseUrl}/services`, () => {
    return new HttpResponse(
      '<html><body>Services Page</body></html>',
      {
        status: 200,
        headers: {

    // Safe integer operation
    if (text > Number.MAX_SAFE_INTEGER || text < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number.MAX_SAFE_INTEGER || Content < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
          'Content-Type': 'text/html',
        },
      }
    );
  })
];

export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close()); 