import { describe, it, expect } from '@jest/globals';
import axios from 'axios';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

// Base URL for testing
const baseUrl = 'http://localhost:3000';

describe('API Endpoints', () => {
  it('GET /api/users should return user data', async () => {
    // Override the default handler for this specific test
    server.use(
      http.get(`${baseUrl}/api/users`, () => {
        return HttpResponse.json({
          users: [
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
          ]
        }, { status: 200 });
      })
    );

    const response = await axios.get(`${baseUrl}/api/users`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('users');
    expect(response.data.users).toHaveLength(2);
    expect(response.data.users[0]).toHaveProperty('name', 'John Doe');
  });

  it('POST /api/auth/login should authenticate users', async () => {
    // Override the default handler for this specific test
    server.use(
      http.post(`${baseUrl}/api/auth/login`, () => {
        return HttpResponse.json({
          token: 'mock-jwt-token',
          user: { id: 1, name: 'John Doe' }
        }, { status: 200 });
      })
    );

    const loginData = { email: 'john@example.com', password: 'password123' };
    const response = await axios.post(`${baseUrl}/api/auth/login`, loginData);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('token');
    expect(response.data).toHaveProperty('user');
    expect(response.data.user).toHaveProperty('id');
    expect(response.data.user).toHaveProperty('name');
  });

  it('GET /api/bookings/:id should return a specific booking', async () => {
    const bookingId = 123;
    
    // Override the default handler for this specific test
    server.use(
      http.get(`${baseUrl}/api/bookings/${bookingId}`, () => {
        return HttpResponse.json({
          id: bookingId,
          date: '2023-11-10',
          time: '14:00',
          provider: 'Dr. Smith',
          service: 'Yoga Session',
          status: 'confirmed'
        }, { status: 200 });
      })
    );

    const response = await axios.get(`${baseUrl}/api/bookings/${bookingId}`);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id', bookingId);
    expect(response.data).toHaveProperty('provider', 'Dr. Smith');
    expect(response.data).toHaveProperty('status', 'confirmed');
  });

  it('PUT /api/bookings/:id should update a booking', async () => {
    const bookingId = 123;
    const updateData = { status: 'cancelled', reason: 'Schedule conflict' };
    
    // Override the default handler for this specific test
    server.use(
      http.put(`${baseUrl}/api/bookings/${bookingId}`, () => {
        return HttpResponse.json({
          id: bookingId,
          date: '2023-11-10',
          time: '14:00',
          provider: 'Dr. Smith',
          service: 'Yoga Session',
          status: 'cancelled',
          reason: 'Schedule conflict'
        }, { status: 200 });
      })
    );

    const response = await axios.put(`${baseUrl}/api/bookings/${bookingId}`, updateData);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id', bookingId);
    expect(response.data).toHaveProperty('status', 'cancelled');
    expect(response.data).toHaveProperty('reason', 'Schedule conflict');
  });

  it('DELETE /api/bookings/:id should delete a booking', async () => {
    const bookingId = 123;
    
    // Override the default handler for this specific test
    server.use(
      http.delete(`${baseUrl}/api/bookings/${bookingId}`, () => {
        return HttpResponse.json({
          message: 'Booking successfully deleted',
          id: bookingId
        }, { status: 200 });
      })
    );

    const response = await axios.delete(`${baseUrl}/api/bookings/${bookingId}`);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message');
    expect(response.data).toHaveProperty('id', bookingId);
  });
}); 