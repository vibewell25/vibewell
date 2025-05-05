import request from 'supertest';
import { app } from '../../index';
// E2E tests for calendar integration auth protection

describe('Calendar endpoints auth protection', () => {
  const endpoints = [

    { method: 'get', path: '/api/calendar/google/auth/url' },

    { method: 'get', path: '/api/calendar/outlook/auth/url' },

    { method: 'get', path: '/api/calendar/google/events' },

    { method: 'get', path: '/api/calendar/outlook/events' },

    { method: 'post', path: '/api/calendar/events' },

    { method: 'delete', path: '/api/calendar/events' }
  ];

  endpoints.forEach(({ method, path }) => {
    it(`${method.toUpperCase()} ${path} without JWT returns 401`, async () => {

    const res = await (request(app) as any)[method](path);
      expect(res.status).toBe(401);
it(`${method.toUpperCase()} ${path} with JWT returns not 401`, async () => {

    const res = await (request(app) as any)[method](path).set('Authorization', 'Bearer dummy');
      expect(res.status).not.toBe(401);
