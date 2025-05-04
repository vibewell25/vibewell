import Redis from 'ioredis';

import redisTLSConfig, { defaultPorts } from '../config/redis-tls';

class RedisService {
  private static instance: RedisService;
  private clients: Map<number, Redis>;
  private readonly defaultExpiration = 900; // 15 minutes in seconds

  private constructor() {
    this.clients = new Map();
    this.initializeConnections();
  }

  private initializeConnections(): void {
    try {
      // Initialize standard connection
      this.clients.set(
        defaultPorts.standard,
        new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: defaultPorts.standard,
          password: process.env.REDIS_PASSWORD,
        }),
      );

      // Initialize TLS connection
      this.clients.set(
        defaultPorts.tls,
        new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: defaultPorts.tls,
          password: process.env.REDIS_PASSWORD,
          ...redisTLSConfig.getTLSConfig(defaultPorts.tls),
        }),
      );

      // Initialize TLS connection with client authentication
      this.clients.set(
        defaultPorts.tlsClientAuth,
        new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: defaultPorts.tlsClientAuth,
          password: process.env.REDIS_PASSWORD,
          ...redisTLSConfig.getTLSConfig(defaultPorts.tlsClientAuth),
        }),
      );

      // Set up error handlers
      for (const [port, client] of this.clients) {
        client.on('error', (error) => {
          console.error(`Redis connection error on port ${port}:`, error);
        });
      }
    } catch (error) {
      console.error('Failed to initialize Redis connections:', error);
      throw error;
    }
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  private getClient(useTLS: boolean = false, requireClientAuth: boolean = false): Redis {
    let port = defaultPorts.standard;
    if (useTLS) {
      port = requireClientAuth ? defaultPorts.tlsClientAuth : defaultPorts.tls;
    }

    const client = this.clients.get(port);
    if (!client) {
      throw new Error(`No Redis client available for port ${port}`);
    }
    return client;
  }

  private getKey(userId: string, purpose: string): string {
    return `user:${userId}:${purpose}`;
  }

  async setTemporarySecret(userId: string, secret: string, useTLS: boolean = true): Promise<void> {
    const client = this.getClient(useTLS, true);
    const key = this.getKey(userId, 'temp_secret');
    await client.set(key, secret, 'EX', this.defaultExpiration);
  }

  async getTemporarySecret(userId: string, useTLS: boolean = true): Promise<string | null> {
    const client = this.getClient(useTLS, true);
    const key = this.getKey(userId, 'temp_secret');
    return client.get(key);
  }

  async deleteTemporarySecret(userId: string, useTLS: boolean = true): Promise<void> {
    const client = this.getClient(useTLS, true);
    const key = this.getKey(userId, 'temp_secret');
    await client.del(key);
  }

  async cleanup(): Promise<void> {
    for (const client of this.clients.values()) {
      await client.quit();
    }
    this.clients.clear();
  }
}

export default RedisService;
