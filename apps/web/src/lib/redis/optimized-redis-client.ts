/**
 * Optimized Redis Client with Connection Pooling
 * 
 * This module provides a high-performance Redis client implementation with:
 * - Connection pooling
 * - Automatic reconnection
 * - Pipelining support
 * - Circuit breaker pattern
 * - Telemetry and monitoring
 */

import Redis, { RedisOptions, Pipeline } from 'ioredis';
import { logger } from '@/lib/logger';
import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

// Types and interfaces
export interface CacheStats {
  hits: number;
  misses: number;
  operations: number;
  latencyMs: {
    avg: number;
    p95: number;
    p99: number;
  };
}

export interface RedisPoolOptions {
  poolSize?: number;
  retryDelay?: number;
  maxRetries?: number;
  healthCheckInterval?: number;
  circuitBreakerThreshold?: number;
  timeoutMs?: number;
}

// Redis connection status enum
enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CIRCUIT_OPEN = 'circuit_open', 
}

/**
 * Optimized Redis client with connection pooling
 */
export class OptimizedRedisClient extends EventEmitter {
  private pool: Redis[];
  private poolIndex: number = 0;
  private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private errorCount: number = 0;
  private latencyValues: number[] = [];
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    operations: 0,
    latencyMs: {
      avg: 0,
      p95: 0,
      p99: 0,
    },
  };
  private options: RedisPoolOptions;
  private redisOptions: RedisOptions;
  private lastError: Error | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private circuitBreakerTimer: NodeJS.Timeout | null = null;

  constructor(redisOptions: RedisOptions, poolOptions: RedisPoolOptions = {}) {
    super();
    this.redisOptions = redisOptions;
    this.options = {
      poolSize: poolOptions.poolSize || 5,
      retryDelay: poolOptions.retryDelay || 5000,
      maxRetries: poolOptions.maxRetries || 10,
      healthCheckInterval: poolOptions.healthCheckInterval || 30000,
      circuitBreakerThreshold: poolOptions.circuitBreakerThreshold || 5,
      timeoutMs: poolOptions.timeoutMs || 1000,
    };
    
    // Initialize connection pool
    this.pool = this.createPool();
    
    // Start health check
    this.startHealthCheck();
  }

  /**
   * Create the connection pool
   */
  private createPool(): Redis[] {
    const pool: Redis[] = [];
    
    for (let i = 0; i < this.options.poolSize!; i++) {
      const client = new Redis({
        ...this.redisOptions,
        retryStrategy: (times) => {
          if (times > this.options.maxRetries!) {
            this.errorCount++;
            this.checkCircuitBreaker();
            return null; // Stop retrying
          }
          return this.options.retryDelay!;
        },
        connectTimeout: this.options.timeoutMs,
        commandTimeout: this.options.timeoutMs,
      });
      
      // Set up event handlers
      client.on('connect', () => {
        this.connectionStatus = ConnectionStatus.CONNECTED;
        this.emit('connect', i);
        logger.info(`Redis connection ${i} established`);
      });
      
      client.on('error', (err) => {
        this.lastError = err;
        this.errorCount++;
        this.checkCircuitBreaker();
        this.emit('error', err, i);
        logger.error(`Redis connection ${i} error:`, err);
      });
      
      client.on('close', () => {
        if (this.connectionStatus !== ConnectionStatus.CIRCUIT_OPEN) {
          this.connectionStatus = ConnectionStatus.DISCONNECTED;
        }
        this.emit('close', i);
        logger.warn(`Redis connection ${i} closed`);
      });
      
      pool.push(client);
    }
    
    return pool;
  }

  /**
   * Get a connection from the pool using round-robin
   */
  private getConnection(): Redis {
    // If circuit breaker is open, throw an error
    if (this.connectionStatus === ConnectionStatus.CIRCUIT_OPEN) {
      throw new Error('Redis circuit breaker is open');
    }
    
    const conn = this.pool[this.poolIndex];
    this.poolIndex = (this.poolIndex + 1) % this.pool.length;
    return conn;
  }

  /**
   * Check if circuit breaker should be opened
   */
  private checkCircuitBreaker(): void {
    if (this.errorCount >= this.options.circuitBreakerThreshold!) {
      if (this.connectionStatus !== ConnectionStatus.CIRCUIT_OPEN) {
        logger.error(`Redis circuit breaker opened due to ${this.errorCount} errors`);
        this.connectionStatus = ConnectionStatus.CIRCUIT_OPEN;
        this.emit('circuit_open');
        
        // Auto-reset circuit breaker after delay
        this.circuitBreakerTimer = setTimeout(() => {
          this.resetCircuitBreaker();
        }, this.options.retryDelay! * 2);
      }
    }
  }

  /**
   * Reset the circuit breaker
   */
  public resetCircuitBreaker(): void {
    this.errorCount = 0;
    this.connectionStatus = ConnectionStatus.CONNECTING;
    this.emit('circuit_reset');
    logger.info('Redis circuit breaker reset');
    
    // Try to reconnect all clients
    this.pool.forEach((client, i) => {
      client.disconnect();
      client.connect().catch(err => {
        logger.error(`Redis connection ${i} reconnect error:`, err);
      });
    });
    
    if (this.circuitBreakerTimer) {
      clearTimeout(this.circuitBreakerTimer);
      this.circuitBreakerTimer = null;
    }
  }

  /**
   * Start periodic health check
   */
  private startHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(() => {
      this.healthCheck();
    }, this.options.healthCheckInterval!);
  }

  /**
   * Perform health check on all connections
   */
  private async healthCheck(): Promise<void> {
    try {
      const results = await Promise.allSettled(
        this.pool.map((client, i) => {
          return client.ping().then(() => {
            return { index: i, healthy: true };
          }).catch(err => {
            return { index: i, healthy: false, error: err };
          });
        })
      );
      
      // Calculate health metrics
      const healthyConnections = results.filter(r => 
        r.status === 'fulfilled' && (r.value as any).healthy
      ).length;
      
      const healthPercentage = (healthyConnections / this.pool.length) * 100;
      
      if (healthPercentage < 50) {
        logger.warn(`Redis pool health check: ${healthPercentage.toFixed(1)}% healthy`);
        this.emit('unhealthy', healthPercentage);
      }
      
      // Process latency stats
      if (this.latencyValues.length > 0) {
        // Sort for percentiles
        const sortedLatencies = [...this.latencyValues].sort((a, b) => a - b);
        const len = sortedLatencies.length;
        
        // Calculate percentiles
        this.stats.latencyMs = {
          avg: sortedLatencies.reduce((sum, val) => sum + val, 0) / len,
          p95: sortedLatencies[Math.floor(len * 0.95)],
          p99: sortedLatencies[Math.floor(len * 0.99)],
        };
        
        // Reset latency buffer after processing
        this.latencyValues = [];
      }
      
      this.emit('health_check', {
        healthPercentage,
        stats: this.stats,
      });
    } catch (err) {
      logger.error('Redis health check error:', err);
    }
  }

  /**
   * Record latency for statistics
   */
  private recordLatency(startTime: number): void {
    const latency = performance.now() - startTime;
    this.latencyValues.push(latency);
    
    // Keep buffer size manageable
    if (this.latencyValues.length > 1000) {
      this.latencyValues = this.latencyValues.slice(-1000);
    }
  }

  /**
   * Executes a Redis command with latency tracking
   */
  private async executeCommand<T>(fn: (client: Redis) => Promise<T>): Promise<T> {
    if (this.connectionStatus === ConnectionStatus.CIRCUIT_OPEN) {
      throw new Error('Redis circuit breaker is open');
    }
    
    const startTime = performance.now();
    this.stats.operations++;
    
    try {
      const client = this.getConnection();
      const result = await fn(client);
      
      // Record latency
      this.recordLatency(startTime);
      
      // Reset error count on successful operation
      if (this.errorCount > 0) {
        this.errorCount = Math.max(0, this.errorCount - 1);
      }
      
      return result;
    } catch (err) {
      this.lastError = err as Error;
      this.errorCount++;
      this.checkCircuitBreaker();
      throw err;
    }
  }

  /**
   * Get a value from cache
   */
  public async get(key: string): Promise<string | null> {
    return this.executeCommand(async (client) => {
      const result = await client.get(key);
      if (result) {
        this.stats.hits++;
      } else {
        this.stats.misses++;
      }
      return result;
    });
  }

  /**
   * Set a value in cache
   */
  public async set(key: string, value: string, options?: { ex?: number }): Promise<'OK'> {
    return this.executeCommand(async (client) => {
      if (options?.ex) {
        return client.set(key, value, 'EX', options.ex);
      }
      return client.set(key, value);
    });
  }

  /**
   * Delete a key from cache
   */
  public async del(key: string): Promise<number> {
    return this.executeCommand(client => client.del(key));
  }

  /**
   * Get multiple values in a single operation
   */
  public async mget(...keys: string[]): Promise<(string | null)[]> {
    return this.executeCommand(client => client.mget(keys));
  }

  /**
   * Set multiple values in a single operation
   */
  public async mset(items: Record<string, string>): Promise<'OK'> {
    return this.executeCommand(client => client.mset(items));
  }

  /**
   * Create a pipeline for batch operations
   */
  public pipeline(): Pipeline {
    const client = this.getConnection();
    return client.pipeline();
  }

  /**
   * Execute multiple commands in a transaction
   */
  public async multi(): Promise<Pipeline> {
    return this.executeCommand(client => Promise.resolve(client.multi()));
  }

  /**
   * Get current cache statistics
   */
  public getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Flush all stats
   */
  public flushStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      operations: 0,
      latencyMs: {
        avg: 0,
        p95: 0,
        p99: 0,
      },
    };
    this.latencyValues = [];
  }

  /**
   * Close all connections
   */
  public shutdown(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    if (this.circuitBreakerTimer) {
      clearTimeout(this.circuitBreakerTimer);
      this.circuitBreakerTimer = null;
    }
    
    this.pool.forEach(client => {
      client.disconnect();
    });
    
    this.emit('shutdown');
    logger.info('Redis client pool shutdown');
  }
}

/**
 * Create a singleton Redis client
 */
let redisClient: OptimizedRedisClient | null = null;

export const getOptimizedRedisClient = (): OptimizedRedisClient => {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set');
    }
    
    redisClient = new OptimizedRedisClient({
      url: redisUrl,
      lazyConnect: false,
      enableAutoPipelining: true,
      maxRetriesPerRequest: 3,
    }, {
      poolSize: 5,
      healthCheckInterval: 30000,
    });
    
    // Handle process exit
    process.on('beforeExit', () => {
      if (redisClient) {
        redisClient.shutdown();
      }
    });
  }
  
  return redisClient;
};

export default getOptimizedRedisClient; 