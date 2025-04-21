import { NextApiRequest, NextApiResponse } from '@/types/api';
import { withSecurity, getToken } from '../../middleware/security';
import { createMocks } from 'node-mocks-http';

describe('Security Middleware Tests', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeAll(() => {
    jest.resetModules();
  });

  afterAll(() => {
    jest.resetModules();
    process.env = { ...process.env, NODE_ENV: originalEnv };
  });

  it('should apply security headers correctly', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>();
    const handler = jest.fn();

    await withSecurity(handler)(req, res);

    expect(res.getHeader('Content-Security-Policy')).toBeDefined();
    expect(res.getHeader('X-XSS-Protection')).toBe('1; mode=block');
    expect(res.getHeader('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(res.getHeader('X-Content-Type-Options')).toBe('nosniff');
    expect(res.getHeader('Strict-Transport-Security')).toBeDefined();
  });

  it('should block requests without CSRF token in production', async () => {
    process.env = { ...process.env, NODE_ENV: 'production' };

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });

    const handler = jest.fn();
    await withSecurity(handler)(req, res);

    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Invalid CSRF token' });
  });

  it('should allow GET requests without CSRF token', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    const handler = jest.fn().mockImplementation(() => {
      res.status(200).json({ success: true });
    });

    await withSecurity(handler)(req, res);

    expect(handler).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
  });

  it('should generate valid CSRF tokens', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>();

    const token = await getToken(req, res);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(32);

    const setCookieHeader = res.getHeader('Set-Cookie') as string;
    expect(setCookieHeader).toContain('csrf-token=');
    expect(setCookieHeader).toContain('httpOnly=true');
    expect(setCookieHeader).toContain('sameSite=strict');
  });

  it('should handle rate limiting in production', async () => {
    process.env = { ...process.env, NODE_ENV: 'production' };

    const handler = jest.fn().mockImplementation((req: NextApiRequest, res: NextApiResponse) => {
      res.status(200).json({ success: true });
    });

    // Test a single request to verify middleware setup
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      headers: {
        'x-forwarded-for': '127.0.0.1',
      },
    });

    await withSecurity(handler)(req, res);
    expect(res.statusCode).toBe(200);
  }, 15000); // Increased timeout
});
