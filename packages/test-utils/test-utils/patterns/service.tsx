export interface ServiceTestCase<ServiceResult, ServiceParams extends any[]> {
  name: string;
  params?: ServiceParams;
  mockResponse?: any;
  mockError?: Error;
  setup?: () => Promise<void> | void;
  teardown?: () => Promise<void> | void;
  assertions?: (result: ServiceResult | Error) => Promise<void> | void;
  errorAssertions?: (error: Error) => Promise<void> | void;
/**
 * Standard service test suite generator
 * Creates a standard set of tests for a service function
 *
 * @param name - Service name
 * @param serviceFunction - The service function to test
 * @param testCases - Test cases for the service
 * @param mockFn - Optional mock function to use for network requests
 */
export function createServiceTestSuite<ServiceResult, ServiceParams extends any[]>(
  name: string,
  serviceFunction: (...args: ServiceParams) => Promise<ServiceResult>,
  testCases: ServiceTestCase<ServiceResult, ServiceParams>[],
  mockFn?: (mockResponse: any, mockError?: Error) => void,
): void {
  describe(`${name} Service`, () => {
    testCases.forEach((testCase) => {
      it(testCase.name, async () => {
        // Setup mocks if provided
        if (mockFn && (testCase.mockResponse || testCase.mockError)) {
          mockFn(testCase.mockResponse, testCase.mockError);
// Setup the test case
        if (testCase.setup) {
          await testCase.setup();
// Initialize params
        const params = testCase.params || ([] as unknown as ServiceParams);

        // Call the service function and handle result
        let result: ServiceResult | Error;
        try {
          result = await serviceFunction(...params);

          // Run assertions if provided
          if (testCase.assertions) {
            await testCase.assertions(result);
catch (error) {
          result = error as Error;

          // Run error assertions if provided
          if (testCase.errorAssertions) {
            await testCase.errorAssertions(error as Error);
else if (testCase.assertions) {
            // Fall back to regular assertions
            await testCase.assertions(error as Error);
else {
            // Re-throw if no assertions provided
            throw error;
// Teardown the test case
        if (testCase.teardown) {
          await testCase.teardown();
/**
 * Create a mock for a service function
 *
 * @param serviceFunction - The original service function
 * @returns A mock function with the same signature
 */
export function createServiceMock<ServiceResult, ServiceParams extends any[]>(
  serviceFunction: (...args: ServiceParams) => Promise<ServiceResult>,
): {
  mock: (...args: ServiceParams) => Promise<ServiceResult>;
  setMockResponse: (response: ServiceResult) => void;
  setMockError: (error: Error) => void;
{
  let mockResponse: ServiceResult;
  let mockError: Error | null = null;

  const mock = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');...args: ServiceParams): Promise<ServiceResult> => {
    if (mockError) {
      throw mockError;
return mockResponse;
return {
    mock,
    setMockResponse: (response: ServiceResult) => {
      mockResponse = response;
      mockError = null;
setMockError: (error: Error) => {
      mockError = error;
