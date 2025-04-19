import { prisma } from '@/lib/database/client';
import { prisma } from '@/lib/database/client';
import { format } from 'date-fns';
import { createCipheriv, createDecipheriv, randomBytes, scrypt, CipherGCMTypes } from 'crypto';
import { promisify } from 'util';
import { gzip, gunzip } from 'zlib';
import { encryptionConfig, compressionConfig } from '@/config/backup-config';
import { logger } from '@/lib/logger';
import { backupConfig } from '@/config/backup-config';

export interface BackupConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  retentionPeriod: number; // in days
  backupTypes: ('full' | 'incremental')[];
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
  storageLocation: 'local' | 's3' | 'gcs';
  supabaseUrl?: string;
  supabaseKey?: string;
}

export interface BackupMetadata {
  id: string;
  timestamp: string;
  type: 'full' | 'incremental';
  size: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  location: string;
  checksum: string;
}

export class BackupService {
  private config: BackupConfig;
  private backupBucket: string;
  private backupClient: typeof supabase;
  private encryptionKey: Buffer;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1 second

  constructor(config: BackupConfig) {
    this.config = {
      ...config,
      // Set default values for Supabase URL and key if not provided
      supabaseUrl: config.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000',
      supabaseKey: config.supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key'
    };
    this.backupBucket = 'backups';
    this.backupClient = supabase;
    this.encryptionKey = Buffer.from(this.config.supabaseKey || '', 'hex');
  }

  async initializeBackup(): Promise<void> {
    const { data: bucket, error } = await this.backupClient.storage.createBucket(this.backupBucket, {
      public: false,
      allowedMimeTypes: ['application/json', 'application/octet-stream'],
      fileSizeLimit: 50000000, // 50MB
    });

    if (error) {
      console.error('Error initializing backup bucket:', error);
      throw error;
    }
  }

