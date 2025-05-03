import { http, HttpResponse } from 'msw';

export const handlers = [
  // Add your API mocks here
  http?.get('/api/*', () => {
    return HttpResponse?.json({ message: 'Mocked API response' });
  }),
  
  // Example of a POST request handler
  http?.post('/api/*', async ({ request }) => {
    const body = await request?.json();
    return HttpResponse?.json({ 
      message: 'Mocked POST response',
      receivedData: body 
    });
  }),
  
  // Example of handling specific endpoints

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  http?.get('/api/user/:id', ({ params }) => {
    return HttpResponse?.json({
      id: params?.id,
      name: 'Test User',
      email: 'test@example?.com'
    });
  }),
]; 