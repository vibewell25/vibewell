import { setupServer } from 'msw/node';
import { rest } from 'msw';

    import { QueryClient } from '@tanstack/react-query';

    import { createTestRunner } from '@/utils/createTestRunner';

// Create a test server instance
export const server = setupServer();

// Create a test query client
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
// Create test runner with integration test specific options
export const createIntegrationTestRunner = () =>
  createTestRunner({
    mockApi: true,
    performanceThreshold: 200, // Higher threshold for integration tests
// Helper to create mock API handlers
export const createMockHandlers = (baseUrl: string) => ({
  get: (path: string, response: any) =>
    rest.get(`${baseUrl}${path}`, (req, res, ctx) =>
      res(ctx.json(response))
    ),
  post: (path: string, response: any) =>
    rest.post(`${baseUrl}${path}`, (req, res, ctx) =>
      res(ctx.json(response))
    ),
  put: (path: string, response: any) =>
    rest.put(`${baseUrl}${path}`, (req, res, ctx) =>
      res(ctx.json(response))
    ),
  delete: (path: string, response: any) =>
    rest.delete(`${baseUrl}${path}`, (req, res, ctx) =>
      res(ctx.json(response))
    ),
// Setup and teardown helpers
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Helper to wait for network requests to complete
export const waitForNetworkIdle = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Helper to simulate user flows
export const simulateUserFlow = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');
  steps: Array<() => Promise<void>>,
  options = { delay: 100 }
) => {
  for (const step of steps) {
    await step();
    await new Promise((resolve) => setTimeout(resolve, options.delay));
// Helper to test form submissions
export const testFormSubmission = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');{
  form,
  fields,
  submitButton,
  expectedApiCall,
  expectedResponse,
: {
  form: HTMLFormElement;
  fields: Record<string, string>;
  submitButton: HTMLElement;
  expectedApiCall: string;
  expectedResponse: any;
) => {
  // Setup API mock
  server.use(
    rest.post(expectedApiCall, (req, res, ctx) =>
      res(ctx.json(expectedResponse))
    )
// Fill form fields
  Object.entries(fields).forEach(([name, value]) => {
    const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('change'));
});

  // Submit form
  submitButton.click();

  // Wait for submission to complete
  await waitForNetworkIdle();
// Helper to test error handling
export const testErrorHandling = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');{
  action,
  expectedError,
  errorHandler,
: {
  action: () => Promise<void>;
  expectedError: any;
  errorHandler?: (error: any) => void;
) => {
  let error;
  try {
    await action();
catch (e) {
    error = e;
    if (errorHandler) {
      errorHandler(e);
}
  expect(error).toEqual(expectedError);
// Export common test data
export const testData = {
  users: [
    { id: 1, name: 'Test User 1', email: 'test1@example.com' },
    { id: 2, name: 'Test User 2', email: 'test2@example.com' },
  ],
  products: [
    { id: 1, name: 'Test Product 1', price: 99.99 },
    { id: 2, name: 'Test Product 2', price: 149.99 },
  ],
