import { http, HttpResponse } from 'msw';

export const handlers = [
  // Add your API mocks here
  http.get('/api/*', () => {
    return HttpResponse.json({ message: 'Mocked API response' });
  }),
  
  // Example of a POST request handler
  http.post('/api/*', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ 
      message: 'Mocked POST response',
      receivedData: body 
    });
  }),
  
  // Example of handling specific endpoints
  http.get('/api/user/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Test User',
      email: 'test@example.com'
    });
  }),
]; 