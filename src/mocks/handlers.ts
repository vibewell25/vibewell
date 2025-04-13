import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();
    if (body.email === 'user@example.com' && body.password === 'password') {
      return HttpResponse.json({
        success: true,
        user: {
          id: 'user-123',
          email: 'user@example.com',
          name: 'Test User'
        }
      });
    }
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // User endpoints
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Test User',
      email: 'user@example.com'
    });
  }),

  // Appointments endpoints
  http.get('/api/appointments', () => {
    return HttpResponse.json([
      {
        id: 'apt-1',
        date: '2024-03-20',
        service: 'Haircut',
        status: 'confirmed'
      }
    ]);
  }),

  // Performance metrics endpoint
  http.post('/api/metrics', async () => {
    return HttpResponse.json({ success: true });
  }),

  // Fallback handler
  http.get('*', ({ request }) => {
    console.warn(`Unhandled GET request to ${request.url}`);
    return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
  }),

  http.post('*', ({ request }) => {
    console.warn(`Unhandled POST request to ${request.url}`);
    return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
  })
]; 