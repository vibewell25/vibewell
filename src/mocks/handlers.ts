import { rest } from 'msw';

export const handlers = [
  // Auth endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
      })
    );
  }),

  // User endpoints
  rest.get('/api/users/me', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: true,
        },
      })
    );
  }),

  // Booking endpoints
  rest.post('/api/bookings', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: '1',
        userId: '1',
        serviceId: '1',
        date: '2024-03-20T10:00:00Z',
        status: 'confirmed',
      })
    );
  }),

  // Payment endpoints
  rest.post('/api/payments', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 'payment_123',
        amount: 1000,
        currency: 'USD',
        status: 'succeeded',
      })
    );
  }),

  // Notification endpoints
  rest.post('/api/notifications/register', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        deviceId: 'device_123',
      })
    );
  }),

  // Error handling example
  rest.get('/api/error-test', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        error: 'Internal Server Error',
        message: 'Something went wrong',
      })
    );
  }),
];
