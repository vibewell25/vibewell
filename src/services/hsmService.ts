import { KMS } from 'aws-sdk';
import { logger } from '@/lib/logger';

export class HSMService {
  private kms: KMS;
  private readonly keyAlias: string;

  constructor() {
    this.kms = new KMS({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    });
    this.keyAlias = process.env.KMS_KEY_ALIAS || 'alias/vibewell';
  }

  /**
   * Create a new KMS key
   */
  async createKey(description: string): Promise<string> {
    try {
      const { KeyMetadata } = await this.kms.createKey({
        Description: description,
        KeyUsage: 'ENCRYPT_DECRYPT',
        Origin: 'AWS_KMS',
        MultiRegion: true
      }).promise();

      if (!KeyMetadata.KeyId) {
        throw new Error('Failed to create KMS key');
      }

      // Create alias for the key
      await this.kms.createAlias({
        AliasName: this.keyAlias,
        TargetKeyId: KeyMetadata.KeyId
      }).promise();

      logger.info('Created new KMS key', 'hsm', { keyId: KeyMetadata.KeyId });
      return KeyMetadata.KeyId;
    } catch (error) {
      logger.error('Failed to create KMS key', 'hsm', { error });
      throw error;
    }
  }

  /**
   * Encrypt data using KMS
   */
  async encrypt(data: string | Buffer): Promise<{ ciphertext: Buffer; keyId: string }> {
    try {
      const { CiphertextBlob, KeyId } = await this.kms.encrypt({
        KeyId: this.keyAlias,
        Plaintext: Buffer.from(data)
      }).promise();

      if (!CiphertextBlob || !KeyId) {
        throw new Error('Encryption failed');
      }

      return {
        ciphertext: CiphertextBlob,
        keyId: KeyId
      };
    } catch (error) {
      logger.error('Encryption failed', 'hsm', { error });
      throw error;
    }
  }

  /**
   * Decrypt data using KMS
   */
  async decrypt(ciphertext: Buffer): Promise<Buffer> {
    try {
      const { Plaintext } = await this.kms.decrypt({
        CiphertextBlob: ciphertext
      }).promise();

      if (!Plaintext) {
        throw new Error('Decryption failed');
      }

      return Plaintext;
    } catch (error) {
      logger.error('Decryption failed', 'hsm', { error });
      throw error;
    }
  }

  /**
   * Generate a data key for envelope encryption
   */
  async generateDataKey(): Promise<{
    plaintextKey: Buffer;
    encryptedKey: Buffer;
  }> {
    try {
      const { Plaintext, CiphertextBlob } = await this.kms.generateDataKey({
        KeyId: this.keyAlias,
        KeySpec: 'AES_256'
      }).promise();

      if (!Plaintext || !CiphertextBlob) {
        throw new Error('Failed to generate data key');
      }

      return {
        plaintextKey: Plaintext,
        encryptedKey: CiphertextBlob
      };
    } catch (error) {
      logger.error('Failed to generate data key', 'hsm', { error });
      throw error;
    }
  }

  /**
   * Rotate KMS key
   */
  async rotateKey(): Promise<void> {
    try {
      await this.kms.rotateKey({
        KeyId: this.keyAlias
      }).promise();
      
      logger.info('Rotated KMS key', 'hsm', { keyAlias: this.keyAlias });
    } catch (error) {
      logger.error('Failed to rotate KMS key', 'hsm', { error });
      throw error;
    }
  }

  /**
   * Schedule key deletion (with recovery window)
   */
  async scheduleKeyDeletion(keyId: string, pendingDays: number = 30): Promise<Date> {
    try {
      const { DeletionDate } = await this.kms.scheduleKeyDeletion({
        KeyId: keyId,
        PendingWindowInDays: pendingDays
      }).promise();

      if (!DeletionDate) {
        throw new Error('Failed to schedule key deletion');
      }

      logger.info('Scheduled key deletion', 'hsm', { 
        keyId, 
        deletionDate: DeletionDate 
      });
      
      return DeletionDate;
    } catch (error) {
      logger.error('Failed to schedule key deletion', 'hsm', { error });
      throw error;
    }
  }
} 