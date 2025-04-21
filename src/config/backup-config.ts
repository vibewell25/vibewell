export interface BackupConfig {
  supabaseUrl: string;
  supabaseKey: string;
  retentionPeriod: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  storageLocation: 'local' | 's3' | 'gcs' | 'supabase';
  monitoringEnabled: boolean;
  alertThresholds: {
    failedBackups: number;
    storageUsage: number;
    retentionViolations: number;
  };
}

export const backupConfig: BackupConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  retentionPeriod: 30, // days
  compressionEnabled: true,
  encryptionEnabled: true,
  storageLocation: 'supabase',
  monitoringEnabled: true,
  alertThresholds: {
    failedBackups: 3,
    storageUsage: 0.9,
    retentionViolations: 1,
  },
};

// Backup schedule configuration
export const backupSchedule = {
  fullBackup: {
    frequency: 'weekly', // Perform full backups weekly
    dayOfWeek: 0, // Sunday
    timeOfDay: '00:00', // Midnight
  },
  incrementalBackup: {
    frequency: 'daily', // Perform incremental backups daily
    timeOfDay: '00:00', // Midnight
  },
};

// Encryption configuration
export const encryptionConfig = {
  algorithm: 'aes-256-gcm',
  keySize: 32, // 256 bits
  ivSize: 12, // 96 bits for GCM
  tagSize: 16, // 128 bits authentication tag
};

// Compression configuration
export const compressionConfig = {
  algorithm: 'gzip',
  level: 6, // Compression level (1-9, where 9 is maximum compression)
};

// Storage configuration
export const storageConfig = {
  s3: {
    bucket: process.env.BACKUP_S3_BUCKET || 'vibewell-backups',
    region: process.env.AWS_REGION || 'us-west-2',
    path: 'database-backups/',
  },
  local: {
    path: process.env.BACKUP_LOCAL_PATH || '/var/backups/vibewell',
  },
  gcs: {
    bucket: process.env.BACKUP_GCS_BUCKET || 'vibewell-backups',
    path: 'database-backups/',
  },
};

// Monitoring and alerting configuration
export const monitoringConfig = {
  enabled: true,
  alertChannels: ['email', 'slack'],
  alertThresholds: {
    backupSize: 1024 * 1024 * 1024, // Alert if backup size exceeds 1GB
    backupDuration: 3600, // Alert if backup takes more than 1 hour
    failedAttempts: 3, // Alert after 3 failed backup attempts
  },
  contacts: {
    email: process.env.BACKUP_ALERT_EMAIL || 'admin@vibewell.com',
    slack: process.env.BACKUP_ALERT_SLACK_WEBHOOK,
  },
};

// Recovery configuration
export const recoveryConfig = {
  automaticRecovery: {
    enabled: true,
    maxAttempts: 3,
    retryDelay: 300, // 5 minutes between retry attempts
  },
  verificationChecks: {
    checksum: true,
    tableCount: true,
    rowCount: true,
    sampleData: true,
  },
  postRecoveryTests: {
    enabled: true,
    testQueries: [
      'SELECT COUNT(*) FROM users',
      'SELECT COUNT(*) FROM profiles',
      'SELECT COUNT(*) FROM sessions',
    ],
  },
};
