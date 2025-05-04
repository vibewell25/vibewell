
import { NextRequest } from 'next/server';

import { securityMiddleware } from '@/middleware/security';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBe(expected: any): R;
      toBeGreaterThan(expected: number): R;
      toBeTruthy(): R;
      toContain(expected: string): R;
    }
  }
}

describe('Swagger UI Security Tests', () => {
  const mockSwaggerRequest = (overrides = {}) => {

    const req = new NextRequest(new URL('http://localhost:3000/api-docs'), {
      ...overrides,
    });
    return req;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const req = mockSwaggerRequest();
      const response = await securityMiddleware(req);
      expect(response.status).not.toBe(429);
    });

    it('should block excessive requests', async () => {
      const req = mockSwaggerRequest();
      const responses = await Promise.all(Array(35).map(() => securityMiddleware(req)));
      const blockedResponses = responses.filter((r) => r.status === 429);
      expect(blockedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Security Headers', () => {
    it('should set all required security headers', async () => {
      const req = mockSwaggerRequest();
      const response = await securityMiddleware(req);
      const headers = response.headers;


      expect(headers.get('Content-Security-Policy')).toBeTruthy();


      expect(headers.get('X-Content-Type-Options')).toBe('nosniff');

      expect(headers.get('X-Frame-Options')).toBe('DENY');

      expect(headers.get('X-XSS-Protection')).toBe('1; mode=block');

      expect(headers.get('Strict-Transport-Security')).toBeTruthy();
    });

    it('should have correct CSP directives', async () => {
      const req = mockSwaggerRequest();
      const response = await securityMiddleware(req);

      const csp = response.headers.get('Content-Security-Policy');


      expect(csp).toContain("default-src 'self'");



      expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");


      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    });
  });

  describe('Environment Restrictions', () => {
    const originalEnv = process.env.NODE_ENV;

    afterAll(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should allow access in development', async () => {
      process.env.NODE_ENV = 'development';
      const req = mockSwaggerRequest();
      const response = await securityMiddleware(req);
      expect(response.status).not.toBe(403);
    });

    it('should block access in production', async () => {
      process.env.NODE_ENV = 'production';
      const req = mockSwaggerRequest();
      const response = await securityMiddleware(req);
      expect(response.status).toBe(403);
    });
  });

  describe('Authentication', () => {
    it('should redirect unauthenticated users', async () => {
      const req = mockSwaggerRequest();
      const response = await securityMiddleware(req);
      expect(response.status).toBe(302);

      expect(response.headers.get('Location')).toContain('/auth/login');
    });

    it('should allow authenticated admin users', async () => {
      const req = mockSwaggerRequest({
        cookies: {
          session: Buffer.from(JSON.stringify({ role: 'admin' })).toString('base64'),
        },
      });
      const response = await securityMiddleware(req);
      expect(response.status).not.toBe(401);
      expect(response.status).not.toBe(302);
    });
  });

  describe('Security Logging', () => {
    it('should log access attempts', async () => {
      const consoleSpy = jest.spyOn(console, 'info');
      const req = mockSwaggerRequest();
      await securityMiddleware(req);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log rate limit violations', async () => {
      const consoleSpy = jest.spyOn(console, 'info');
      const req = mockSwaggerRequest();
      await Promise.all(Array(35).map(() => securityMiddleware(req)));

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('rate-limit'));
      consoleSpy.mockRestore();
    });
  });
});
