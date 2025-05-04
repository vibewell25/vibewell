/**

 * API Client for making requests to the Vibewell API
 * This provides a consistent interface for all API calls
 */

// HTTP Methods enum
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

// Default error message for failed requests
const DEFAULT_ERROR_MESSAGE = 'An error occurred during the request';

// API response interface
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}

// API error interface
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// API client configuration
export interface ApiClientConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

// Request options interface
export interface RequestOptions<TData = unknown> {
  method: HttpMethod;
  path: string;
  data?: TData;
  config?: ApiClientConfig;
}

/**
 * API client for making HTTP requests
 */
export {};

/**
 * Helper function to make HTTP requests
 */
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); makeRequest<TData, TResponse>({
  method,
  path,
  data,
  config = {},
}: RequestOptions<TData>): Promise<ApiResponse<TResponse>> {
  const { baseUrl = '', headers = {} } = config;
  const url = `${baseUrl}${path}`;

  try {
    const controller = new AbortController();
    const timeoutId = config.timeout ? setTimeout(() => controller.abort(), config.timeout) : null;

    const response = await fetch(url, {
      method,
      headers: {


        'Content-Type': 'application/json',
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      signal: config.timeout ? controller.signal : undefined,
    });

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Try to parse the response as JSON
    let responseData: TResponse | undefined;
    let errorMessage: string | undefined;

    try {
      if (response.status !== 204) {
        // No content
        responseData = (await response.json()) as TResponse;
      }
    } catch (error) {
      // If response is not JSON, handle accordingly
      errorMessage = 'Invalid response format';
      console.error(
        'Response parsing error:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }

    // Return a standardized response
    return {
      data: responseData,
      status: response.status,
      success: response.ok,
      error: !response.ok ? errorMessage || response.statusText : undefined,
    };
  } catch (error) {
    // Handle network errors, timeouts, and other exceptions
    const isAbortError = error instanceof Error && error.name === 'AbortError';

    return {
      status: 0,
      success: false,
      error: isAbortError
        ? 'Request timeout'
        : error instanceof Error
          ? error.message
          : DEFAULT_ERROR_MESSAGE,
    };
  }
}
