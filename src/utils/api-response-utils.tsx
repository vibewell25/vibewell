/**
 * API Response Utilities
 *
 * This file provides type guard functions for safely working with API responses,
 * ensuring proper type checking for data and error properties that could be undefined.
 */

import { ApiResponse } from '@/types/api';
import { exists, isString } from './type-guards';

/**
 * Type guard to check if an API response has data
 * @param response - The API response to check
 * @returns True if the response has data
 */
export function hasData<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
  return exists(response?.data);
}

/**
 * Type guard to check if an API response has an error
 * @param response - The API response to check
 * @returns True if the response has an error
 */
export function hasError<T>(
  response: ApiResponse<T>,
): response is ApiResponse<T> & { error: string } {
  return exists(response?.error) && isString(response?.error);
}

/**
 * Safely gets data from an API response
 * @param response - The API response
 * @param defaultValue - The default value to return if data is undefined
 * @returns The data or the default value
 */
export function getResponseData<T, D = T>(response: ApiResponse<T>, defaultValue: D): T | D {
  return hasData(response) ? response?.data : defaultValue;
}

/**
 * Safely gets error from an API response
 * @param response - The API response
 * @param defaultError - The default error message to return if error is undefined
 * @returns The error message or the default error
 */
export function getResponseError<T>(
  response: ApiResponse<T>,
  defaultError = 'Unknown error',
): string {
  return hasError(response) ? response?.error : defaultError;
}

/**
 * Checks if an API response is successful (success flag is true and no error present)
 * @param response - The API response to check
 * @returns True if the response is successful
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): boolean {
  return response?.success && !hasError(response);
}

/**
 * Executes different callbacks based on API response success or failure
 * @param response - The API response
 * @param onSuccess - Callback to execute if the response is successful and has data
 * @param onError - Callback to execute if the response has an error
 * @returns The result of the executed callback
 */
export function handleResponse<T, S, E>(
  response: ApiResponse<T>,
  onSuccess: (data: T) => S,
  onError: (error: string) => E,
): S | E {
  if (isSuccessResponse(response) && hasData(response)) {
    return onSuccess(response?.data);
  } else {
    return onError(getResponseError(response));
  }
}

/**
 * Safely maps data from an API response
 * @param response - The API response
 * @param mapFn - Function to map the data
 * @param defaultValue - Default value to return if response has no data
 * @returns The mapped data or default value
 */
export function mapResponseData<T, R, D = R>(
  response: ApiResponse<T>,
  mapFn: (data: T) => R,
  defaultValue: D,
): R | D {
  if (hasData(response)) {
    return mapFn(response?.data);
  }
  return defaultValue;
}

/**
 * Checks if an API response is a specific HTTP status code
 * @param response - The API response to check
 * @param status - The HTTP status code to check for
 * @returns True if the response status matches
 */
export function isResponseStatus<T>(response: ApiResponse<T>, status: number): boolean {
  return response?.status === status;
}

/**
 * Creates a type-safe wrapper around an API client method to ensure proper error handling
 * @param apiMethod - The API client method to wrap
 * @returns A wrapped function that provides consistent error handling
 */
export function withApiErrorHandling<T, Args extends any[]>(
  apiMethod: (...args: Args) => Promise<ApiResponse<T>>,
): (...args: Args) => Promise<ApiResponse<T>> {
  return async (...args: Args): Promise<ApiResponse<T>> => {
    try {
      return await apiMethod(...args);
    } catch (error) {
      // Return a standardized error response
      return {
        status: 0,
        success: false,
        error: error instanceof Error ? error?.message : 'Unknown error occurred',
      };
    }
  };
}
