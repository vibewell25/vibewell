/**
 * API Client for making requests to the Vibewell API
 * This provides a consistent interface for all API calls
 */

// Default error message for failed requests
const DEFAULT_ERROR_MESSAGE = 'An error occurred during the request';

// API response interface
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}

// API client configuration
interface ApiClientConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
}

/**
 * API client for making HTTP requests
 */
export const apiClient = {
  /**
   * Make a GET request
   */
  async get<T>(path: string, config: ApiClientConfig = {}): Promise<ApiResponse<T>> {
    return makeRequest<T>('GET', path, undefined, config);
  },

  /**
   * Make a POST request
   */
  async post<T>(path: string, data?: any, config: ApiClientConfig = {}): Promise<ApiResponse<T>> {
    return makeRequest<T>('POST', path, data, config);
  },

  /**
   * Make a PUT request
   */
  async put<T>(path: string, data?: any, config: ApiClientConfig = {}): Promise<ApiResponse<T>> {
    return makeRequest<T>('PUT', path, data, config);
  },

  /**
   * Make a DELETE request
   */
  async delete<T>(path: string, config: ApiClientConfig = {}): Promise<ApiResponse<T>> {
    return makeRequest<T>('DELETE', path, undefined, config);
  },

  /**
   * Make a PATCH request
   */
  async patch<T>(path: string, data?: any, config: ApiClientConfig = {}): Promise<ApiResponse<T>> {
    return makeRequest<T>('PATCH', path, data, config);
  }
};

/**
 * Helper function to make HTTP requests
 */
async function makeRequest<T>(
  method: string,
  path: string,
  data?: any,
  config: ApiClientConfig = {}
): Promise<ApiResponse<T>> {
  const { baseUrl = '', headers = {} } = config;
  const url = `${baseUrl}${path}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: data ? JSON.stringify(data) : undefined
    });

    // Try to parse the response as JSON
    let responseData: T | undefined;
    let errorMessage: string | undefined;

    try {
      if (response.status !== 204) { // No content
        responseData = await response.json();
      }
    } catch (e) {
      // If response is not JSON, handle accordingly
      errorMessage = 'Invalid response format';
    }

    // Return a standardized response
    return {
      data: responseData,
      status: response.status,
      success: response.ok,
      error: !response.ok ? errorMessage || response.statusText : undefined
    };
  } catch (error) {
    // Network errors or other exceptions
    return {
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE
    };
  }
} 