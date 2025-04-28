#!/usr/bin/env node

/**
 * Backup Monitoring Script
 *
 * This script checks the status of backups and sends notifications
 * for any detected issues.
 *
 * Usage: node monitor-backups.js
 */

import { BackupMonitor } from '../lib/backup/backup-monitor';
import { backupConfig } from '../config/backup-config';
import { logger } from '../lib/logger';

async function monitorBackups() {
  logger.info('Starting backup monitoring check');

  try {
    // Initialize the backup monitor
    const monitor = new BackupMonitor(backupConfig);

    // Check for any backup health issues
    const alerts = await monitor.checkBackupHealth();

    if (alerts.length === 0) {
      logger.info('Backup monitoring completed: No issues detected');
      return;
    }

    // Log found issues
    logger.info(`Backup monitoring found ${alerts.length} issues`);

    // Send notifications for each alert
    for (const alert of alerts) {
      await monitor.sendAlert(alert);
      logger.info(`Sent alert for: ${alert.message}`);
    }

    logger.info('Backup monitoring completed: Alerts sent');
  } catch (error) {
    logger.error(
      'Error in backup monitoring:',
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

// Execute the monitoring function
monitorBackups()
  .then(() => {
    logger.info('Backup monitoring script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error(
      'Unhandled error in backup monitoring script:',
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  });
