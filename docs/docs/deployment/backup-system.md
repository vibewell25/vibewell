# VibeWell Backup and Monitoring System

This document provides detailed information about the VibeWell backup and monitoring system, including its architecture, configuration, and usage.

## Overview

The VibeWell backup system provides automated database backups, retention management, and monitoring to ensure data safety and compliance. It includes:

- Scheduled full and incremental backups
- Data encryption and compression
- Backup verification
- Retention policy enforcement
- Monitoring and alerting
- Restoration capabilities

## Components

### Core Components

1. **BackupService** (`src/lib/backup/backup-service.ts`)
   - Main service for creating, verifying, and restoring backups
   - Handles encryption, compression, and storage
   - Schedules automatic backups using node-cron

2. **BackupMonitor** (`src/lib/backup/backup-monitor.ts`)
   - Monitors backup health and integrity
   - Checks for failed backups, storage usage, and retention compliance
   - Sends alerts for detected issues

3. **Backup Initialization** (`src/app/api/backup/init/route.ts`)
   - API route to initialize the backup system when the application starts
   - Sets up scheduled backups and performs initial health check

4. **Backup Monitoring Script** (`src/scripts/monitor-backups.ts`)
   - Standalone script for monitoring backup health
   - Can be run as a cron job for regular checks

### Configuration Files

1. **Backup Configuration** (`src/config/backup-config.ts`)
   - Central configuration for retention periods, storage locations, etc.
   - Alert thresholds and monitoring settings

2. **Backup Schedule** (`src/config/backup-schedule.ts`)
   - Schedule configuration for full and incremental backups
   - Time and frequency settings

## Setup and Configuration

### Prerequisites

- Node.js (%NODE_VERSION%)
- Access to a Supabase project with storage enabled
- Environment variables for Supabase credentials
- Sufficient storage for backups

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
BACKUP_ENCRYPTION_KEY=your-32-byte-encryption-key
ADMIN_USER_IDS=comma,separated,user,ids
EMERGENCY_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### Installation

1. Add the required dependencies:
   ```bash
   npm install node-cron
   ```

2. Initialize the backup system by starting the application and running:
   ```bash
   npm run backup:init
   ```

3. Set up the monitoring cron job:
   ```bash
   ./scripts/setup-backup-monitoring-cron.sh
   ```

## Usage

### Manual Backup Operations

You can manually trigger backup operations through code:

```typescript
import { BackupService } from '@/lib/backup/backup-service';
import { backupConfig } from '@/config/backup-config';

// Create backup service instance
const backupService = new BackupService({
  frequency: 'daily',
  retentionPeriod: 30,
  backupTypes: ['full', 'incremental'],
  encryptionEnabled: true,
  compressionEnabled: true,
  storageLocation: 'supabase'
});

// Create a full backup
await backupService.createFullBackup();

// Create an incremental backup
await backupService.createIncrementalBackup();

// Clean up old backups
await backupService.cleanupOldBackups();

// Restore a specific backup
await backupService.restoreBackup('backup-id-here');

// Verify a backup
const isValid = await backupService.verifyBackup('backup-id-here');
```

### Monitoring Commands

```bash
# Run the monitoring script manually
npm run backup:monitor

# Initialize the backup system
npm run backup:init
```

## Alerting and Notifications

The system integrates with the VibeWell notification service to send alerts through:

- In-app notifications to system administrators
- Email notifications for critical issues
- Logging to the application's logging system

Alert types:
- **Error**: Critical issues requiring immediate attention
- **Warning**: Potential issues that may need intervention
- **Info**: Informational alerts about normal operations

## Backup Retention and Storage

By default, backups are retained for 30 days before being automatically cleaned up. Storage metrics are monitored to ensure sufficient space, with alerts triggered when storage usage exceeds 90%.

Backups are stored in Supabase Storage, with optional support for S3 or Google Cloud Storage.

## Troubleshooting

Common issues and their solutions:

### Backup Failures

- **Insufficient Storage**: If you receive storage alerts, increase the available storage or adjust the retention period.
- **Database Connection Issues**: Ensure the Supabase credentials are correct and the service is accessible.
- **Encryption Errors**: Verify the encryption key is properly set in environment variables.

### Monitoring Issues

- **No Alerts**: Check that the monitoring cron job is set up correctly and the ADMIN_USER_IDS environment variable is properly configured.
- **False Positives**: Adjust the alert thresholds in the backup configuration if necessary.

### Logs

- Backup operation logs: `logs/backup-operations.log`
- Monitoring logs: `logs/backup-monitoring.log`

## Security

- All backups are encrypted using AES-256-GCM
- Encryption keys are stored as environment variables, not in the codebase
- Access controls are enforced through Supabase's Row Level Security
- Only authorized administrators receive alerts and can manage backups

## Further Development

Planned enhancements:
- Multi-region backup storage
- Point-in-time recovery
- Advanced backup statistics and dashboards
- Integration with external monitoring systems (e.g., Datadog, Grafana) 