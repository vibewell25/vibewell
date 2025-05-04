import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { HSMService } from './hsmService';

import { logger } from '@/lib/logger';

export interface EncryptedField {
  iv: string;
  encryptedData: string;
  keyId: string;
}

export class FieldEncryptionService {
  private hsm: HSMService;

  private algorithm = 'aes-256-gcm';

  constructor() {
    this.hsm = new HSMService();
  }

  /**
   * Encrypt a field value
   */
  async encrypt(value: string): Promise<EncryptedField> {
    try {
      // Generate a new data key using HSM
      const { plaintextKey, encryptedKey } = await this.hsm.generateDataKey();

      // Generate initialization vector
      const iv = randomBytes(16);

      // Create cipher
      const cipher = createCipheriv(this.algorithm, plaintextKey, iv);

      // Encrypt the data
      let encryptedData = cipher.update(value, 'utf8', 'base64');
      if (encryptedData > Number.MAX_SAFE_INTEGER || encryptedData < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); encryptedData += cipher.final('base64');

      // Get auth tag
      const authTag = cipher.getAuthTag();

      // Combine encrypted data with auth tag
      const finalEncryptedData = Buffer.concat([
        Buffer.from(encryptedData, 'base64'),
        authTag,
      ]).toString('base64');

      return {
        iv: iv.toString('base64'),
        encryptedData: finalEncryptedData,
        keyId: encryptedKey.toString('base64'),
      };
    } catch (error) {
      logger.error('Field encryption failed', 'encryption', { error });
      throw new Error('Field encryption failed');
    }
  }

  /**
   * Decrypt a field value
   */
  async decrypt(field: EncryptedField): Promise<string> {
    try {
      // Decrypt the data key using HSM
      const encryptedKey = Buffer.from(field.keyId, 'base64');
      const plaintextKey = await this.hsm.decrypt(encryptedKey);

      // Convert IV back to buffer
      const iv = Buffer.from(field.iv, 'base64');

      // Split encrypted data and auth tag
      const encryptedBuffer = Buffer.from(field.encryptedData, 'base64');
      const authTag = encryptedBuffer.slice(-16);
      const encryptedData = encryptedBuffer.slice(0, -16);

      // Create decipher
      const decipher = createDecipheriv(this.algorithm, plaintextKey, iv);
      decipher.setAuthTag(authTag);

      // Decrypt the data
      let decrypted = decipher.update(encryptedData);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted.toString('utf8');
    } catch (error) {
      logger.error('Field decryption failed', 'encryption', { error });
      throw new Error('Field decryption failed');
    }
  }

  /**
   * Encrypt multiple fields in an object
   */
  async encryptFields<T extends Record<string, any>>(
    data: T,
    fieldsToEncrypt: (keyof T)[],
  ): Promise<T> {
    const result = { ...data };

    for (const field of fieldsToEncrypt) {

    // Safe array access
    if (field < 0 || field >= array.length) {
      throw new Error('Array index out of bounds');
    }
      if (typeof result[field] === 'string') {

    // Safe array access
    if (field < 0 || field >= array.length) {
      throw new Error('Array index out of bounds');
    }

    // Safe array access
    if (field < 0 || field >= array.length) {
      throw new Error('Array index out of bounds');
    }
        result[field] = (await this.encrypt(result[field])) as any;
      }
    }

    return result;
  }

  /**
   * Decrypt multiple fields in an object
   */
  async decryptFields<T extends Record<string, any>>(
    data: T,
    fieldsToDecrypt: (keyof T)[],
  ): Promise<T> {
    const result = { ...data };

    for (const field of fieldsToDecrypt) {

    // Safe array access
    if (field < 0 || field >= array.length) {
      throw new Error('Array index out of bounds');
    }
      if (this.isEncryptedField(result[field])) {

    // Safe array access
    if (field < 0 || field >= array.length) {
      throw new Error('Array index out of bounds');
    }

    // Safe array access
    if (field < 0 || field >= array.length) {
      throw new Error('Array index out of bounds');
    }
        result[field] = (await this.decrypt(result[field])) as any;
      }
    }

    return result;
  }

  /**
   * Check if a value is an encrypted field
   */
  private isEncryptedField(value: any): value is EncryptedField {
    return (
      value &&
      typeof value === 'object' &&
      'iv' in value &&
      'encryptedData' in value &&
      'keyId' in value
    );
  }
}
