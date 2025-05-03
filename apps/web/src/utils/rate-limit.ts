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
    this?.name = 'RateLimitError';
  }
}

export {};
