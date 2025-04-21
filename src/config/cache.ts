import { CacheConfig } from '@/types/caching';

export const cacheConfig: CacheConfig = {
  redis: {
    host: process.env['REDIS_HOST'] || 'localhost',
    port: parseInt(process.env['REDIS_PORT'] || '6379'),
    ...(process.env['REDIS_PASSWORD'] ? { password: process.env['REDIS_PASSWORD'] } : {})
  },
  memory: {
    maxSize: parseInt(process.env['MEMORY_CACHE_SIZE'] || '1000'),
    ttl: parseInt(process.env['MEMORY_CACHE_TTL'] || '3600') // 1 hour
  },
  strategies: {
    // API response caching
    'api-response': {
      type: 'hybrid',
      ttl: 300, // 5 minutes
      staleWhileRevalidate: true
    },
    
    // Static assets (images, CSS, JS)
    'static-assets': {
      type: 'memory',
      ttl: 86400 // 24 hours
    },
    
    // Database query results
    'db-queries': {
      type: 'hybrid',
      ttl: 600, // 10 minutes
      staleWhileRevalidate: true
    },
    
    // User sessions
    'sessions': {
      type: 'redis',
      ttl: 86400 // 24 hours
    },
    
    // Real-time data
    'real-time': {
      type: 'memory',
      ttl: 60 // 1 minute
    },
    
    // Configuration data
    'config': {
      type: 'hybrid',
      ttl: 3600, // 1 hour
      staleWhileRevalidate: true
    },
    
    // Authentication tokens
    'auth-tokens': {
      type: 'redis',
      ttl: 3600 // 1 hour
    },
    
    // Rate limiting data
    'rate-limit': {
      type: 'redis',
      ttl: 60 // 1 minute
    },
    
    // Server-side rendered pages
    'ssr-pages': {
      type: 'hybrid',
      ttl: 300, // 5 minutes
      staleWhileRevalidate: true
    },
    
    // GraphQL query results
    'graphql': {
      type: 'hybrid',
      ttl: 300, // 5 minutes
      staleWhileRevalidate: true
    },
    
    // WebSocket subscriptions
    'ws-subscriptions': {
      type: 'memory',
      ttl: 300 // 5 minutes
    }
  }
}; 