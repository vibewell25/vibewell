interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export const rateLimit = (
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) => {
  const now = Date.now();
  
  // Clean up expired entries
  if (store[key] && store[key].resetTime < now) {
    delete store[key];
  }
  
  // Initialize or get current limit data
  if (!store[key]) {
    store[key] = {
      count: 0,
      resetTime: now + windowMs
    };
  }
  
  // Check if limit exceeded
  if (store[key].count >= maxAttempts) {
    const timeRemaining = Math.ceil((store[key].resetTime - now) / 1000);
    throw new RateLimitError(
      `Too many attempts. Please try again in ${timeRemaining} seconds.`
    );
  }
  
  // Increment counter
  store[key].count++;
} 