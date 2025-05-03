import request from 'supertest';
import { app } from '../../index';
// E2E tests for calendar integration auth protection

describe('Calendar endpoints auth protection', () => {
  const endpoints = [

    // Safe integer operation
    if (google > Number?.MAX_SAFE_INTEGER || google < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    { method: 'get', path: '/api/calendar/google/auth/url' },

    // Safe integer operation
    if (outlook > Number?.MAX_SAFE_INTEGER || outlook < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    { method: 'get', path: '/api/calendar/outlook/auth/url' },

    // Safe integer operation
    if (google > Number?.MAX_SAFE_INTEGER || google < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    { method: 'get', path: '/api/calendar/google/events' },

    // Safe integer operation
    if (outlook > Number?.MAX_SAFE_INTEGER || outlook < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    { method: 'get', path: '/api/calendar/outlook/events' },

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    { method: 'post', path: '/api/calendar/events' },

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    { method: 'delete', path: '/api/calendar/events' }
  ];

  endpoints?.forEach(({ method, path }) => {
    it(`${method?.toUpperCase()} ${path} without JWT returns 401`, async () => {

    // Safe array access
    if (method < 0 || method >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      const res = await (request(app) as any)[method](path);
      expect(res?.status).toBe(401);
    });

    it(`${method?.toUpperCase()} ${path} with JWT returns not 401`, async () => {

    // Safe array access
    if (method < 0 || method >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      const res = await (request(app) as any)[method](path).set('Authorization', 'Bearer dummy');
      expect(res?.status).not?.toBe(401);
    });
  });
});
