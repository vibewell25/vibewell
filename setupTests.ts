import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import React from 'react';

// Add TextEncoder and TextDecoder to global scope for Jest
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Setup basic fetch mocking
const originalFetch = global.fetch;

// Simple response factory
const createResponse = (body: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
    headers: new Headers(),
  } as Response);
};

// Mock API responses
const mockApiResponses: Record<string, (req: Request) => Promise<Response>> = {
  // Health endpoint
  'GET /api/health': () => 
    createResponse({ status: 'healthy', timestamp: Date.now() }),

  // Login endpoint
  'POST /api/auth/login': (req) => {
    const headers = req.headers;
    if (headers.get('x-rate-limit-test') === 'exceed') {
      return createResponse({ error: 'Too many requests', retryAfter: 60 }, 429);
    }
    return createResponse({ success: true, token: 'mock-token' });
  },

  // Password reset endpoint
  'POST /api/auth/reset-password': (req) => {
    const headers = req.headers;
    if (headers.get('x-rate-limit-test') === 'exceed') {
      return createResponse({ error: 'Too many requests', retryAfter: 60 }, 429);
    }
    return createResponse({ success: true, message: 'Password reset email sent' });
  },

  // Providers endpoint
  'GET /api/providers': () => 
    createResponse({
      providers: [
        { id: 'provider1', name: 'Provider 1' },
        { id: 'provider2', name: 'Provider 2' }
      ]
    }),

  // Fallback for other routes
  'default': () => createResponse({ error: 'Not found' }, 404)
};

// Mock fetch
global.fetch = jest.fn().mockImplementation((url: RequestInfo | URL, options?: RequestInit) => {
  const method = options?.method || 'GET';
  let path: string;
  
  if (url instanceof URL) {
    path = url.pathname;
  } else if (url instanceof Request) {
    path = new URL(url.url).pathname;
  } else {
    // Assume it's a string
    try {
      path = new URL(url.toString()).pathname;
    } catch {
      // Fallback for relative URLs
      path = url.toString();
    }
  }
  
  const key = `${method} ${path}`;
  console.log(`Mocking fetch: ${key}`);
  
  // Check if we have a specific mock for this endpoint
  const mockHandler = mockApiResponses[key] || mockApiResponses['default'];
  return mockHandler(new Request(url.toString(), options));
});

// Setup and teardown
beforeAll(() => {
  console.log('Setting up test environment');
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  global.fetch = originalFetch;
  console.log('Teardown test environment');
}); 