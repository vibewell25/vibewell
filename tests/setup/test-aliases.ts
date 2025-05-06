/**
 * Test aliases for module mapping
 * 
 * This file maps import paths to our mock implementations for testing
 */

// This is for vite.config.ts to use as a module resolution alias
export const testAliases = {
  // Auth module mocks
  '@/lib/auth/webauthn': '../../tests/mocks/lib/auth/webauthn',
  '@/lib/auth/two-factor': '../../tests/mocks/lib/auth/two-factor',
  
  // Prisma mock
  '@/lib/prisma': '../../tests/mocks/lib/prisma',
  
  // Service mocks
  '@/lib/services/booking': '../../tests/mocks/lib/services/booking',
  '@/lib/services/payment': '../../tests/mocks/lib/services/payment',
  
  // Backup module mocks
  '@/lib/backup/backup-service': '../../tests/mocks/lib/backup/backup-service',
  '@/config/backup-config': '../../tests/mocks/config/backup-config',
  
  // Redis mock (disabled for now)
  // '../src/lib/redis-client': '../../tests/mocks/lib/redis-client',
}; 