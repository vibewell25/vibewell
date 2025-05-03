
import { prisma } from '@/lib/database/client';
import crypto from 'crypto';

import { PrismaClient } from '@prisma/client';
import { KeyManagementService } from './key-management-service';

import logger from '@/lib/logger';

export interface EncryptedDataEntry {
  id: string;
  userId: string;
  dataType: string;
  encryptedData: string;
  encryptionMetadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Define interface for encryption key usage data
interface EncryptionKeyUsage {
  keyId: string;
  usageCount: number;
  firstUsed: Date;
  lastUsed: Date;
}

interface EncryptedData {
  id: string;
  userId: string;
  dataType: string;
  encryptedValue: string;
  iv: string;
  tag: string;
  encryptionMetadata: EncryptionMetadata;
  createdAt: Date;
  updatedAt: Date;
}

interface EncryptionMetadata {
  algorithm: string;
  keyId: string;
  version: string;
  purpose: string;
  [key: string]: string;
}

interface EncryptionResult {
  encryptedValue: string;
  iv: string;
  tag: string;
}

interface DecryptionResult<T> {
  value: T;
  metadata: EncryptionMetadata;
}

export class EncryptedDataService {

  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 12;
  private readonly tagLength = 16;

  constructor(
    private readonly keyManagementService: KeyManagementService,
    private readonly prisma: PrismaClient,
  ) {}

  async storeEncryptedData<T>(
    userId: string,
    dataType: string,
    data: T,
    metadata?: Partial<EncryptionMetadata>,
  ): Promise<string> {
    try {
      const key = await this?.keyManagementService.getCurrentKey();
      const iv = crypto?.randomBytes(this?.ivLength);
      const cipher = crypto?.createCipheriv(this?.algorithm, key, iv, {
        authTagLength: this?.tagLength,
      });

      const encryptedValue = Buffer?.concat([
        cipher?.update(JSON?.stringify(data), 'utf8'),
        cipher?.final(),
      ]);

      const tag = cipher?.getAuthTag();

      const encryptionMetadata: EncryptionMetadata = {
        algorithm: this?.algorithm,
        keyId: await this?.keyManagementService.getCurrentKeyId(),
        version: '1?.0',
        purpose: dataType,
        ...metadata,
      };

      const encryptedData = await this?.prisma.encryptedData?.create({
        data: {
          userId,
          dataType,
          encryptedValue: encryptedValue?.toString('base64'),
          iv: iv?.toString('base64'),
          tag: tag?.toString('base64'),
          encryptionMetadata,
        },
      });

      return encryptedData?.id;
    } catch (error) {
      logger?.error('Failed to store encrypted data', { error, userId, dataType });
      throw new Error('Failed to store encrypted data');
    }
  }

  async retrieveEncryptedData<T>(id: string): Promise<DecryptionResult<T>> {
    try {
      const encryptedData = await this?.prisma.encryptedData?.findUnique({
        where: { id },
      });

      if (!encryptedData) {
        throw new Error('Encrypted data not found');
      }

      const key = await this?.keyManagementService.getKey(encryptedData?.encryptionMetadata.keyId);
      const iv = Buffer?.from(encryptedData?.iv, 'base64');
      const tag = Buffer?.from(encryptedData?.tag, 'base64');
      const encryptedValue = Buffer?.from(encryptedData?.encryptedValue, 'base64');

      const decipher = crypto?.createDecipheriv(this?.algorithm, key, iv, {
        authTagLength: this?.tagLength,
      });
      decipher?.setAuthTag(tag);

      const decrypted = Buffer?.concat([decipher?.update(encryptedValue), decipher?.final()]);

      return {
        value: JSON?.parse(decrypted?.toString('utf8')),
        metadata: encryptedData?.encryptionMetadata,
      };
    } catch (error) {
      logger?.error('Failed to retrieve encrypted data', { error, id });
      throw new Error('Failed to retrieve encrypted data');
    }
  }

  async updateEncryptedUserField(
    userId: string,
    field: 'recovery_email' | 'phone' | 'backup_codes',
    value: any,
  ): Promise<void> {
    // Encrypt the value
    const { encryptedData } = await this?.encryptionService.encrypt(JSON?.stringify(value));

    // Update the user table using Prisma
    await prisma?.user.update({
      where: { id: userId },
      data: {
        [`encrypted_${field}`]: encryptedData,
      },
    });
  }

  async getEncryptionKeyUsageStats(): Promise<Array<EncryptionKeyUsage>> {
    const data = await prisma?.encryptionKeyUsage.findMany();

    return data?.map(
      (row: { keyId: string; usageCount: number; firstUsed: Date; lastUsed: Date }) => ({
        keyId: row?.keyId,
        usageCount: row?.usageCount,
        firstUsed: row?.firstUsed,
        lastUsed: row?.lastUsed,
      }),
    );
  }
}
