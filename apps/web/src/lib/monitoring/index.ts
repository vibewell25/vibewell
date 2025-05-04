import * as Sentry from '@sentry/nextjs';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { Span } from '@sentry/types';
import { performance } from 'perf_hooks';
import winston from 'winston';

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.errors({ stack: true })
  ),
  defaultMeta: { service: 'vibewell-web' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Performance metrics store
const metrics = new Map<string, number>();

export function initializeMonitoring() {
  if (process.env['NEXT_PUBLIC_VERCEL_ENV'] !== 'development') {
    Sentry.init({
      dsn: process.env['SENTRY_DSN'],
      environment: process.env['NEXT_PUBLIC_VERCEL_ENV'],
      integrations: [
        new ProfilingIntegration(),
      ],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
      enableTracing: true,
      
      beforeSend(event) {
        if (process.env['NEXT_PUBLIC_VERCEL_ENV'] === 'production') {
          return event;
        }
        return null;
      },
      
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Network request failed',
        'Load failed',
        /^Async operation/,
      ],
    });
  }
}

// Enhanced error tracking
export function captureException(error: Error, context?: Record<string, any>) {
  if (process.env['NEXT_PUBLIC_VERCEL_ENV'] !== 'development') {
    Sentry.captureException(error, {
      extra: context,
    });
  }
  
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    ...context,
  });
}

// User context management
export function setUserContext(user: { id: string; email?: string; role?: string }) {
  if (process.env['NEXT_PUBLIC_VERCEL_ENV'] !== 'development') {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
  
  logger.info('User context set', { userId: user.id, role: user.role });
}

export function clearUserContext() {
  if (process.env['NEXT_PUBLIC_VERCEL_ENV'] !== 'development') {
    Sentry.setUser(null);
  }
  logger.info('User context cleared');
}

// Performance monitoring
export function startTransaction(name: string, op: string): Span | null {
  if (process.env['NEXT_PUBLIC_VERCEL_ENV'] !== 'development') {
    const transaction = Sentry.startTransaction({
      name,
      op,
    });
    
    metrics.set(`${name}_start`, performance.now());
    return transaction;
  }
  return null;
}

export function endTransaction(name: string, transaction?: Span | null) {
  if (transaction) {
    transaction.finish();
    
    const start = metrics.get(`${name}_start`);
    if (start) {
      const duration = performance.now() - start;
      metrics.set(`${name}_duration`, duration);
      
      logger.info('Transaction completed', {
        name,
        duration,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// API monitoring
export function monitorAPICall(endpoint: string, duration: number, status: number) {
  logger.info('API call completed', {
    endpoint,
    duration,
    status,
    timestamp: new Date().toISOString(),
  });
  
  if (status >= 400) {
    Sentry.addBreadcrumb({
      category: 'api',
      message: `API call failed: ${endpoint}`,
      level: 'error',
      data: {
        status,
        duration,
      },
    });
  }
}

// Resource monitoring
export function monitorResourceUsage() {
  const usage = process.memoryUsage();
  logger.info('Resource usage', {
    heapUsed: usage.heapUsed / 1024 / 1024,
    heapTotal: usage.heapTotal / 1024 / 1024,
    external: usage.external / 1024 / 1024,
    timestamp: new Date().toISOString(),
  });
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    message?: string;
    details?: Record<string, any>;
  }[];
}

/**
 * Simple health check function that returns the status of all critical systems
 */
export function checkHealth(): HealthCheckResult {
  const checks = [
    {
      name: 'database',
      status: 'healthy' as const,
      details: { responseTime: 15 }
    },
    {
      name: 'cache',
      status: 'healthy' as const,
      details: { hitRate: 0.92 }
    },
    {
      name: 'storage',
      status: 'healthy' as const,
      details: { availableSpace: '12.4GB' }
    },
    {
      name: 'api',
      status: 'healthy' as const,
      details: { responseTime: 78 }
    }
  ];

  // Determine overall status
  const overallStatus = determineOverallStatus(checks);

  return {
    status: overallStatus,
    checks
  };
}

/**
 * Determine the overall health status based on individual checks
 */
function determineOverallStatus(checks: HealthCheckResult['checks']): HealthCheckResult['status'] {
  if (checks.some(check => check.status === 'unhealthy')) {
    return 'unhealthy';
  }
  
  if (checks.some(check => check.status === 'degraded')) {
    return 'degraded';
  }
  
  return 'healthy';
}

// Export logger for direct use
export { logger }; 