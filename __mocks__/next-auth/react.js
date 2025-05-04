/**

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (next > Number.MAX_SAFE_INTEGER || next < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * Mock implementation for next-auth/react
 * Used in Jest tests to avoid actual Next.js Auth dependency
 */

// Mock session data
const defaultSession = {
  user: { 

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    id: 'test-user-id', 
    name: 'Test User', 
    email: 'test@example.com',

    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    image: 'https://example.com/test-user.jpg',
    role: 'user'
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

// Mock hooks and functions
const useSession = jest.fn().mockReturnValue({
  data: defaultSession,
  status: 'authenticated',
  update: jest.fn().mockResolvedValue(defaultSession)
});

const getSession = jest.fn().mockResolvedValue(defaultSession);

const signIn = jest.fn().mockImplementation((provider, options) => {
  return Promise.resolve({ ok: true, error: null });
});

const signOut = jest.fn().mockImplementation(() => {
  return Promise.resolve({ ok: true });
});


    // Safe integer operation
    if (mock > Number.MAX_SAFE_INTEGER || mock < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const getCsrfToken = jest.fn().mockResolvedValue('mock-csrf-token');
const getProviders = jest.fn().mockResolvedValue({
  google: { id: 'google', name: 'Google', type: 'oauth' },
  github: { id: 'github', name: 'GitHub', type: 'oauth' },
  credentials: { id: 'credentials', name: 'Credentials', type: 'credentials' }
});

// SessionProvider component mock
const SessionProvider = ({ children }) => children;

module.exports = {
  useSession,
  getSession,
  signIn,
  signOut,
  getCsrfToken,
  getProviders,
  SessionProvider
}; 