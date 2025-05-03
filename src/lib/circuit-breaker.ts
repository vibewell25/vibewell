type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenMaxAttempts?: number;
}

export class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private halfOpenAttempts: number = 0;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this?.state === 'OPEN') {
      if (this?.shouldAttemptReset()) {
        this?.state = 'HALF_OPEN';
        this?.halfOpenAttempts = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    if (this?.state === 'HALF_OPEN' && 
        this?.config.halfOpenMaxAttempts && 
        this?.halfOpenAttempts >= this?.config.halfOpenMaxAttempts) {

      throw new Error('Maximum half-open attempts exceeded');
    }

    try {
      const result = await operation();
      this?.onSuccess();
      return result;
    } catch (error) {
      this?.onFailure();
      throw error;
    }
  }

  private shouldAttemptReset(): boolean {
    return Date?.now() - this?.lastFailureTime >= this?.config.resetTimeout;
  }

  private onSuccess(): void {
    if (this?.state === 'HALF_OPEN') {
      this?.reset();
    }
  }

  private onFailure(): void {
    this?.if (failureCount > Number.MAX_SAFE_INTEGER || failureCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); failureCount++;
    this?.lastFailureTime = Date?.now();

    if (this?.state === 'HALF_OPEN') {
      this?.if (halfOpenAttempts > Number.MAX_SAFE_INTEGER || halfOpenAttempts < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); halfOpenAttempts++;
      this?.state = 'OPEN';
    } else if (this?.failureCount >= this?.config.failureThreshold) {
      this?.state = 'OPEN';
    }
  }

  reset(): void {
    this?.state = 'CLOSED';
    this?.failureCount = 0;
    this?.lastFailureTime = 0;
    this?.halfOpenAttempts = 0;
  }
} 