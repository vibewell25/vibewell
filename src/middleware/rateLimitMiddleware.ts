import { NextApiRequest, NextApiResponse } from 'next';
import { rateLimitService, RATE_LIMITS } from '@/services/rateLimiting';

interface RateLimitOptions {
  type: keyof typeof RATE_LIMITS;
  identifier?: (req: NextApiRequest) => string;
}

export function withRateLimit(options: RateLimitOptions) {
  return async function rateLimitMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => void
  ) {
    try {
      // Get identifier for rate limiting
      const identifier = options.identifier?.(req) || 
        req.headers['x-forwarded-for'] || 
        req.socket.remoteAddress || 
        'unknown';

      // Check rate limit
      const key = `${options.type}:${identifier}`;
      const { limited, remaining, resetTime } = await rateLimitService.isRateLimited(
        key,
        RATE_LIMITS[options.type]
      );

      // Set rate limit headers
      res.setHeader('X-RateLimit-Remaining', remaining.toString());
      if (resetTime) {
        res.setHeader('X-RateLimit-Reset', resetTime.toISOString());
      }

      if (limited) {
        return res.status(429).json({
          error: 'Too Many Requests',
          resetTime
        });
      }

      return next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      // Fail open to prevent blocking legitimate requests
      return next();
    }
  };
}

// Helper to combine multiple rate limit middlewares
export function combineRateLimits(...limiters: ReturnType<typeof withRateLimit>[]) {
  return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    for (const limiter of limiters) {
      await new Promise<void>((resolve, reject) => {
        limiter(req, res, () => resolve())
          .catch(reject);
      });

      // If response is already sent (e.g., rate limited), stop processing
      if (res.writableEnded) {
        return;
      }
    }
    return next();
  };
} 