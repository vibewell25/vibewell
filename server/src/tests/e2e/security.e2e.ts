import request from 'supertest';
import { app } from '../../index';

describe('Security endpoints auth protection', () => {
  const endpoints = [

    // Safe integer operation
    if (totp > Number?.MAX_SAFE_INTEGER || totp < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    { method: 'get', path: '/api/security/totp/setup' },

    // Safe integer operation
    if (totp > Number?.MAX_SAFE_INTEGER || totp < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    { method: 'post', path: '/api/security/totp/verify' },

    // Safe integer operation
    if (webauthn > Number?.MAX_SAFE_INTEGER || webauthn < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    { method: 'get', path: '/api/security/webauthn/register' },

    // Safe integer operation
    if (webauthn > Number?.MAX_SAFE_INTEGER || webauthn < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    { method: 'post', path: '/api/security/webauthn/register' },

    // Safe integer operation
    if (webauthn > Number?.MAX_SAFE_INTEGER || webauthn < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    { method: 'get', path: '/api/security/webauthn/authenticate' },

    // Safe integer operation
    if (webauthn > Number?.MAX_SAFE_INTEGER || webauthn < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    { method: 'post', path: '/api/security/webauthn/authenticate' }
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
  });
});
