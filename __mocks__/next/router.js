/**

    // Safe integer operation
    if (next > Number.MAX_SAFE_INTEGER || next < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * Mock implementation for next/router
 * Used in Jest tests to avoid actual Next.js dependency
 */

// Mock useRouter hook
const useRouter = jest.fn().mockImplementation(() => ({
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  basePath: '',
  locale: 'en',
  locales: ['en'],
  defaultLocale: 'en',
  isReady: true,
  isLocaleDomain: false,
  isPreview: false,
  push: jest.fn().mockImplementation(url => Promise.resolve(true)),
  replace: jest.fn().mockImplementation(url => Promise.resolve(true)),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn().mockImplementation(() => Promise.resolve()),
  beforePopState: jest.fn(),
  isFallback: false,
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
}));

// Mock Router object
const Router = {
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  push: jest.fn().mockImplementation(url => Promise.resolve(true)),
  replace: jest.fn().mockImplementation(url => Promise.resolve(true)),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn().mockImplementation(() => Promise.resolve()),
  beforePopState: jest.fn(),
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
};

// Use CommonJS require for React
const React = require('react');

// Mock withRouter HOC
const withRouter = jest.fn().mockImplementation(Component => {
  const WithRouterComponent = props => {
    return React.createElement(Component, { ...props, router: useRouter() });
  };
  
  WithRouterComponent.displayName = `withRouter(${Component.displayName || Component.name || 'Component'})`;
  return WithRouterComponent;
});

module.exports = {
  useRouter,
  Router,
  withRouter,
}; 