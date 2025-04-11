import { backupConfig } from '@/config/backup-config';
import { logger } from '@/lib/logger';
import { createClient } from '@supabase/supabase-js';
import { format, subDays } from 'date-fns';

export interface BackupAlert {
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  backupId?: string;
}

export class BackupMonitor {
  private supabase;
  private alertThresholds = {
    failedBackups: 3,
    storageUsage: 0.9, // 90%
    retentionViolations: 1
  };

  constructor(config: typeof backupConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  public async checkBackupHealth(): Promise<BackupAlert[]> {
    const alerts: BackupAlert[] = [];

    try {
      // Check for failed backups
      const failedBackups = await this.checkFailedBackups();
      alerts.push(...failedBackups);

      // Check storage usage
      const storageAlerts = await this.checkStorageUsage();
      alerts.push(...storageAlerts);

      // Check retention compliance
      const retentionAlerts = await this.checkRetentionCompliance();
      alerts.push(...retentionAlerts);

      // Log alerts
      alerts.forEach(alert => {
        if (alert.type === 'error') {
          logger.error(alert.message);
        } else if (alert.type === 'warning') {
          logger.warn(alert.message);
        } else {
          logger.info(alert.message);
        }
      });

      return alerts;
    } catch (error: unknown) {
      logger.error('Error checking backup health:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async checkFailedBackups(): Promise<BackupAlert[]> {
    const alerts: BackupAlert[] = [];
    const cutoffDate = subDays(new Date(), 7);

    const { data: failedBackups, error } = await this.supabase
      .from('backup_metadata')
      .select('*')
      .eq('status', 'failed')
      .gte('created_at', cutoffDate.toISOString());

    if (error) throw error;

    if (failedBackups.length >= this.alertThresholds.failedBackups) {
      alerts.push({
        type: 'error',
        message: `Critical: ${failedBackups.length} failed backups in the last 7 days`,
        timestamp: new Date().toISOString()
      });
    }

    return alerts;
  }

  private async checkStorageUsage(): Promise<BackupAlert[]> {
    const alerts: BackupAlert[] = [];

    try {
      const { data: storageStats, error } = await this.supabase.storage
        .from('backups')
        .list();

      if (error) throw error;

      // Calculate total size of all files
      const totalSize = storageStats.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
      const storageLimit = 5 * 1024 * 1024 * 1024; // 5GB limit
      const usagePercentage = totalSize / storageLimit;

      if (usagePercentage >= this.alertThresholds.storageUsage) {
        alerts.push({
          type: 'warning',
          message: `Warning: Backup storage usage at ${(usagePercentage * 100).toFixed(2)}%`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: unknown) {
      logger.error('Error checking storage usage:', error instanceof Error ? error.message : String(error));
    }

    return alerts;
  }

  private async checkRetentionCompliance(): Promise<BackupAlert[]> {
    const alerts: BackupAlert[] = [];
    const cutoffDate = subDays(new Date(), backupConfig.retentionPeriod);

    const { data: oldBackups, error } = await this.supabase
      .from('backup_metadata')
      .select('*')
      .lt('created_at', cutoffDate.toISOString());

    if (error) throw error;

    if (oldBackups.length > this.alertThresholds.retentionViolations) {
      alerts.push({
        type: 'warning',
        message: `Warning: ${oldBackups.length} backups older than retention period`,
        timestamp: new Date().toISOString()
      });
    }

    return alerts;
  }

  public async sendAlert(alert: BackupAlert): Promise<void> {
    try {
      // Store alert in database
      const { error } = await this.supabase
        .from('backup_alerts')
        .insert({
          type: alert.type,
          message: alert.message,
          timestamp: alert.timestamp,
          backup_id: alert.backupId
        });

      if (error) throw error;

      // Send notification
      await this.sendNotification(alert);
    } catch (error: unknown) {
      logger.error('Error sending alert:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  private async sendNotification(alert: BackupAlert): Promise<void> {
    try {
      // Dynamically import to avoid circular dependencies
      const { NotificationService } = await import('@/services/notification-service');
      const notificationService = new NotificationService();
      
      // Get system admins to notify (in a real implementation, this would come from a database)
      const adminUserIds = process.env.ADMIN_USER_IDS?.split(',') || [];
      
      // Format the message based on alert type
      const subject = `Backup ${alert.type.toUpperCase()}: ${this.getAlertTitle(alert.type)}`;
      
      // Send notifications to all admin users
      for (const userId of adminUserIds) {
        await notificationService.notifyUser(userId, {
          type: 'system',
          subject,
          message: alert.message,
          data: {
            alertType: alert.type,
            timestamp: alert.timestamp,
            backupId: alert.backupId,
            source: 'backup-system'
          }
        });
      }
      
      // Also log the notification
      logger.info(`Backup ${alert.type} notification sent: ${alert.message}`);
      
      // For critical alerts, also send direct emails to ensure delivery
      if (alert.type === 'error') {
        const emergencyEmails = process.env.EMERGENCY_ADMIN_EMAILS?.split(',') || [];
        
        for (const email of emergencyEmails) {
          await notificationService.sendEmailNotification({
            type: 'system',
            recipient: email,
            subject: `URGENT: ${subject}`,
            message: `${alert.message}\n\nTimestamp: ${new Date(alert.timestamp).toLocaleString()}\n${
              alert.backupId ? `Backup ID: ${alert.backupId}` : ''
            }`,
            data: {
              alertType: alert.type,
              timestamp: alert.timestamp,
              backupId: alert.backupId,
              source: 'backup-system',
              priority: 'high'
            }
          });
        }
      }
    } catch (error) {
      // Don't throw here - just log the error to avoid breaking the main flow
      logger.error('Failed to send backup notification:', error instanceof Error ? error.message : String(error));
    }
  }
  
  // Helper to get a standardized title based on alert type
  private getAlertTitle(alertType: BackupAlert['type']): string {
    switch (alertType) {
      case 'error':
        return 'Critical Backup Failure';
      case 'warning':
        return 'Backup Warning';
      case 'info':
      default:
        return 'Backup Information';
    }
  }
} 