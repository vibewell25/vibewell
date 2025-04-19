import { 
  randomBytes, 
  createCipheriv, 
  createDecipheriv,
  scrypt as scryptCallback,
  timingSafeEqual,
  Cipher,
  Decipher,
  BinaryLike
} from 'crypto';
import { promisify } from 'util';
import { Redis } from 'ioredis';
import { logger } from '@/lib/logger';
import { HSMKeyManagementService } from './hsmKeyManagement';

const scrypt = promisify<BinaryLike, BinaryLike, number, Buffer>(scryptCallback);

interface EncryptionKey {
  id: string;
  key: Buffer;
  encryptedKey: Buffer; // HSM-encrypted key
  createdAt: Date;
  expiresAt: Date;
}

export interface EncryptedData {
  encryptedData: string;
  metadata: {
    iv: string;
    keyId: string;
    algorithm: string;
    encryptedKey: string; // Base64 encoded HSM-encrypted key
  };
}

export class EncryptionService {
  private redis: Redis;
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 12; // 96 bits for GCM
  private readonly saltLength = 16;
  private readonly keyRotationInterval = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  private encryptionKey?: Buffer;
  private hsmService: HSMKeyManagementService;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || '');
    this.hsmService = new HSMKeyManagementService();
  }

  /**
   * Generate a new encryption key using HSM
   */
  private async generateKey(): Promise<EncryptionKey> {
    const id = randomBytes(16).toString('hex');
    const { plaintextKey, encryptedKey } = await this.hsmService.generateDataKey();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.keyRotationInterval);

    const keyData: EncryptionKey = {
      id,
      key: plaintextKey,
      encryptedKey,
      createdAt: now,
      expiresAt,
    };

    // Store key in Redis with expiration
    await this.storeKey(keyData);

    return keyData;
  }

  /**
   * Store an encryption key in Redis
   */
  private async storeKey(keyData: EncryptionKey): Promise<void> {
    const keyPrefix = 'encryption:key:';
    const expirationMs = keyData.expiresAt.getTime() - Date.now();

    try {
      await this.redis.set(
        keyPrefix + keyData.id,
        JSON.stringify({
          encryptedKey: keyData.encryptedKey.toString('base64'),
          createdAt: keyData.createdAt.toISOString(),
          expiresAt: keyData.expiresAt.toISOString(),
        }),
        'PX',
        expirationMs
      );
    } catch (error) {
      logger.error('Failed to store encryption key', 'encryption', { error, keyId: keyData.id });
      throw new Error('Failed to store encryption key');
    }
  }

  /**
   * Retrieve and decrypt an encryption key from Redis using HSM
   */
  private async getKey(keyId: string): Promise<EncryptionKey | null> {
    const keyPrefix = 'encryption:key:';

    try {
      const keyData = await this.redis.get(keyPrefix + keyId);
      if (!keyData) return null;

      const parsed = JSON.parse(keyData);
      const encryptedKey = Buffer.from(parsed.encryptedKey, 'base64');
      const key = await this.hsmService.decryptDataKey(encryptedKey);

      return {
        id: keyId,
        key,
        encryptedKey,
        createdAt: new Date(parsed.createdAt),
        expiresAt: new Date(parsed.expiresAt),
      };
    } catch (error) {
      logger.error('Failed to retrieve encryption key', 'encryption', { error, keyId });
      throw new Error('Failed to retrieve encryption key');
    }
  }

  /**
   * Get the current active encryption key or generate a new one
   */
  private async getCurrentKey(): Promise<EncryptionKey> {
    const currentKeyId = await this.redis.get('encryption:current_key_id');
    if (currentKeyId) {
      const key = await this.getKey(currentKeyId);
      if (key && key.expiresAt > new Date()) {
        return key;
      }
    }

    // Generate new key if current key doesn't exist or is expired
    const newKey = await this.generateKey();
    await this.redis.set('encryption:current_key_id', newKey.id);
    return newKey;
  }

  async encrypt(data: string): Promise<EncryptedData> {
    const currentKey = await this.getCurrentKey();
    const iv = randomBytes(this.ivLength);

    const cipher = createCipheriv(
      this.algorithm,
      currentKey.key,
      iv
    );

    let encryptedData = cipher.update(data, 'utf8', 'base64');
    encryptedData += cipher.final('base64');

    // Get the auth tag
    const authTag = cipher.getAuthTag();

    // Combine the encrypted data and auth tag
    const finalEncryptedData = Buffer.concat([
      Buffer.from(encryptedData, 'base64'),
      authTag
    ]).toString('base64');

    return {
      encryptedData: finalEncryptedData,
      metadata: {
        iv: iv.toString('base64'),
        keyId: currentKey.id,
        algorithm: this.algorithm,
        encryptedKey: currentKey.encryptedKey.toString('base64')
      }
    };
  }

  async decrypt(
    encryptedData: string,
    metadata: { iv: string; algorithm: string; keyId: string; encryptedKey: string }
  ): Promise<string> {
    // Get the key using HSM
    const encryptedKeyBuffer = Buffer.from(metadata.encryptedKey, 'base64');
    const key = await this.hsmService.decryptDataKey(encryptedKeyBuffer);

    const decipher = createDecipheriv(
      metadata.algorithm,
      key,
      Buffer.from(metadata.iv, 'base64')
    );

    // Split the auth tag from the encrypted data
    const encryptedBuffer = Buffer.from(encryptedData, 'base64');
    const authTag = encryptedBuffer.slice(-16); // Last 16 bytes is the auth tag
    const actualEncryptedData = encryptedBuffer.slice(0, -16);

    // Set the auth tag
    (decipher as any).setAuthTag(authTag);

    let decrypted = decipher.update(actualEncryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  }

  /**
   * Hash sensitive data (e.g., passwords) using Argon2
   */
  async hash(data: string): Promise<string> {
    const salt = randomBytes(this.saltLength);
    const derivedKey = await scrypt(data, salt, 64);
    return salt.toString('hex') + ':' + derivedKey.toString('hex');
  }

  /**
   * Verify hashed data
   */
  async verify(data: string, hash: string): Promise<boolean> {
    const [salt, key] = hash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = await scrypt(data, Buffer.from(salt, 'hex'), 64);
    return timingSafeEqual(keyBuffer, derivedKey);
  }

  /**
   * Rotate encryption keys using HSM
   */
  async rotateKeys(): Promise<void> {
    try {
      // Generate new key using HSM
      const newKey = await this.generateKey();

      // Get all encrypted data that needs to be re-encrypted
      logger.info('Starting key rotation', 'encryption', {
        oldKeyId: await this.redis.get('encryption:current_key_id'),
        newKeyId: newKey.id,
      });

      // Update current key
      await this.redis.set('encryption:current_key_id', newKey.id);

      // Rotate the master key in HSM
      await this.hsmService.rotateMasterKey();

      logger.info('Key rotation completed', 'encryption', { newKeyId: newKey.id });
    } catch (error) {
      logger.error('Key rotation failed', 'encryption', { error });
      throw new Error('Key rotation failed');
    }
  }

  /**
   * Schedule regular key rotation
   */
  scheduleKeyRotation(): void {
    setInterval(() => {
      this.rotateKeys().catch(error => {
        logger.error('Scheduled key rotation failed', 'encryption', { error });
      });
    }, this.keyRotationInterval);
  }

  // Helper method to rotate encryption keys
  async reencryptData(
    data: string,
    oldKey: Buffer,
    newKey: Buffer
  ): Promise<EncryptedData> {
    const tempService = new EncryptionService();
    const newService = new EncryptionService();

    // Create temporary encryption services with the old and new keys
    const oldKeyData: EncryptionKey = {
      id: randomBytes(16).toString('hex'),
      key: oldKey,
      encryptedKey: await this.hsmService.reencryptDataKey(oldKey),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.keyRotationInterval)
    };

    const newKeyData: EncryptionKey = {
      id: randomBytes(16).toString('hex'),
      key: newKey,
      encryptedKey: await this.hsmService.reencryptDataKey(newKey),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.keyRotationInterval)
    };

    // Store temporary keys
    await this.storeKey(oldKeyData);
    await this.storeKey(newKeyData);

    // Decrypt with old key
    const decrypted = await this.decrypt(data, {
      iv: data,
      algorithm: this.algorithm,
      keyId: oldKeyData.id,
      encryptedKey: oldKeyData.encryptedKey.toString('base64')
    });

    // Re-encrypt with new key
    return newService.encrypt(decrypted);
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService(); 