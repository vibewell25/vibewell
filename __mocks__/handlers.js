/**
 * Default MSW handlers for mocking API requests
 * Add common API endpoints here for testing
 */
const { http, HttpResponse } = require('msw');

// Define handlers for common API endpoints
const handlers = [
  // Health check endpoint
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),

  // Authentication endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      },
      token: 'mock-jwt-token',
    });
  }),

  http.post('/api/auth/signup', () => {
    return HttpResponse.json({
      user: {
        id: 'new-user-id',
        email: 'new@example.com',
        name: 'New User',
      },
      token: 'mock-jwt-token',
    });
  }),

  http.post('/api/auth/logout', () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // User profile endpoints
  http.get('/api/user/profile', () => {
    return HttpResponse.json({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      profile: {
        bio: 'Test bio',
        avatar: 'https://example.com/avatar.png',
      },
    });
  }),

  http.put('/api/user/profile', () => {
    return HttpResponse.json({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Updated Name',
      profile: {
        bio: 'Updated bio',
        avatar: 'https://example.com/new-avatar.png',
      },
    });
  }),

  // Add more handlers as needed
];

module.exports = handlers; 