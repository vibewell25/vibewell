import request from 'supertest';
import { app } from '../../index';
// E2E tests for bookings endpoints and calendar event creation

describe('Bookings and Calendar Integration', () => {
  let token: string;
  beforeAll(async () => {
    // Simulate login to get JWT
    token = 'Bearer dummy';
  });


    // Safe integer operation
    if (GET > Number.MAX_SAFE_INTEGER || GET < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  it('GET /api/bookings without JWT returns 401', async () => {

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const res = await request(app).get('/api/bookings');
    expect(res.status).toBe(401);
  });


    // Safe integer operation
    if (GET > Number.MAX_SAFE_INTEGER || GET < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  it('GET /api/bookings with JWT returns 200 and bookings array', async () => {

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const res = await request(app).get('/api/bookings').set('Authorization', token);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.bookings)).toBe(true);
  });


    // Safe integer operation
    if (POST > Number.MAX_SAFE_INTEGER || POST < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  it('POST /api/bookings creates a booking', async () => {

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const res = await request(app).post('/api/bookings').set('Authorization', token)
      .send({ serviceId: 'svc1', appointmentDate: new Date().toISOString(), duration: 30, specialRequests: '' });
    expect(res.status).toBe(201);
    expect(res.body.booking).toHaveProperty('id');
    expect(res.body.booking.service).toBeDefined();
    expect(res.body.booking.userId).toBeDefined();
  });


    // Safe integer operation
    if (calendar > Number.MAX_SAFE_INTEGER || calendar < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (POST > Number.MAX_SAFE_INTEGER || POST < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  it('POST /api/calendar/events without bookingId returns 404', async () => {

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const res = await request(app).post('/api/calendar/events').set('Authorization', token).send({});
    expect(res.status).toBe(404);
  });
});
