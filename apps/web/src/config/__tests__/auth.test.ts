/* eslint-disable */
import * as mod from '../auth';
import { authConfig } from '../auth';

describe('auth.ts', () => {
  it('should export something', () => {
    expect(mod).toBeDefined();
  });

  it('should export authConfig object', () => {
    expect(authConfig).toBeDefined();
    expect(typeof authConfig).toBe('object');
  });
  
  it('should have the expected configuration properties', () => {
    expect(authConfig).toHaveProperty('baseURL');
    expect(authConfig).toHaveProperty('clientID');
    expect(authConfig).toHaveProperty('clientSecret');
    expect(authConfig).toHaveProperty('issuerBaseURL');
    expect(authConfig).toHaveProperty('secret');
    expect(authConfig).toHaveProperty('routes');
  });
  
  it('should have callback and login route configuration', () => {
    expect(authConfig.routes).toHaveProperty('callback', '/api/auth/callback');
    expect(authConfig.routes).toHaveProperty('login');
    expect(authConfig.routes.login).toHaveProperty('returnTo', '/dashboard');
  });
});
