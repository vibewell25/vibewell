import { LRUCache } from 'lru-cache';

interface RateLimitOptions {
  uniqueTokenPerInterval?: number;
  interval?: number;
}

export default class RateLimit {
  private tokenCache: LRUCache<string, number>;
  private interval: number;

  constructor(options: RateLimitOptions = {}) {
    this.tokenCache = new LRUCache({
      max: options.uniqueTokenPerInterval || 500,
      ttl: options.interval || 60000
    });
    this.interval = options.interval || 60000;
  }

  public async check(limit: number, token: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> {
    const tokenCount = (this.tokenCache.get(token) || 0) + 1;
    this.tokenCache.set(token, tokenCount);

    const currentTime = Date.now();
    const reset = Math.ceil((currentTime + this.interval) / 1000);

    return {
      success: tokenCount <= limit,
      limit,
      remaining: Math.max(0, limit - tokenCount),
      reset
    };
  }
} 