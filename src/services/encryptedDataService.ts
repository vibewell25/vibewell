import { prisma } from '@/lib/database/client';
import { EncryptionService } from './encryption';

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

export class EncryptedDataService {
  private encryptionService: EncryptionService;

  constructor() {
    this.encryptionService = new EncryptionService();
  }

  async storeEncryptedData(
    userId: string,
    dataType: string,
    data: any
  ): Promise<string> {
    // Encrypt the data
    const { encryptedData, metadata } = await this.encryptionService.encrypt(
      JSON.stringify(data)
    );

    // Store in database using Prisma
    const result = await prisma.$executeRaw`
      SELECT store_encrypted_data(
        ${userId}::uuid,
        ${dataType}::text,
        ${encryptedData}::text,
        ${JSON.stringify(metadata)}::jsonb
      )
    `;

    if (!result) {
      throw new Error('Failed to store encrypted data');
    }

    return result as string;
  }

  async retrieveEncryptedData<T>(
    userId: string,
    dataType: string
  ): Promise<T | null> {
    // Retrieve from database using Prisma
    const result = await prisma.$queryRaw<Array<{
      encrypted_data: string;
      encryption_metadata: Record<string, any>;
    }>>`
      SELECT encrypted_data, encryption_metadata
      FROM encrypted_data
      WHERE user_id = ${userId}::uuid
      AND data_type = ${dataType}::text
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (!result || result.length === 0) {
      return null;
    }

    // Decrypt the data
    const decryptedData = await this.encryptionService.decrypt(
      result[0].encrypted_data,
      result[0].encryption_metadata
    );

    return JSON.parse(decryptedData) as T;
  }

  async updateEncryptedUserField(
    userId: string,
    field: 'recovery_email' | 'phone' | 'backup_codes',
    value: any
  ): Promise<void> {
    // Encrypt the value
    const { encryptedData } = await this.encryptionService.encrypt(
      JSON.stringify(value)
    );

    // Update the user table using Prisma
    await prisma.user.update({
      where: { id: userId },
      data: {
        [`encrypted_${field}`]: encryptedData
      }
    });
  }

  async getEncryptionKeyUsageStats(): Promise<Array<EncryptionKeyUsage>> {
    const data = await prisma.encryptionKeyUsage.findMany();

    return data.map((row: {
      keyId: string;
      usageCount: number;
      firstUsed: Date;
      lastUsed: Date;
    }) => ({
      keyId: row.keyId,
      usageCount: row.usageCount,
      firstUsed: row.firstUsed,
      lastUsed: row.lastUsed
    }));
  }
} 