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

// Health check
export function checkHealth(): { status: string; checks: Record<string, boolean> } {
  const checks = {
    memory: process.memoryUsage().heapUsed < 1024 * 1024 * 512, // 512MB limit
    uptime: process.uptime() > 0,
  };
  
  const status = Object.values(checks).every(Boolean) ? 'healthy' : 'unhealthy';
  
  logger.info('Health check performed', {
    status,
    checks,
    timestamp: new Date().toISOString(),
  });
  
  return { status, checks };
}

// Export logger for direct use
export { logger }; 