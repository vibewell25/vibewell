import { ApiResponse, ApiError } from '@/types/api';
import { parseApiError, HTTP_STATUS } from '@/types/api';
import { API_CONFIG } from '../../config/api';

/**
 * Request interceptor configuration
 */
export interface RequestInterceptorConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Response interceptor configuration
 */
export interface ResponseInterceptorConfig {
  validateStatus?: (status: number) => boolean;
  transformResponse?: (data: any) => any;
}

/**
 * Default request interceptor
 */
export async function requestInterceptor(
  request: Request,
  config: RequestInterceptorConfig = {}
): Promise<Request> {
  const headers = new Headers(request.headers);

  // Add default headers
  Object.entries(API_CONFIG.headers).forEach(([key, value]) => {
    if (!headers.has(key)) {
      headers.set(key, value);
    }
  });

  // Add custom headers
  if (config.headers) {
    Object.entries(config.headers).forEach(([key, value]) => {
      headers.set(key, value);
    });
  }

  // Clone request with new headers
  return new Request(request, {
    headers,
  });
}

/**
 * Default response interceptor
 */
export async function responseInterceptor(
  response: Response,
  config: ResponseInterceptorConfig = {}
): Promise<ApiResponse> {
  const validateStatus = config.validateStatus || defaultValidateStatus;
  const transformResponse = config.transformResponse || defaultTransformResponse;

  try {
    const data = await response.json();
    const transformed = transformResponse(data);

    return {
      success: validateStatus(response.status),
      data: transformed,
      meta: {
        version: API_CONFIG.version,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    const apiError = parseApiError(error);
    return {
      success: false,
      error: apiError,
      meta: {
        version: API_CONFIG.version,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * Default status validator
 */
function defaultValidateStatus(status: number): boolean {
  return status >= HTTP_STATUS.OK && status < HTTP_STATUS.BAD_REQUEST;
}

/**
 * Default response transformer
 */
function defaultTransformResponse(data: any): any {
  return data;
}

/**
 * Error response handler
 */
export function handleErrorResponse(response: Response): ApiError {
  const status = response.status;

  switch (status) {
    case HTTP_STATUS.UNAUTHORIZED:
      return {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      };

    case HTTP_STATUS.FORBIDDEN:
      return {
        code: 'FORBIDDEN',
        message: 'Access denied',
      };

    case HTTP_STATUS.NOT_FOUND:
      return {
        code: 'NOT_FOUND',
        message: 'Resource not found',
      };

    case HTTP_STATUS.TOO_MANY_REQUESTS:
      return {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
      };

    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      };

    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service temporarily unavailable',
      };

    default:
      return {
        code: 'UNKNOWN_ERROR',
        message: response.statusText || 'Unknown error occurred',
      };
  }
}
