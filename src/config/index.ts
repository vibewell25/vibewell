import { MonitoringConfig } from '../types/monitoring';

export const config = {
  monitoring: {
    metrics: {
      responseTime: true,
      memoryUsage: true,
      cpuUsage: true,
      networkLatency: true
    },
    alertThresholds: {
      responseTime: 1000, // ms
      memoryUsage: 80, // percentage
      cpuUsage: 70, // percentage
      networkLatency: 200 // ms
    },
    samplingRate: 60000, // 1 minute
    notifications: {
      email: true,
      slack: true,
      pagerduty: false
    }
  } as MonitoringConfig,

  database: {
    maxConnections: 20,
    minConnections: 5,
    connectionTimeout: 10000,
    idleTimeout: 60000,
    maxQueryExecutionTime: 5000
  },

  cache: {
    ttl: 3600, // 1 hour
    maxSize: 1000, // entries
    checkPeriod: 600 // 10 minutes
  },

  api: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    },
    timeout: 30000 // 30 seconds
  },

  optimization: {
    images: {
      quality: 80,
      maxWidth: 1920,
      formats: ['webp', 'avif', 'jpeg'],
      placeholder: {
        quality: 10,
        maxWidth: 50
      }
    },
    js: {
      minChunkSize: 10000, // bytes
      maxChunkSize: 244000, // bytes
      automaticPrefetch: true
    }
  },

  testing: {
    performance: {
      thresholds: {
        pageLoad: 3000, // ms
        apiLatency: 500, // ms
        databaseQuery: 100, // ms
        imageOptimization: 2000, // ms
        cacheResponse: 50, // ms
        serverSideRendering: 1000 // ms
      },
      samples: 5,
      warmupRuns: 2
    }
  }
}; 