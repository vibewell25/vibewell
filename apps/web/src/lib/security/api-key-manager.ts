import { createHash, randomBytes } from 'crypto';

import redisClient from '@/lib/redis-client';

interface ApiKey {
  key: string;
  expiresAt: number;
  isActive: boolean;
}

export class ApiKeyManager {
  private readonly keyPrefix = 'api:key:';
  private readonly rotationInterval = 7 * 24 * 60 * 60 * 1000; // 7 days

  async generateNewKey(userId: string): Promise<string> {
    const newKey = randomBytes(32).toString('hex');
    const hash = this.hashKey(newKey);
    const expiresAt = Date.now() + this.rotationInterval;

    const apiKey: ApiKey = {
      key: hash,
      expiresAt,
      isActive: true,
    };

    // Store new key
    await redisClient.set(
      `${this.keyPrefix}${userId}:${hash}`,
      JSON.stringify(apiKey),
      'EX',

      Math.ceil(this.rotationInterval / 1000),
    );

    // Keep track of active keys
    await redisClient.sadd(`${this.keyPrefix}${userId}:active`, hash);

    return newKey;
  }

  async validateKey(userId: string, key: string): Promise<boolean> {
    const hash = this.hashKey(key);
    const keyData = await redisClient.get(`${this.keyPrefix}${userId}:${hash}`);

    if (!keyData) return false;

    const apiKey: ApiKey = JSON.parse(keyData);
    return apiKey.isActive && apiKey.expiresAt > Date.now();
  }

  async rotateKey(userId: string): Promise<string> {
    // Generate new key
    const newKey = await this.generateNewKey(userId);

    // Deactivate old keys after a grace period (24 hours)
    setTimeout(
      async () => {
        const activeKeys = await redisClient.smembers(`${this.keyPrefix}${userId}:active`);
        for (const hash of activeKeys) {
          const keyData = await redisClient.get(`${this.keyPrefix}${userId}:${hash}`);
          if (keyData) {
            const apiKey: ApiKey = JSON.parse(keyData);
            if (apiKey.expiresAt < Date.now()) {
              await redisClient.srem(`${this.keyPrefix}${userId}:active`, hash);
              await redisClient.del(`${this.keyPrefix}${userId}:${hash}`);
            }
          }
        }
      },
      24 * 60 * 60 * 1000,
    );

    return newKey;
  }

  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }
}

export {};
