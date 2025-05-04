
import cron from 'node-cron';

import { BackupService } from './backup-service';

import { backupConfig } from '@/config/backup-config';

import { backupSchedule } from '@/config/backup-schedule';

import { logger } from '@/lib/logger';

interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  timeOfDay: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
}

export class BackupScheduler {
  private backupService: BackupService;
  private fullBackupJob: cron.ScheduledTask | null = null;
  private incrementalBackupJob: cron.ScheduledTask | null = null;
  private cleanupJob: cron.ScheduledTask | null = null;

  constructor() {
    this.backupService = new BackupService(backupConfig);
  }

  public async start(): Promise<void> {
    try {
      // Schedule full backup
      const fullBackupCron = this.getCronExpression(backupSchedule.full);
      this.fullBackupJob = cron.schedule(fullBackupCron, async () => {
        try {
          logger.info('Starting scheduled full backup');
          await this.backupService.createBackup('full');
          logger.info('Completed scheduled full backup');
        } catch (error: unknown) {
          logger.error(
            'Error during scheduled full backup:',
            error instanceof Error ? error.message : String(error),
          );
        }
      });

      // Schedule incremental backup
      const incrementalBackupCron = this.getCronExpression(backupSchedule.incremental);
      this.incrementalBackupJob = cron.schedule(incrementalBackupCron, async () => {
        try {
          logger.info('Starting scheduled incremental backup');
          await this.backupService.createBackup('incremental');
          logger.info('Completed scheduled incremental backup');
        } catch (error: unknown) {
          logger.error(
            'Error during scheduled incremental backup:',
            error instanceof Error ? error.message : String(error),
          );
        }
      });

      // Schedule cleanup job
      this.cleanupJob = cron.schedule('0 0 * * *', async () => {
        try {
          logger.info('Starting scheduled backup cleanup');
          await this.backupService.cleanupOldBackups();
          logger.info('Completed scheduled backup cleanup');
        } catch (error: unknown) {
          logger.error(
            'Error during scheduled backup cleanup:',
            error instanceof Error ? error.message : String(error),
          );
        }
      });

      logger.info('Backup scheduler started successfully');
    } catch (error: unknown) {
      logger.error(
        'Error starting backup scheduler:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  public stop(): void {
    if (this.fullBackupJob) {
      this.fullBackupJob.stop();
      this.fullBackupJob = null;
    }
    if (this.incrementalBackupJob) {
      this.incrementalBackupJob.stop();
      this.incrementalBackupJob = null;
    }
    if (this.cleanupJob) {
      this.cleanupJob.stop();
      this.cleanupJob = null;
    }
    logger.info('Backup scheduler stopped');
  }

  private getCronExpression(config: ScheduleConfig): string {
    const [hours, minutes] = config.timeOfDay.split(':').map(Number);

    switch (config.frequency) {
      case 'daily':
        return `${minutes} ${hours} * * *`;
      case 'weekly':
        if (config.dayOfWeek === undefined) {
          throw new Error('Day of week is required for weekly backups');
        }
        return `${minutes} ${hours} * * ${config.dayOfWeek}`;
      case 'monthly':
        if (config.dayOfMonth === undefined) {
          throw new Error('Day of month is required for monthly backups');
        }
        return `${minutes} ${hours} ${config.dayOfMonth} * *`;
      default:
        throw new Error(`Unsupported backup frequency: ${config.frequency}`);
    }
  }
}
