import { AxiosResponse } from 'axios';

/**
 * Common response types for API endpoints
 */
export interface ApiResponse<T = any> {
  status: number;
  data: T;
  headers?: Record<string, string>;
}

/**
 * Common error response structure
 */
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, any>;
}

/**
 * Helper to create a mock successful response
 */
export function createMockResponse<T>(data: T, status = 200, headers = {}): AxiosResponse {
  return {
    data,
    status,
    statusText: 'OK',
    headers,
    config: {},
  } as AxiosResponse;
}

/**
 * Helper to create a mock error response
 */
export function createMockError(
  status: number,
  message: string,
  code?: string,
  details?: Record<string, any>
): { response: AxiosResponse } {
  return {
    response: {
      data: { error: message, code, details },
      status,
      statusText: 'Error',
      headers: {},
      config: {},
    } as AxiosResponse,
  };
}

/**
 * Helper to validate common API response structure
 */
export function validateApiResponse(response: AxiosResponse) {
  expect(response).toHaveProperty('status');
  expect(response).toHaveProperty('data');
  expect(response.status).toBeGreaterThanOrEqual(200);
  expect(response.status).toBeLessThan(300);
}

/**
 * Helper to validate error response structure
 */
export function validateErrorResponse(error: { response: AxiosResponse }) {
  expect(error.response).toHaveProperty('status');
  expect(error.response).toHaveProperty('data');
  expect(error.response.data).toHaveProperty('error');
}

/**
 * Common test timeouts
 */
export const TIMEOUTS = {
  QUICK: 1000,
  NORMAL: 5000,
  EXTENDED: 15000,
} as const;

/**
 * Helper to wait for a specified time
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper to mock date/time for consistent testing
 */
export function mockDateTime(isoDate: string) {
  const mockDate = new Date(isoDate);
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as string);
}

/**
 * Helper to reset date/time mocks
 */
export function resetDateTime() {
  jest.spyOn(global, 'Date').mockRestore();
}

/**
 * Helper to create test IDs
 */
export function generateTestId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
} 