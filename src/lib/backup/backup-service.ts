/**
 * Backup service implementation
 */

// Backup job status
export type BackupJobStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

// Backup job interface
export interface BackupJob {
  id: string;
  status: BackupJobStatus;
  startedAt: Date;
  completedAt?: Date;
  fileSize?: number;
  filePath?: string;
  error?: string;
}

// Backup restoration job interface
export interface RestoreJob {
  id: string;
  backupId: string;
  status: BackupJobStatus;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

// In-memory storage for backup jobs
const backupJobs: Record<string, BackupJob> = {};
const restoreJobs: Record<string, RestoreJob> = {};

/**
 * Create a new backup job
 */
export async function createBackup(): Promise<BackupJob> {
  const id = `backup_${Date.now()}`;
  const job: BackupJob = {
    id,
    status: 'pending',
    startedAt: new Date()
  };
  
  backupJobs[id] = job;
  
  // Simulate async backup process
  setTimeout(() => {
    const job = backupJobs[id];
    if (job) {
      job.status = 'in_progress';
      
      // Simulate backup taking some time
      setTimeout(() => {
        // 90% chance of success for testing
        if (Math.random() < 0.9) {
          job.status = 'completed';
          job.completedAt = new Date();
          job.fileSize = Math.floor(Math.random() * 1000000); // Random file size
          job.filePath = `/backups/${id}.zip`;
        } else {
          job.status = 'failed';
          job.completedAt = new Date();
          job.error = 'Simulated backup failure';
        }
      }, 2000);
    }
  }, 500);
  
  return job;
}

/**
 * Get a backup job by ID
 */
export async function getBackupJob(id: string): Promise<BackupJob | null> {
  return backupJobs[id] || null;
}

/**
 * List all backup jobs
 */
export async function listBackupJobs(): Promise<BackupJob[]> {
  return Object.values(backupJobs);
}

/**
 * Restore from a backup
 */
export async function restoreFromBackup(backupId: string): Promise<RestoreJob> {
  // Verify the backup exists
  const backup = backupJobs[backupId];
  if (!backup) {
    throw new Error(`Backup ${backupId} not found`);
  }
  
  // Verify the backup completed successfully
  if (backup.status !== 'completed') {
    throw new Error(`Backup ${backupId} is not completed (status: ${backup.status})`);
  }
  
  // Create a restore job
  const id = `restore_${Date.now()}`;
  const job: RestoreJob = {
    id,
    backupId,
    status: 'pending',
    startedAt: new Date()
  };
  
  restoreJobs[id] = job;
  
  // Simulate async restore process
  setTimeout(() => {
    const job = restoreJobs[id];
    if (job) {
      job.status = 'in_progress';
      
      // Simulate restore taking some time
      setTimeout(() => {
        // 90% chance of success for testing
        if (Math.random() < 0.9) {
          job.status = 'completed';
          job.completedAt = new Date();
        } else {
          job.status = 'failed';
          job.completedAt = new Date();
          job.error = 'Simulated restore failure';
        }
      }, 3000);
    }
  }, 500);
  
  return job;
}

/**
 * Get a restore job by ID
 */
export async function getRestoreJob(id: string): Promise<RestoreJob | null> {
  return restoreJobs[id] || null;
}

/**
 * List all restore jobs
 */
export async function listRestoreJobs(): Promise<RestoreJob[]> {
  return Object.values(restoreJobs);
} 