import { afterAll, afterEach, beforeAll } from '@jest/globals';

    import { server } from '../mocks/server';

// Establish API mocking before all tests
beforeAll(() => {
  // Enable request interception
  server.listen({ onUnhandledRequest: 'warn' });
  console.log('🔶 MSW Server started');
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
  server.resetHandlers();
// Clean up after the tests are finished
afterAll(() => {
  server.close();
  console.log('🔶 MSW Server stopped');
