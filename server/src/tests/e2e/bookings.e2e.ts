import request from 'supertest';
import { app } from '../../index';
// E2E tests for bookings endpoints and calendar event creation

describe('Bookings and Calendar Integration', () => {
  let token: string;
  beforeAll(async () => {
    // Simulate login to get JWT
    token = 'Bearer dummy';
  });

  it('GET /api/bookings without JWT returns 401', async () => {
    const res = await request(app).get('/api/bookings');
    expect(res.status).toBe(401);
  });

  it('GET /api/bookings with JWT returns 200 and bookings array', async () => {
    const res = await request(app).get('/api/bookings').set('Authorization', token);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.bookings)).toBe(true);
  });

  it('POST /api/bookings creates a booking', async () => {
    const res = await request(app).post('/api/bookings').set('Authorization', token)
      .send({ serviceId: 'svc1', appointmentDate: new Date().toISOString(), duration: 30, specialRequests: '' });
    expect(res.status).toBe(201);
    expect(res.body.booking).toHaveProperty('id');
    expect(res.body.booking.service).toBeDefined();
    expect(res.body.booking.userId).toBeDefined();
  });

  it('POST /api/calendar/events without bookingId returns 404', async () => {
    const res = await request(app).post('/api/calendar/events').set('Authorization', token).send({});
    expect(res.status).toBe(404);
  });
});