  public async createFullBackup(): Promise<void> {
    try {
      logger.info('Creating full backup');
      await this.createBackup('full');
    } catch (error: unknown) {
      logger.error('Error creating full backup:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  public async createIncrementalBackup(): Promise<void> {
    try {
      logger.info('Creating incremental backup');
      await this.createBackup('incremental');
    } catch (error: unknown) {
      logger.error('Error creating incremental backup:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  public async createBackup(type: 'full' | 'incremental'): Promise<void> {
    try {
      logger.info(`Creating ${type} backup`);
      
      // Get all tables
      const { data: tables, error: tablesError } = await this.backupClient
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (tablesError) throw tablesError;

      // Backup each table
      for (const table of tables) {
        const { data, error } = await this.backupClient
          .from(table.table_name)
          .select('*');

        if (error) throw error;

        // Process and store backup
        await this.processAndStoreBackup(table.table_name, data, type);
      }

      logger.info(`Completed ${type} backup`);
    } catch (error: unknown) {
      logger.error(`Error during ${type} backup:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async processAndStoreBackup(tableName: string, data: any[], type: 'full' | 'incremental'): Promise<void> {
    try {
      // Convert data to JSON
      const jsonData = JSON.stringify(data);

      // Compress data
      const compressedData = await this.compressData(jsonData);

      // Encrypt data
      const encryptedData = await this.encryptData(compressedData);

      // Store backup
      const timestamp = format(new Date(), 'yyyy-MM-dd-HH-mm-ss');
      const backupPath = `${type}/${tableName}/${timestamp}.backup`;

      const { error: storageError } = await this.backupClient.storage
        .from(this.backupBucket)
        .upload(backupPath, encryptedData, {
          contentType: 'application/octet-stream',
          upsert: true
        });

      if (storageError) throw storageError;

      // Store metadata
      const { error: metadataError } = await this.backupClient
        .from('backup_metadata')
        .insert({
          table_name: tableName,
          backup_type: type,
          backup_path: backupPath,
          created_at: new Date().toISOString(),
          size: encryptedData.length
        });

      if (metadataError) throw metadataError;
    } catch (error: unknown) {
      logger.error(`Error processing backup for table ${tableName}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async compressData(data: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      gzip(data, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  }

  private async encryptData(data: Buffer): Promise<Buffer> {
    const iv = randomBytes(16);
    const salt = randomBytes(16);
    const key = await promisify(scrypt)(this.encryptionKey, salt, 32) as Buffer;
    const cipher = createCipheriv('aes-256-gcm', key, iv);

    const encrypted = Buffer.concat([
      cipher.update(data),
      cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, salt, authTag, encrypted]);
  }

  private async decryptData(data: string): Promise<string> {
    try {
      const [ivBase64, saltBase64, encryptedData] = data.split(':');
      const iv = Buffer.from(ivBase64, 'base64');
      const salt = Buffer.from(saltBase64, 'base64');
      const key = await promisify(scrypt)(this.encryptionKey, salt, encryptionConfig.keySize) as Buffer;
      const decipher = createDecipheriv(encryptionConfig.algorithm as CipherGCMTypes, key, iv);
      
      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw new Error('Failed to decrypt backup data');
    }
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.maxRetries,
    delay: number = this.retryDelay
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }
    
    throw lastError;
  }

  private async updateBackupStatus(backupId: string, status: BackupMetadata['status']): Promise<void> {
    const { error } = await this.backupClient
      .from('backup_metadata')
      .update({ status })
      .eq('id', backupId);

    if (error) throw error;
  }

  async restoreFromBackup(backupId: string): Promise<void> {
    try {
      // Get backup metadata
      const { data: metadata, error: metadataError } = await this.backupClient
        .from('backup_metadata')
        .select('*')
        .eq('id', backupId)
        .single();

      if (metadataError) throw metadataError;

      // Download backup data
      const { data: backupData, error: downloadError } = await this.backupClient.storage
        .from(this.backupBucket)
        .download(`${backupId}/data.json`);

      if (downloadError) throw downloadError;

      // Process backup data
      const processedData = await this.processRestoredData(backupData);

      // Restore each table
      for (const [tableName, tableData] of Object.entries(processedData)) {
        const { error } = await this.backupClient
          .from(tableName)
          .upsert(tableData);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error restoring from backup:', error);
      throw error;
    }
  }

  private async processRestoredData(data: Blob): Promise<Record<string, any>> {
    let processedData = await data.text();

    if (this.config.encryptionEnabled) {
      // Implement decryption
      processedData = await this.decryptData(processedData);
    }

    if (this.config.compressionEnabled) {
      // Implement decompression
      processedData = await this.decompressData(processedData);
    }

    return JSON.parse(processedData);
  }

  private async decompressData(data: string): Promise<string> {
    try {
      const compressedBuffer = Buffer.from(data, 'base64');
      const decompressed = await promisify(gunzip)(compressedBuffer);
      return decompressed.toString('utf8');
    } catch (error) {
      console.error('Error decompressing data:', error);
      throw new Error('Failed to decompress backup data');
    }
  }

  async scheduleBackups(): Promise<void> {
    try {
      const { default: cron } = await import('node-cron');
      const schedule = {
        daily: '0 0 * * *',      // Every day at midnight
        weekly: '0 0 * * 0',     // Every Sunday at midnight
        monthly: '0 0 1 * *',    // First day of each month at midnight
      };
      
      // Check if frequency is valid
      if (!this.config.frequency || !schedule[this.config.frequency]) {
        throw new Error(`Invalid backup frequency: ${this.config.frequency}`);
      }
      
      // Schedule full backup
      const cronExpression = schedule[this.config.frequency];
      logger.info(`Scheduling ${this.config.frequency} backups at ${cronExpression}`);
      
      // Schedule full backups
      const fullBackupJob = cron.schedule(cronExpression, async () => {
        try {
          logger.info(`Starting scheduled ${this.config.frequency} full backup`);
          await this.createFullBackup();
          logger.info(`Completed scheduled ${this.config.frequency} full backup successfully`);
        } catch (error) {
          logger.error(`Error in scheduled full backup:`, error instanceof Error ? error.message : String(error));
          // Notify of backup failure
          await this.notifyBackupFailure('full', error);
        }
      });
      
      // Schedule weekly cleanup
      const cleanupJob = cron.schedule('0 2 * * 0', async () => {
        try {
          logger.info('Starting scheduled backup cleanup');
          await this.cleanupOldBackups();
          logger.info('Completed scheduled backup cleanup successfully');
        } catch (error) {
          logger.error('Error in scheduled backup cleanup:', error instanceof Error ? error.message : String(error));
        }
      });
      
      // Start all jobs
      fullBackupJob.start();
      cleanupJob.start();
      
      logger.info('Backup scheduling initialized successfully');
      
      return Promise.resolve();
    } catch (error) {
      logger.error('Error scheduling backups:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
  
  // Helper method to notify of backup failures
  private async notifyBackupFailure(backupType: 'full' | 'incremental', error: unknown): Promise<void> {
    try {
      // Import the BackupMonitor class
      const { BackupMonitor } = await import('./backup-monitor');
      const monitor = new BackupMonitor(backupConfig);
      
      // Send alert about the failure
      await monitor.sendAlert({
        type: 'error',
        message: `Backup failure: ${backupType} backup failed - ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString()
      });
      
      logger.info(`Backup failure notification sent for ${backupType} backup`);
    } catch (notifyError) {
      logger.error('Failed to send backup failure notification:', 
        notifyError instanceof Error ? notifyError.message : String(notifyError));
    }
  }

  public async cleanupOldBackups(): Promise<void> {
    try {
      logger.info('Cleaning up old backups');
      
      // Get backups older than retention period
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - backupConfig.retentionPeriod);

      const { data: oldBackups, error: listError } = await this.backupClient
        .from('backup_metadata')
        .select('*')
        .lt('created_at', cutoffDate.toISOString());

      if (listError) throw listError;

      // Delete old backups
      for (const backup of oldBackups) {
        // Delete from storage
        const { error: storageError } = await this.backupClient.storage
          .from(this.backupBucket)
          .remove([backup.backup_path]);

        if (storageError) throw storageError;

        // Delete metadata
        const { error: metadataError } = await this.backupClient
          .from('backup_metadata')
          .delete()
          .eq('id', backup.id);

        if (metadataError) throw metadataError;
      }

      logger.info('Completed backup cleanup');
    } catch (error: unknown) {
      logger.error('Error cleaning up old backups:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  public async restoreBackup(backupId: string): Promise<void> {
    try {
      logger.info(`Starting restoration of backup ${backupId}`);
      
      // Get backup metadata
      const { data: backup, error: metadataError } = await this.backupClient
        .from('backup_metadata')
        .select('*')
        .eq('id', backupId)
        .single();

      if (metadataError) throw metadataError;
      if (!backup) throw new Error('Backup not found');

      // Download backup file
      const { data: backupFile, error: downloadError } = await this.backupClient.storage
        .from('backups')
        .download(backup.backup_path);

      if (downloadError) throw downloadError;

      // Decrypt and decompress data
      const backupContent = await backupFile.text();
      const decryptedData = await this.decryptData(backupContent);
      const decompressedData = await this.decompressData(decryptedData);
      const tableData = JSON.parse(decompressedData);

      // Restore table data
      const { error: restoreError } = await this.backupClient
        .from(backup.table_name)
        .upsert(tableData, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (restoreError) throw restoreError;

      logger.info(`Successfully restored backup ${backupId}`);
    } catch (error: unknown) {
      logger.error(`Error restoring backup ${backupId}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  public async verifyBackup(backupId: string): Promise<boolean> {
    try {
      logger.info(`Verifying backup ${backupId}`);
      
      // Get backup metadata
      const { data: backup, error: metadataError } = await this.backupClient
        .from('backup_metadata')
        .select('*')
        .eq('id', backupId)
        .single();

      if (metadataError) throw metadataError;
      if (!backup) throw new Error('Backup not found');

      // Download backup file
      const { data: backupFile, error: downloadError } = await this.backupClient.storage
        .from('backups')
        .download(backup.backup_path);

      if (downloadError) throw downloadError;

      // Verify file integrity
      const isIntegrityValid = await this.verifyFileIntegrity(backupFile, backup.size);
      if (!isIntegrityValid) {
        logger.error(`Backup ${backupId} failed integrity check`);
        return false;
      }

      // Verify data structure
      const backupContent = await backupFile.text();
      const decryptedData = await this.decryptData(backupContent);
      const decompressedData = await this.decompressData(decryptedData);
      const tableData = JSON.parse(decompressedData);

      const isStructureValid = this.verifyDataStructure(tableData, backup.table_name);
      if (!isStructureValid) {
        logger.error(`Backup ${backupId} failed structure check`);
        return false;
      }

      logger.info(`Backup ${backupId} verification successful`);
      return true;
    } catch (error: unknown) {
      logger.error(`Error verifying backup ${backupId}:`, error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  private async verifyFileIntegrity(file: Blob, expectedSize: number): Promise<boolean> {
    return file.size === expectedSize;
  }

  private verifyDataStructure(data: any[], tableName: string): boolean {
    // Basic structure validation
    if (!Array.isArray(data)) return false;
    
    // Get table schema
    const tableSchema = this.getTableSchema(tableName);
    if (!tableSchema) return false;

    // Verify each record matches schema
    return data.every(record => {
      return Object.keys(tableSchema).every(column => {
        return column in record;
      });
    });
  }

  private getTableSchema(tableName: string): Record<string, string> | null {
    // This would typically query the database schema
    // For now, return a mock schema
    return {
      id: 'string',
      created_at: 'string',
      updated_at: 'string'
    };
  }
} 