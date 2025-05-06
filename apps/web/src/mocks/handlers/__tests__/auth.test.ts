/* eslint-disable */
import { handlers } from '../../handlers';

// Basic sanity check
describe('auth', () => {
  it('should have auth-related handlers', () => {
    const loginHandler = handlers.find(h => h.url === '/api/login');
    expect(loginHandler).toBeDefined();
    expect(loginHandler?.method).toBe('POST');
  });
});
