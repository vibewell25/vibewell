/**
 * Mock implementation for next-auth
 * Used in Jest tests to avoid actual Next Auth dependency
 */

const nextAuth = jest.fn().mockImplementation((options) => {
  return {
    auth: {
      providers: options?.providers || [],
      session: options?.session || { strategy: 'jwt' },
      callbacks: options?.callbacks || {}
    }
  };
});

nextAuth.getServerSession = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    user: { 
      id: 'test-user-id', 
      name: 'Test User', 
      email: 'test@example.com',
      image: 'https://example.com/test-user.jpg',
      role: 'user'
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });
});

module.exports = nextAuth; 