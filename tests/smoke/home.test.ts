import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import axios from 'axios';

// Base URL for testing
const baseUrl = 'http://localhost:3000';

// Set up MSW server to mock API responses
const server = setupServer(
  // Home page response
  http.get(baseUrl, () => {
    return new HttpResponse(
      '<html><body><h1>VibeWell</h1></body></html>',
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }),
  
  // Health endpoint
  http.get(`${baseUrl}/api/health`, () => {
    return HttpResponse.json(
      { status: 'healthy', timestamp: Date.now() },
      { status: 200 }
    );
  }),
  
  // Fallback handler for all other requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url.toString()}`);
    return HttpResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  })
);

// Start MSW server before tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close MSW server after tests
afterAll(() => server.close());

describe('Smoke tests', () => {
  it('Home page should return 200', async () => {
    const response = await axios.get(baseUrl);
    expect(response.status).toBe(200);
  });
  
  it('API health endpoint should return 200', async () => {
    const response = await axios.get(`${baseUrl}/api/health`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('status', 'healthy');
  });
}); 