/**
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

// Mock withRouter HOC
const withRouter = jest.fn().mockImplementation(Component => {
  const WithRouterComponent = props => {
    return <Component {...props} router={useRouter()} />;
  };
  
  WithRouterComponent.displayName = `withRouter(${Component.displayName || Component.name || 'Component'})`;
  return WithRouterComponent;
});

module.exports = {
  useRouter,
  Router,
  withRouter,
}; 