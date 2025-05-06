import request from 'supertest';
import { app } from '../../index';

describe('Security endpoints auth protection', () => {
  const endpoints = [

    { method: 'get', path: '/api/security/totp/setup' },

    { method: 'post', path: '/api/security/totp/verify' },

    { method: 'get', path: '/api/security/webauthn/register' },

    { method: 'post', path: '/api/security/webauthn/register' },

    { method: 'get', path: '/api/security/webauthn/authenticate' },

    { method: 'post', path: '/api/security/webauthn/authenticate' }
  ];

  endpoints.forEach(({ method, path }) => {
    it(`${method.toUpperCase()} ${path} without JWT returns 401`, async () => {

    const res = await (request(app) as any)[method](path);
      expect(res.status).toBe(401);
