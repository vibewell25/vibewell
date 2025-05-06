/**
 * Mock backup configuration for testing purposes
 */
export const backupConfig = {
  frequency: 'daily' as const,
  retentionPeriod: 7,
  backupTypes: ['full', 'incremental'] as const,
  encryptionEnabled: true,
  compressionEnabled: true,
  storageLocation: 'cloud' as const,
  tables: ['users', 'profiles', 'bookings', 'payments'],
  maxBackups: 10,
  backupPath: '/tmp/backup-testing'
}; 