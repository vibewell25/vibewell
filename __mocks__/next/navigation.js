/**
 * Mock implementation for next/navigation
 * Used in Jest tests to avoid actual Next.js dependency
 */

// Mock navigation hooks
const useRouter = jest.fn().mockImplementation(() => ({
  push: jest.fn().mockImplementation(url => Promise.resolve(true)),
  replace: jest.fn().mockImplementation(url => Promise.resolve(true)),
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn().mockImplementation(() => Promise.resolve()),
}));

const usePathname = jest.fn().mockReturnValue('/');
const useSearchParams = jest.fn().mockImplementation(() => {
  return {
    get: jest.fn().mockReturnValue(null),
    getAll: jest.fn().mockReturnValue([]),
    has: jest.fn().mockReturnValue(false),
    toString: jest.fn().mockReturnValue(''),
    entries: jest.fn().mockReturnValue([]),
    forEach: jest.fn(),
    keys: jest.fn().mockReturnValue([]),
    values: jest.fn().mockReturnValue([]),
  };
});

const useParams = jest.fn().mockReturnValue({});

// Navigation utils
const redirect = jest.fn().mockImplementation(url => { throw new Error('Redirect to ' + url); });
const permanentRedirect = jest.fn().mockImplementation(url => { throw new Error('Permanent Redirect to ' + url); });
const notFound = jest.fn().mockImplementation(() => { throw new Error('Not Found'); });

// Create URL object
const useBasePath = jest.fn().mockReturnValue('');
const createNextURLMock = (url) => new URL(url, 'http://localhost:3000');

module.exports = {
  useRouter,
  usePathname,
  useSearchParams,
  useParams,
  redirect,
  permanentRedirect,
  notFound,
  useBasePath,
  createNextURL: createNextURLMock,
}; 