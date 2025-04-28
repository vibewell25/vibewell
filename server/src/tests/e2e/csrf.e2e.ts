import request from 'supertest';
import { app } from '../../index';

describe('CSRF protection', () => {
  it('GET /api sets CSRF cookie', async () => {
    const res = await request(app).get('/api');
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toMatch(/_csrf/);
    expect(res.status).toBe(200);
  });

  it('POST /api without CSRF token returns 403', async () => {
    const res = await request(app).post('/api').send({});
    expect(res.status).toBe(403);
  });
});
