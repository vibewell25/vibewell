#!/usr/bin/env node

/**
 * Backup Scheduler Script
 *
 * This script sets up cron jobs for automated backups.
 * It loads backup configurations from the database or environment
 * and schedules them according to their cron expressions.
 */

import cron from 'node-cron';
import { BackupService, BackupJobSchedule } from '../utils/backupService';
import fs from 'fs';
import path from 'path';

// Mock database access in this example
// In a real application, this would come from a database
const BACKUP_JOBS: BackupJobSchedule[] = [
  {
    id: 'daily-user-backup',
    name: 'Daily User Data Backup',
    cronExpression: '0 1 * * *', // Every day at 1 AM
    backupConfig: {
      provider: 'aws',
      bucketName: process.env.AWS_BACKUP_BUCKET || 'vibewell-backups',
      region: process.env.AWS_REGION || 'us-west-2',
      prefix: 'users',
      retentionDays: 30,
    },
    enabled: true,
  },
  {
    id: 'weekly-full-backup',
    name: 'Weekly Full Database Backup',
    cronExpression: '0 2 * * 0', // Every Sunday at 2 AM
    backupConfig: {
      provider: 'google',
      bucketName: process.env.GCP_BACKUP_BUCKET || 'vibewell-backups',
      prefix: 'database',
      retentionDays: 90,
    },
    enabled: true,
  },
  {
    id: 'hourly-transactions-backup',
    name: 'Hourly Transactions Backup',
    cronExpression: '0 * * * *', // Every hour
    backupConfig: {
      provider: 'azure',
      bucketName: process.env.AZURE_BACKUP_CONTAINER || 'vibewell-backups',
      prefix: 'transactions',
      retentionDays: 7,
    },
    enabled: process.env.NODE_ENV === 'production', // Only enable in production
  },
];

// Scheduler class to handle backup jobs
class BackupScheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private logDir: string;

  constructor(logDirectory: string = 'logs') {
    this.logDir = logDirectory;
    this.ensureLogDirectory();
  }

  // Make sure log directory exists
  private ensureLogDirectory() {
    const dir = path.resolve(process.cwd(), this.logDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Log backup results
  private logBackupResult(jobId: string, result: any) {
    const logFile = path.resolve(process.cwd(), this.logDir, `${jobId}.log`);
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${JSON.stringify(result)}\n`;

    fs.appendFileSync(logFile, logEntry);
  }

  // Execute a backup job
  private async executeBackupJob(job: BackupJobSchedule) {
    console.log(`Starting backup job: ${job.name} (${job.id})`);

    try {
      // In a real app, this would fetch the actual data to back up
      const data = await this.fetchDataToBackup(job.id);

      // Create a backup service instance with the job's configuration
      const backupService = new BackupService(job.backupConfig);

      // Perform the backup
      const result = await backupService.backup(data, job.id);

      // Log the result
      this.logBackupResult(job.id, result);

      console.log(`Backup job completed: ${job.name} (${job.id})`);
      console.log(`Result: ${result.success ? 'Success' : 'Failed'}`);
      if (result.location) {
        console.log(`Location: ${result.location}`);
      }

      // Clean up old backups
      if (job.backupConfig.retentionDays) {
        const deletedBackups = await backupService.cleanupOldBackups();
        console.log(`Cleaned up ${deletedBackups.length} old backups`);
      }

      return result;
    } catch (error) {
      console.error(`Error executing backup job ${job.id}:`, error);
      this.logBackupResult(job.id, { success: false, error: (error as Error).message });
      throw error;
    }
  }

  // Mock fetching data to back up
  private async fetchDataToBackup(jobId: string): Promise<any> {
    // In a real app, this would query databases or APIs for the data to back up
    console.log(`Fetching data for backup job: ${jobId}`);

    // Just return mock data for this example
    return {
      timestamp: new Date().toISOString(),
      jobId,
      mockData: `Sample data for ${jobId}`,
      records: 1000,
    };
  }

  // Schedule all backup jobs
  public scheduleAllJobs(jobs: BackupJobSchedule[]) {
    jobs.forEach((job) => {
      if (job.enabled) {
        this.scheduleJob(job);
      } else {
        console.log(`Job ${job.id} is disabled, skipping`);
      }
    });
  }

  // Schedule a single backup job
  public scheduleJob(job: BackupJobSchedule) {
    if (this.jobs.has(job.id)) {
      console.log(`Job ${job.id} is already scheduled, stopping it first`);
      this.stopJob(job.id);
    }

    console.log(`Scheduling backup job: ${job.name} (${job.id}) with cron: ${job.cronExpression}`);

    const scheduledJob = cron.schedule(job.cronExpression, async () => {
      await this.executeBackupJob(job);
    });

    this.jobs.set(job.id, scheduledJob);
  }

  // Stop a scheduled job
  public stopJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (job) {
      job.stop();
      this.jobs.delete(jobId);
      console.log(`Stopped job: ${jobId}`);
    }
  }

  // Run a job immediately
  public async runJobNow(jobId: string) {
    const job = BACKUP_JOBS.find((j) => j.id === jobId);
    if (job) {
      return await this.executeBackupJob(job);
    } else {
      throw new Error(`Job not found: ${jobId}`);
    }
  }
}

// Create and start the scheduler
const scheduler = new BackupScheduler();
scheduler.scheduleAllJobs(BACKUP_JOBS);

console.log('Backup scheduler started');
console.log(`Scheduled ${BACKUP_JOBS.filter((job) => job.enabled).length} backup jobs`);

// Handle process shutdown
process.on('SIGINT', () => {
  console.log('Shutting down backup scheduler');
  process.exit(0);
});

// Export scheduler for programmatic use
export default scheduler;
