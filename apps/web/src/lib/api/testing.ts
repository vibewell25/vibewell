
import { ApiResponse, ApiError } from '@/types/api';
import { ApiClient, ApiClientOptions } from './client';

import { API_CONFIG } from '../../config/api';

/**
 * Create a mock API response
 */
export function createMockApiResponse<T>(
  data: T,
  success = true,
  error?: ApiError,
): ApiResponse<T> {
  return {
    success,
    data: success ? data : undefined,
    error: success ? undefined : error,
    meta: {
      version: API_CONFIG.version,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Create a mock API client
 */
export function createMockApiClient(options: ApiClientOptions = {}) {
  const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  };

  // Setup default successful responses
  mockClient.get.mockImplementation((path: string) =>
    Promise.resolve(createMockApiResponse({ path, method: 'GET' })),
  );

  mockClient.post.mockImplementation((path: string, data: any) =>
    Promise.resolve(createMockApiResponse({ path, method: 'POST', data })),
  );

  mockClient.put.mockImplementation((path: string, data: any) =>
    Promise.resolve(createMockApiResponse({ path, method: 'PUT', data })),
  );

  mockClient.delete.mockImplementation((path: string) =>
    Promise.resolve(createMockApiResponse({ path, method: 'DELETE' })),
  );

  mockClient.patch.mockImplementation((path: string, data: any) =>
    Promise.resolve(createMockApiResponse({ path, method: 'PATCH', data })),
  );

  return mockClient;
}

/**
 * Create a mock API error response
 */
export function createMockApiError(
  code: string,
  message: string,
  details?: Record<string, any>,
): ApiResponse {
  return createMockApiResponse(undefined, false, {
    code,
    message,
    details,
  });
}

/**
 * Mock API response with network error
 */
export function createMockNetworkError(): ApiResponse {
  return createMockApiError('NETWORK_ERROR', 'Network request failed');
}

/**
 * Mock API response with timeout error
 */
export function createMockTimeoutError(): ApiResponse {
  return createMockApiError('TIMEOUT_ERROR', 'Request timed out');
}

/**
 * Create a test wrapper for API services
 */
export function createServiceTestWrapper<T extends { apiClient: ApiClient }>(
  Service: new (client: ApiClient) => T,
  mockResponses: Record<string, ApiResponse> = {},
): T {
  const mockClient = createMockApiClient();

  // Override mock implementations with provided responses
  Object.entries(mockResponses).forEach(([path, response]) => {
    const [method, ...pathParts] = path.split(' ');
    const actualPath = pathParts.join(' ');

    switch (method.toUpperCase()) {
      case 'GET':
        mockClient.get.mockImplementation((p: string) =>
          p === actualPath ? Promise.resolve(response) : Promise.reject(),
        );
        break;
      case 'POST':
        mockClient.post.mockImplementation((p: string) =>
          p === actualPath ? Promise.resolve(response) : Promise.reject(),
        );
        break;
      case 'PUT':
        mockClient.put.mockImplementation((p: string) =>
          p === actualPath ? Promise.resolve(response) : Promise.reject(),
        );
        break;
      case 'DELETE':
        mockClient.delete.mockImplementation((p: string) =>
          p === actualPath ? Promise.resolve(response) : Promise.reject(),
        );
        break;
      case 'PATCH':
        mockClient.patch.mockImplementation((p: string) =>
          p === actualPath ? Promise.resolve(response) : Promise.reject(),
        );
        break;
    }
  });

  return new Service(mockClient as unknown as ApiClient);
}

/**
 * Wait for all pending API requests to complete
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); waitForApiRequests(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}
