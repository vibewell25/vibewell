import Redis, { RedisOptions } from 'ioredis';
import { logger } from '../utils/logger';

interface PoolConfig {
  minConnections: number;
  maxConnections: number;
  acquireTimeout: number;
  redisOptions: RedisOptions;
}

interface PoolStats {
  available: number;
  busy: number;
  pending: number;
  total: number;
}

class RedisConnectionPool {
  private pool: Redis[] = [];
  private busyConnections: Set<Redis> = new Set();
  private pendingRequests: Array<{
    resolve: (connection: Redis) => void;
    reject: (error: Error) => void;
    timestamp: number;
  }> = [];
  private config: PoolConfig;

  constructor(config: PoolConfig) {
    this.config = config;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      for (let i = 0; i < this.config.minConnections; i++) {
        const connection = await this.createConnection();
        this.pool.push(connection);
      }
      logger.info(`Redis connection pool initialized with ${this.config.minConnections} connections`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error initializing Redis connection pool:', errorMessage);
      throw error;
    }
  }

  private async createConnection(): Promise<Redis> {
    const connection = new Redis(this.config.redisOptions);
    
    connection.on('error', (error: Error) => {
      logger.error('Redis connection error:', error.message);
      this.handleConnectionError(connection);
    });

    connection.on('end', () => {
      this.handleConnectionEnd(connection);
    });

    return connection;
  }

  private handleConnectionError(connection: Redis): void {
    this.removeConnection(connection);
    this.createConnection()
      .then(newConnection => {
        this.pool.push(newConnection);
        logger.info('Replaced failed Redis connection with a new one');
      })
      .catch(error => {
        logger.error('Failed to replace Redis connection:', error.message);
      });
  }

  private handleConnectionEnd(connection: Redis): void {
    this.removeConnection(connection);
  }

  private removeConnection(connection: Redis): void {
    const poolIndex = this.pool.indexOf(connection);
    if (poolIndex !== -1) {
      this.pool.splice(poolIndex, 1);
    }
    this.busyConnections.delete(connection);
  }

  public async acquire(): Promise<Redis> {
    if (this.pool.length > 0) {
      const connection = this.pool.pop()!;
      this.busyConnections.add(connection);
      return connection;
    }

    if (this.getTotalConnections() < this.config.maxConnections) {
      const connection = await this.createConnection();
      this.busyConnections.add(connection);
      return connection;
    }

    return new Promise((resolve, reject) => {
      const request = {
        resolve,
        reject,
        timestamp: Date.now()
      };

      this.pendingRequests.push(request);

      setTimeout(() => {
        const index = this.pendingRequests.indexOf(request);
        if (index !== -1) {
          this.pendingRequests.splice(index, 1);
          reject(new Error('Connection acquisition timeout'));
        }
      }, this.config.acquireTimeout);
    });
  }

  public release(connection: Redis): void {
    if (this.busyConnections.has(connection)) {
      this.busyConnections.delete(connection);

      if (this.pendingRequests.length > 0) {
        const request = this.pendingRequests.shift()!;
        this.busyConnections.add(connection);
        request.resolve(connection);
      } else {
        this.pool.push(connection);
      }
    }
  }

  public getStats(): PoolStats {
    return {
      available: this.pool.length,
      busy: this.busyConnections.size,
      pending: this.pendingRequests.length,
      total: this.getTotalConnections()
    };
  }

  private getTotalConnections(): number {
    return this.pool.length + this.busyConnections.size;
  }

  public async disconnect(): Promise<void> {
    const allConnections = [...this.pool, ...this.busyConnections];
    await Promise.all(allConnections.map(connection => connection.quit()));
    this.pool = [];
    this.busyConnections.clear();
    this.pendingRequests.forEach(request => {
      request.reject(new Error('Pool is shutting down'));
    });
    this.pendingRequests = [];
    logger.info('Redis connection pool disconnected');
  }
}

export default RedisConnectionPool; 