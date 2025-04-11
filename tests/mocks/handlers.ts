import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000';

export const handlers = [
  // Mock login page
  http.get(`${BASE_URL}/login`, () => {
    return new HttpResponse(
      '<!DOCTYPE html><html><body><h1>Login Page</h1></body></html>',
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }),

  // Mock services page
  http.get(`${BASE_URL}/services`, () => {
    return new HttpResponse(
      '<!DOCTYPE html><html><body><h1>Services Page</h1></body></html>',
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }),

  // Mock API providers endpoint
  http.get(`${BASE_URL}/api/providers`, () => {
    return HttpResponse.json(
      {
        providers: [
          { id: 1, name: 'Dr. Smith', specialty: 'Yoga' },
          { id: 2, name: 'Dr. Johnson', specialty: 'Meditation' },
          { id: 3, name: 'Dr. Williams', specialty: 'Nutrition' }
        ]
      },
      { status: 200 }
    );
  }),

  // Mock API bookings endpoint
  http.get(`${BASE_URL}/api/bookings`, () => {
    return HttpResponse.json(
      {
        bookings: [
          { id: 1, date: '2023-11-01', provider: 'Dr. Smith', service: 'Yoga Session' },
          { id: 2, date: '2023-11-05', provider: 'Dr. Johnson', service: 'Meditation Class' }
        ]
      },
      { status: 200 }
    );
  }),

  // Mock API booking creation endpoint
  http.post(`${BASE_URL}/api/bookings`, () => {
    return HttpResponse.json(
      {
        id: 3,
        message: 'Booking created successfully'
      },
      { status: 201 }
    );
  }),

  // Fallback for unhandled requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled request: ${request.method} ${request.url.toString()}`);
    return HttpResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  })
]; 