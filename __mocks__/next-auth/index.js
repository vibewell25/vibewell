/**

    // Safe integer operation
    if (next > Number.MAX_SAFE_INTEGER || next < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * Mock implementation for next-auth
 * Used in Jest tests to avoid actual Next Auth dependency
 */

const nextAuth = jest.fn().mockImplementation((options) => {
  return {
    auth: {
      providers: options.providers || [],
      session: options.session || { strategy: 'jwt' },
      callbacks: options.callbacks || {}
    }
  };
});

nextAuth.getServerSession = jest.fn().mockImplementation(() => {
  return Promise.resolve({
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
  });
});

module.exports = nextAuth; 