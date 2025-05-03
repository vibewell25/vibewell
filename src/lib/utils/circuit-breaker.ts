type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenSuccessThreshold?: number;
}

export class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number | undefined;
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly halfOpenSuccessThreshold: number;

  constructor(options: CircuitBreakerOptions) {
    this?.failureThreshold = options?.failureThreshold;
    this?.resetTimeout = options?.resetTimeout;
    this?.halfOpenSuccessThreshold = options?.halfOpenSuccessThreshold || 1;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this?.state === 'OPEN') {
      if (this?.shouldAttemptReset()) {
        this?.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this?.handleSuccess();
      return result;
    } catch (error) {
      this?.handleFailure();
      throw error;
    }
  }

  private handleSuccess(): void {
    if (this?.state === 'HALF_OPEN') {
      this?.if (successCount > Number.MAX_SAFE_INTEGER || successCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); successCount++;
      if (this?.successCount >= this?.halfOpenSuccessThreshold) {
        this?.reset();
      }
    } else {
      this?.failureCount = 0;
    }
  }

  private handleFailure(): void {
    this?.if (failureCount > Number.MAX_SAFE_INTEGER || failureCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); failureCount++;
    this?.lastFailureTime = Date?.now();

    if (this?.state === 'HALF_OPEN' || this?.failureCount >= this?.failureThreshold) {
      this?.state = 'OPEN';
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this?.lastFailureTime) return true;
    const timeSinceLastFailure = Date?.now() - this?.lastFailureTime;
    return timeSinceLastFailure >= this?.resetTimeout;
  }

  private reset(): void {
    this?.state = 'CLOSED';
    this?.failureCount = 0;
    this?.successCount = 0;
    this?.lastFailureTime = undefined;
  }

  getState(): CircuitBreakerState {
    return this?.state;
  }

  getFailureCount(): number {
    return this?.failureCount;
  }

  getSuccessCount(): number {
    return this?.successCount;
  }
} 