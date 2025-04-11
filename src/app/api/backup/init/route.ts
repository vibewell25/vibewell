import { BackupService } from '@/lib/backup/backup-service';
import { BackupMonitor } from '@/lib/backup/backup-monitor';
import { backupConfig } from '@/config/backup-config';
import { backupSchedule } from '@/config/backup-schedule';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

// Track if the scheduler is already initialized
let schedulerInitialized = false;

export async function GET() {
  try {
    if (schedulerInitialized) {
      return NextResponse.json({ 
        status: "OK", 
        message: "Backup scheduler already initialized",
        initialized: true
      });
    }

    // Initialize backup service with properly formatted config
    const backupServiceConfig = {
      frequency: backupSchedule.full.frequency,
      retentionPeriod: backupConfig.retentionPeriod,
      backupTypes: ['full', 'incremental'] as ('full' | 'incremental')[],
      encryptionEnabled: backupConfig.encryptionEnabled,
      compressionEnabled: backupConfig.compressionEnabled,
      storageLocation: backupConfig.storageLocation,
    };
    
    const backupService = new BackupService(backupServiceConfig);
    
    // Schedule backups
    await backupService.scheduleBackups();
    
    // Initialize backup monitor to check for any existing issues
    const backupMonitor = new BackupMonitor(backupConfig);
    const alerts = await backupMonitor.checkBackupHealth();
    
    // Send any critical alerts
    for (const alert of alerts) {
      if (alert.type === 'error') {
        await backupMonitor.sendAlert(alert);
      }
    }
    
    // Mark as initialized
    schedulerInitialized = true;
    
    logger.info('Backup system initialized successfully');
    
    return NextResponse.json({ 
      status: "OK", 
      message: "Backup scheduler initialized",
      initialized: true,
      alerts: alerts.length > 0 ? alerts : undefined
    });
  } catch (error) {
    logger.error('Error initializing backup scheduler:', error instanceof Error ? error.message : String(error));
    
    return NextResponse.json(
      { 
        status: "ERROR", 
        message: "Failed to initialize backup scheduler",
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 