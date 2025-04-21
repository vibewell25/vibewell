import { RateLimiter } from 'limiter';
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;

class RateLimitService {
  private redis: Redis | null = null;
  private limiters: Map<string, RateLimiter> = new Map();

  constructor() {
    if (REDIS_URL) {
      this.redis = new Redis(REDIS_URL);
    }
  }

  private getLimiter(key: string): RateLimiter {
    let limiter = this.limiters.get(key);
    if (!limiter) {
      limiter = new RateLimiter({
        tokensPerInterval: 100,
        interval: 'minute',
      });
      this.limiters.set(key, limiter);
    }
    return limiter;
  }

  async checkRateLimit(key: string): Promise<{
    success: boolean;
    remaining: number;
    resetTime: number;
  }> {
    try {
      if (this.redis) {
        // Use Redis-based rate limiting
        const [tokens, resetTime] = await Promise.all([
          this.redis.get(`ratelimit:${key}:tokens`),
          this.redis.get(`ratelimit:${key}:reset`),
        ]);

        const now = Date.now();
        const reset = parseInt(resetTime || '0', 10);

        if (now > reset) {
          // Reset tokens if expired
          await Promise.all([
            this.redis.set(`ratelimit:${key}:tokens`, '100'),
            this.redis.set(`ratelimit:${key}:reset`, String(now + 60000)),
          ]);
          return { success: true, remaining: 99, resetTime: now + 60000 };
        }

        const remaining = parseInt(tokens || '0', 10);
        if (remaining <= 0) {
          return { success: false, remaining: 0, resetTime: reset };
        }

        await this.redis.set(`ratelimit:${key}:tokens`, String(remaining - 1));
        return { success: true, remaining: remaining - 1, resetTime: reset };
      } else {
        // Use in-memory rate limiting
        const limiter = this.getLimiter(key);
        const remainingTokens = await limiter.tryRemoveTokens(1);
        const success = remainingTokens >= 0;
        return {
          success,
          remaining: Math.max(0, remainingTokens),
          resetTime: Date.now() + 60000,
        };
      }
    } catch (error) {
      console.error('Rate limit error:', error);
      // Fail open if rate limiting fails
      return { success: true, remaining: 1, resetTime: Date.now() + 60000 };
    }
  }

  async close() {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

export const rateLimitService = new RateLimitService();
