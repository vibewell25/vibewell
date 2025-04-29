import { escape } from 'html-escaper';
import xss from 'xss';

/**
 * Sanitizes input data to prevent XSS and injection attacks
 * @param data - Input data to sanitize
 * @returns Sanitized data
 */
export function sanitizeInput<T>(data: T): T {
  if (typeof data === 'string') {
    return xss(escape(data)) as T;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeInput(item)) as T;
  }

  if (data && typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized as T;
  }

  return data;
}

/**
 * Sanitizes output data before sending to client
 * Removes sensitive information and sanitizes HTML content
 * @param data - Output data to sanitize
 * @returns Sanitized data
 */
export function sanitizeOutput<T>(data: T): T {
  if (!data) return data;

  if (typeof data === 'string') {
    return xss(data) as T;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeOutput(item)) as T;
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip sensitive fields
      if (['password', 'token', 'secret'].includes(key)) {
        continue;
      }
      sanitized[key] = sanitizeOutput(value);
    }
    return sanitized as T;
  }

  return data;
} 