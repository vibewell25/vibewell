import { Redis } from 'ioredis';

let redis: Redis | null = null;

if (typeof window === 'undefined') {
  // Server-side only
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  });

  redis.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });
}

export default redis;
