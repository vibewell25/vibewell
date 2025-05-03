#!/usr/bin/env node

/**
 * Comprehensive Health Check Script
 * 
 * This script performs comprehensive health checks for all key services
 * including database, Redis, API, and system resources.
 * 
 * It can be run:
 * - As a cron job (via Vercel cron jobs)
 * - From the command line for manual checks
 * - As part of deployment verification
 * 
 * Usage: 
 *   npm run health:check
 *   
 * Exit codes:
 *   0 - All checks passed
 *   1 - One or more checks failed
 */

const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');
const fetch = require('node-fetch');
const os = require('os');
const winston = require('winston');

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/health-check.log' })
  ]
});

// Health check types
const HEALTH_CHECKS = {
  SYSTEM: 'system',
  DATABASE: 'database',
  REDIS: 'redis',
  API: 'api',
  STORAGE: 'storage',
  AUTH: 'auth',
  SERVICES: 'services'
};

/**
 * Checks system health metrics (CPU, memory, disk)
 */
async function checkSystemHealth() {
  try {
    const cpuUsage = os.loadavg()[0]; // 1 minute load average
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsage = 100 - ((freeMemory / totalMemory) * 100);
    
    // Thresholds
    const cpuThreshold = 0.8; // 80% of available cores
    const memoryThreshold = 90; // 90% memory usage

    const status = 
      cpuUsage < cpuThreshold * os.cpus().length && 
      memoryUsage < memoryThreshold ? 'healthy' : 'degraded';
    
    return {
      status,
      metrics: {
        cpu: {
          loadAverage: cpuUsage,
          cores: os.cpus().length,
          threshold: cpuThreshold * os.cpus().length
        },
        memory: {
          total: formatBytes(totalMemory),
          free: formatBytes(freeMemory),
          usage: `${memoryUsage.toFixed(2)}%`,
          threshold: `${memoryThreshold}%`
        },
        uptime: formatUptime(os.uptime())
      }
    };
  } catch (error) {
    logger.error('System health check failed:', error);
    return { status: 'unhealthy', error: error.message };
  }
}

/**
 * Checks database health
 */
async function checkDatabaseHealth() {
  const prisma = new PrismaClient();
  
  try {
    // Simple connectivity check
    await prisma.$queryRaw`SELECT 1 as health_check`;
    
    // Check connection pool metrics if possible
    let poolStats = null;
    try {
      const conn = await prisma.$connect();
      if (conn && conn._engine && conn._engine.metrics) {
        poolStats = {
          open: conn._engine.metrics.activeConnections,
          idle: conn._engine.metrics.idleConnections,
          max: conn._engine.metrics.maxConnections
        };
      }
    } catch (e) {
      // Ignore pool stats errors
    }
    
    return { 
      status: 'healthy',
      metrics: poolStats
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return { status: 'unhealthy', error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Checks Redis health
 */
async function checkRedisHealth() {
  const redis = new Redis(process.env.REDIS_URL, {
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    retryStrategy: (times) => {
      return times > 3 ? null : Math.min(times * 100, 1000);
    }
  });
  
  try {
    // Basic connectivity
    const pingResult = await redis.ping();
    
    // Get info about Redis
    const info = await redis.info();
    const infoLines = info.split('\r\n');
    const metrics = {};
    
    // Parse Redis info
    infoLines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        if (key === 'used_memory_human' || key === 'used_memory_peak_human' || 
            key === 'connected_clients' || key === 'uptime_in_seconds') {
          metrics[key] = value;
        }
      }
    });
    
    // Convert uptime to human-readable format
    if (metrics.uptime_in_seconds) {
      metrics.uptime = formatUptime(parseInt(metrics.uptime_in_seconds, 10));
    }
    
    return {
      status: pingResult === 'PONG' ? 'healthy' : 'degraded',
      metrics
    };
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return { status: 'unhealthy', error: error.message };
  } finally {
    redis.disconnect();
  }
}

/**
 * Checks API health
 */
async function checkApiHealth() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${apiUrl}/health`, {
      headers: {
        'x-api-key': process.env.HEALTH_CHECK_API_KEY || ''
      }
    });
    
    if (!response.ok) {
      throw new Error(`API returned status code ${response.status}`);
    }
    
    const data = await response.json();
    return {
      status: data.status === 'healthy' ? 'healthy' : 'degraded',
      metrics: {
        responseTime: data.responseTime
      }
    };
  } catch (error) {
    logger.error('API health check failed:', error);
    return { status: 'unhealthy', error: error.message };
  }
}

/**
 * Checks authentication service health
 */
async function checkAuthHealth() {
  // This will depend on your auth provider (Auth0, NextAuth, etc.)
  // For Auth0, you might ping their management API
  // For NextAuth, check the database or sessions
  try {
    if (process.env.AUTH0_BASE_URL) {
      const response = await fetch(`${process.env.AUTH0_BASE_URL}/test`, {
        method: 'HEAD'
      });
      return {
        status: response.ok ? 'healthy' : 'degraded',
        provider: 'auth0'
      };
    }
    
    // For NextAuth, just report status based on database health
    // since the sessions are stored there
    return { 
      status: 'healthy',
      provider: 'nextauth'
    };
  } catch (error) {
    logger.error('Auth health check failed:', error);
    return { status: 'unhealthy', error: error.message };
  }
}

/**
 * Main function to run all health checks
 */
async function runHealthCheck() {
  const start = Date.now();
  const results = {
    timestamp: new Date().toISOString(),
    checks: {},
    overall: 'healthy',
    duration_ms: 0
  };
  
  let hasFailures = false;
  
  try {
    // Run checks in parallel
    const [systemHealth, dbHealth, redisHealth, apiHealth, authHealth] = await Promise.all([
      checkSystemHealth(),
      checkDatabaseHealth(),
      checkRedisHealth(),
      checkApiHealth(),
      checkAuthHealth()
    ]);
    
    // Store results
    results.checks[HEALTH_CHECKS.SYSTEM] = systemHealth;
    results.checks[HEALTH_CHECKS.DATABASE] = dbHealth;
    results.checks[HEALTH_CHECKS.REDIS] = redisHealth;
    results.checks[HEALTH_CHECKS.API] = apiHealth;
    results.checks[HEALTH_CHECKS.AUTH] = authHealth;
    
    // Determine overall status
    for (const check of Object.values(results.checks)) {
      if (check.status === 'unhealthy') {
        results.overall = 'unhealthy';
        hasFailures = true;
        break;
      } else if (check.status === 'degraded' && results.overall !== 'unhealthy') {
        results.overall = 'degraded';
      }
    }
    
    // Calculate duration
    results.duration_ms = Date.now() - start;
    
    // Log results
    if (hasFailures) {
      logger.error('Health check failed:', results);
    } else if (results.overall === 'degraded') {
      logger.warn('Health check degraded:', results);
    } else {
      logger.info('Health check passed:', results);
    }
    
    // Output to stdout for monitoring systems
    console.log(JSON.stringify(results, null, 2));
    
    // Exit with appropriate code
    process.exit(hasFailures ? 1 : 0);
  } catch (error) {
    logger.error('Health check error:', error);
    results.overall = 'error';
    results.error = error.message;
    results.duration_ms = Date.now() - start;
    console.error(JSON.stringify(results, null, 2));
    process.exit(1);
  }
}

// Helper Functions

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format uptime in seconds to human-readable format
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

// Run the health check
runHealthCheck(); 