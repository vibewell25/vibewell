import { PrismaClient } from '@prisma/client';

export interface DatabaseConfig {
  primary: {
    url: string;
    poolSize: number;
    connectionTimeout: number;
  };
  replicas: {
    urls: string[];
    poolSize: number;
    connectionTimeout: number;
  };
  monitoring: {
    slowQueryThreshold: number;
    logQueries: boolean;
    logSlowQueries: boolean;
  };
}

export const databaseConfig: DatabaseConfig = {
  primary: {
    url: process.env['DATABASE_URL'] || 'postgresql://user:password@localhost:5432/vibewell',
    poolSize: parseInt(process.env['DB_POOL_SIZE'] || '10'),
    connectionTimeout: parseInt(process.env['DB_CONNECTION_TIMEOUT'] || '30000'),
  },
  replicas: {
    urls: (process.env['DATABASE_REPLICA_URLS'] || '').split(',').filter(Boolean),
    poolSize: parseInt(process.env['DB_REPLICA_POOL_SIZE'] || '20'),
    connectionTimeout: parseInt(process.env['DB_REPLICA_CONNECTION_TIMEOUT'] || '30000'),
  },
  monitoring: {
    slowQueryThreshold: parseInt(process.env['SLOW_QUERY_THRESHOLD'] || '1000'),
    logQueries: process.env['LOG_QUERIES'] === 'true',
    logSlowQueries: process.env['LOG_SLOW_QUERIES'] === 'true',
  },
}; 