/**
 * Mock server for API tests
 */

// Import from our local mock instead of from msw
import { http, HttpResponse } from '../../__mocks__/msw';
import { setupServer } from '../../__mocks__/msw/node';

// Create a mock server
export const server = setupServer();

// Common API mocks
export const commonHandlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'ok',
      version: '1.0.0',
      environment: 'test',
    });
  }),
  
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();
    
    if (!body.email || !body.password) {
      return HttpResponse.json({ 
        error: 'Email and password are required' 
      }, { status: 400 });
    }
    
    if (body.email === 'user@example.com' && body.password === 'Password123') {
      return HttpResponse.json({
        user: {
          id: 'user-123',
          email: 'user@example.com',
          name: 'Test User',
        },
        token: 'mock-jwt-token',
      });
    }
    
    return HttpResponse.json({ 
      error: 'Invalid credentials' 
    }, { status: 401 });
  }),
  
  http.get('/api/profile', () => {
    return HttpResponse.json({
      id: 'user-123',
      email: 'user@example.com',
      name: 'Test User',
      preferences: {
        theme: 'light',
        notifications: true,
      },
    });
  }),
  
  http.get('/api/services', () => {
    return HttpResponse.json([
      { id: '1', name: 'Service 1', price: 100 },
      { id: '2', name: 'Service 2', price: 200 },
      { id: '3', name: 'Service 3', price: 300 }
    ]);
  }),
  
  http.post('/api/booking', async ({ request }) => {
    const body = await request.json();
    
    if (!body.serviceId || !body.date) {
      return new HttpResponse(null, {
        status: 400,
        statusText: 'Bad Request'
      });
    }
    
    return HttpResponse.json({
      id: '123',
      serviceId: body.serviceId,
      date: body.date,
      status: 'confirmed'
    });
  })
];

// Setup utilities
export function setupApiMocks() {
  // Start the server and apply common handlers
  beforeAll(() => {
    server.use(...commonHandlers);
    server.listen({ onUnhandledRequest: 'bypass' });
  });
  
  // Reset handlers after each test
  afterEach(() => {
    server.resetHandlers();
  });
  
  // Clean up after all tests
  afterAll(() => {
    server.close();
  });
} 