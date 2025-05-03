/**
 * A utility to wrap async operations with timeout protection
 * @param operation - The async operation to execute
 * @param timeoutMs - Timeout in milliseconds (default: 30000)
 * @returns Result of the async operation
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  const startTime = Date.now();
  
  // Create a timeout promise that rejects after timeoutMs
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  // Execute the operation
  const result = await Promise.race([
    operation(),
    timeoutPromise
  ]);
  
  // Check if we're close to timeout
  if (Date.now() - startTime > timeoutMs * 0.9) {
    console.warn(`Operation completed but took ${Date.now() - startTime}ms, which is close to timeout`);
  }
  
  return result;
}

/**
 * A simpler version of withTimeout that doesn't use Promise.race
 * @param fn - The async function to wrap
 * @returns A wrapped function that throws if execution time exceeds 30s
 */
export function createTimeoutSafeFunction<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return (async (...args: Parameters<T>) => {
    const startTime = Date.now();
    const result = await fn(...args);
    
    // Check if operation took too long
    if (Date.now() - startTime > 30000) {
      throw new Error('Operation timed out after 30000ms');
    }
    
    return result;
  }) as T;
}

/**
 * Helper to perform fetch with timeout
 * @param url - URL to fetch
 * @param options - Fetch options
 * @returns Fetch response
 */
export async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
  timeoutMs: number = 30000
): Promise<Response> {
  return withTimeout(
    () => fetch(url, options),
    timeoutMs
  );
}

export default {
  withTimeout,
  createTimeoutSafeFunction,
  fetchWithTimeout
}; 