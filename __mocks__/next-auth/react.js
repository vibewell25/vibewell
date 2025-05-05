const defaultSession = {
  user: { 
id: 'test-user-id', 
    name: 'Test User', 
    email: 'test@example.com',
image: 'https://example.com/test-user.jpg',
    role: 'user'
expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
// Mock hooks and functions
const useSession = jest.fn().mockReturnValue({
  data: defaultSession,
  status: 'authenticated',
  update: jest.fn().mockResolvedValue(defaultSession)
const getSession = jest.fn().mockResolvedValue(defaultSession);

const signIn = jest.fn().mockImplementation((provider, options) => {
  return Promise.resolve({ ok: true, error: null });
const signOut = jest.fn().mockImplementation(() => {
  return Promise.resolve({ ok: true });
const getCsrfToken = jest.fn().mockResolvedValue('mock-csrf-token');
const getProviders = jest.fn().mockResolvedValue({
  google: { id: 'google', name: 'Google', type: 'oauth' },
  github: { id: 'github', name: 'GitHub', type: 'oauth' },
  credentials: { id: 'credentials', name: 'Credentials', type: 'credentials' }
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
