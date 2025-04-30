const { checkHealth, logger } = require('../src/lib/monitoring');
const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');

async function runHealthCheck() {
  const checks = {
    system: false,
    database: false,
    redis: false,
    api: false
  };

  try {
    // System health
    const systemHealth = checkHealth();
    checks.system = systemHealth.status === 'healthy';

    // Database health
    const prisma = new PrismaClient();
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch (error) {
      logger.error('Database health check failed:', error);
    } finally {
      await prisma.$disconnect();
    }

    // Redis health
    const redis = new Redis(process.env.REDIS_URL, {
      password: process.env.REDIS_PASSWORD,
      tls: process.env.REDIS_TLS === 'true' ? {} : undefined
    });
    try {
      await redis.ping();
      checks.redis = true;
    } catch (error) {
      logger.error('Redis health check failed:', error);
    } finally {
      redis.disconnect();
    }

    // API health
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
      checks.api = response.ok;
    } catch (error) {
      logger.error('API health check failed:', error);
    }

    // Log results
    const allHealthy = Object.values(checks).every(Boolean);
    if (allHealthy) {
      logger.info('All health checks passed', { checks });
    } else {
      logger.warn('Some health checks failed', { checks });
    }

    // Exit with appropriate code
    process.exit(allHealthy ? 0 : 1);
  } catch (error) {
    logger.error('Health check failed:', error);
    process.exit(1);
  }
}

runHealthCheck(); 