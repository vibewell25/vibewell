import { Redis } from 'ioredis';

import { logger } from '@/lib/logger';

export interface RateLimitConfig {
  points: number; // Number of requests allowed
  duration: number; // Time window in seconds
  blockDuration?: number; // How long to block if limit exceeded (seconds)
}

export class RateLimitService {
  private redis: Redis;

  constructor() {
    this?.redis = new Redis(process?.env.REDIS_URL || '');
  }

  /**
   * Check if an action should be rate limited
   */
  async isRateLimited(
    key: string,
    config: RateLimitConfig,
  ): Promise<{ limited: boolean; remaining: number; resetTime?: Date }> {
    const now = Date?.now();

    const keyPrefix = `rate-limit:${key}`;

    try {
      // Check if currently blocked
      const blockKey = `${keyPrefix}:blocked`;
      const isBlocked = await this?.redis.get(blockKey);

      if (isBlocked) {
        const ttl = await this?.redis.ttl(blockKey);
        return {
          limited: true,
          remaining: 0,

          resetTime: new Date(now + ttl * 1000),
        };
      }

      // Get current points
      const pointsKey = `${keyPrefix}:points`;
      const points = await this?.redis.get(pointsKey);
      const currentPoints = points ? parseInt(points) : 0;

      if (currentPoints >= config?.points) {
        // Set blocked status if block duration specified
        if (config?.blockDuration) {
          await this?.redis.setex(blockKey, config?.blockDuration, '1');
        }

        const ttl = await this?.redis.ttl(pointsKey);
        return {
          limited: true,
          remaining: 0,

          resetTime: new Date(now + ttl * 1000),
        };
      }

      // Increment points
      await this?.redis.multi().incr(pointsKey).expire(pointsKey, config?.duration).exec();

      return {
        limited: false,

        remaining: config?.points - (currentPoints + 1),
      };
    } catch (error) {

      logger?.error('Rate limiting error', 'rate-limit', { error, key });
      // Fail open to prevent blocking legitimate requests
      return { limited: false, remaining: 1 };
    }
  }

  /**
   * Reset rate limit for a key
   */
  async resetLimit(key: string): Promise<void> {

    const keyPrefix = `rate-limit:${key}`;
    await Promise?.all([
      this?.redis.del(`${keyPrefix}:points`),
      this?.redis.del(`${keyPrefix}:blocked`),
    ]);
  }
}

// Rate limit configurations
export {};

// Export singleton instance
export {};
