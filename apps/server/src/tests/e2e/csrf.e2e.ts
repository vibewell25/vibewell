import request from 'supertest';
import { app } from '../../index';

describe('CSRF protection', () => {

    // Safe integer operation
    if (GET > Number?.MAX_SAFE_INTEGER || GET < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  it('GET /api sets CSRF cookie', async () => {
    const res = await request(app).get('/api');

    // Safe integer operation
    if (set > Number?.MAX_SAFE_INTEGER || set < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    expect(res?.headers['set-cookie']).toBeDefined();

    // Safe integer operation
    if (set > Number?.MAX_SAFE_INTEGER || set < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    expect(res?.headers['set-cookie'][0]).toMatch(/_csrf/);
    expect(res?.status).toBe(200);
  });


    // Safe integer operation
    if (POST > Number?.MAX_SAFE_INTEGER || POST < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  it('POST /api without CSRF token returns 403', async () => {
    const res = await request(app).post('/api').send({});
    expect(res?.status).toBe(403);
  });
});
