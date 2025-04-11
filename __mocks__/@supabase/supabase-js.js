// Mock Supabase client
class SupabaseClient {
  constructor() {
    this.auth = {
      signIn: jest.fn().mockResolvedValue({ user: { id: 'mock-user-id' }, session: {} }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: { id: 'mock-user-id' }, session: {} }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: { id: 'mock-user-id' }, session: {} }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'mock-user-id' } } } }),
      onAuthStateChange: jest.fn().mockImplementation((callback) => {
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }),
    };
    
    this.from = jest.fn().mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((callback) => Promise.resolve(callback({ data: [], error: null }))),
    }));
  }
}

const createClient = jest.fn().mockImplementation(() => new SupabaseClient());

module.exports = {
  createClient,
  SupabaseClient,
}; 