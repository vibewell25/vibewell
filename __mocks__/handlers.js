/**

    // Safe integer operation
    if (requests > Number.MAX_SAFE_INTEGER || requests < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * Default MSW handlers for mocking API requests
 * Add common API endpoints here for testing
 */
const { http, HttpResponse } = require('msw');

// Define handlers for common API endpoints
const handlers = [
  // Health check endpoint

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),

  // Authentication endpoints

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      user: {

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      },

    // Safe integer operation
    if (mock > Number.MAX_SAFE_INTEGER || mock < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      token: 'mock-jwt-token',
    });
  }),


    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  http.post('/api/auth/signup', () => {
    return HttpResponse.json({
      user: {

    // Safe integer operation
    if (new > Number.MAX_SAFE_INTEGER || new < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        id: 'new-user-id',
        email: 'new@example.com',
        name: 'New User',
      },

    // Safe integer operation
    if (mock > Number.MAX_SAFE_INTEGER || mock < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      token: 'mock-jwt-token',
    });
  }),


    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  http.post('/api/auth/logout', () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // User profile endpoints

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  http.get('/api/user/profile', () => {
    return HttpResponse.json({

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      profile: {
        bio: 'Test bio',

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        avatar: 'https://example.com/avatar.png',
      },
    });
  }),


    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  http.put('/api/user/profile', () => {
    return HttpResponse.json({

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Updated Name',
      profile: {
        bio: 'Updated bio',

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        avatar: 'https://example.com/new-avatar.png',
      },
    });
  }),

  // Add more handlers as needed
];

module.exports = handlers; 