import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { env } from '@/config/env';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  uptime: number;
  timestamp: string;
  version: string;
  environment: string;
  components: {
    database: {
      status: 'ok' | 'error';
      responseTime?: number;
    };
    cache?: {
      status: 'ok' | 'error';
      responseTime?: number;
    };
    api?: {
      status: 'ok' | 'degraded' | 'error';
      endpoints: Record<string, {
        status: 'ok' | 'error';
        responseTime?: number;
      }>;
    };
    features: {
      virtualTryOn: boolean;
      abTesting: boolean;
      socialSharing: boolean;
      userPreferences: boolean;
      analytics: boolean;
    };
  };
}

export async function GET() {
  // Start timing this request
  const start = performance.now();

  // Initialize health status
  const health: HealthStatus = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: env.NODE_ENV,
    components: {
      database: {
        status: 'error', // Default to error until we verify connection
      },
      features: {
        virtualTryOn: env.NEXT_PUBLIC_AR_FEATURES_ENABLED === 'true',
        abTesting: env.NEXT_PUBLIC_ENABLE_AB_TESTING === 'true',
        socialSharing: !!env.NEXT_PUBLIC_SHARE_APP_ID,
        userPreferences: true, // Always enabled
        analytics: !!env.NEXT_PUBLIC_ANALYTICS_ID,
      },
      api: {
        status: 'ok',
        endpoints: {}
      }
    },
  };

  // Check database connection
  try {
    const dbStart = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    health.components.database = {
      status: 'ok',
      responseTime: Math.round(performance.now() - dbStart),
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    health.components.database = {
      status: 'error',
    };
    health.status = 'error';
  }

  // Check cache if Redis URL is configured
  if (env.REDIS_URL) {
    try {
      // Use dynamic import to get Redis client
      const redisModule = await import('@/lib/redis');
      const redis = 'default' in redisModule ? redisModule.default : redisModule;
      
      const cacheStart = performance.now();
      await redis.set('health-check', 'ok', 'EX', 60);
      const testValue = await redis.get('health-check');
      
      health.components.cache = {
        status: testValue === 'ok' ? 'ok' : 'error',
        responseTime: Math.round(performance.now() - cacheStart),
      };
      
      if (testValue !== 'ok') {
        health.status = 'degraded';
      }
    } catch (error) {
      console.error('Cache health check failed:', error);
      health.components.cache = {
        status: 'error',
      };
      health.status = 'degraded';
    }
  }

  // Check API endpoints if necessary 
  // (useful for checking other dependent APIs)
  if (env.ANALYTICS_ENDPOINT) {
    try {
      // Check analytics API
      const analyticsStart = performance.now();
      const analyticsResponse = await fetch(`${env.ANALYTICS_ENDPOINT}/health`, {
        method: 'HEAD',
        headers: {
          'X-API-Key': env.ANALYTICS_API_KEY || '',
        },
      });
      
      health.components.api.endpoints.analytics = {
        status: analyticsResponse.ok ? 'ok' : 'error',
        responseTime: Math.round(performance.now() - analyticsStart),
      };
      
      if (!analyticsResponse.ok) {
        health.components.api.status = 'degraded';
        health.status = 'degraded';
      }
    } catch (error) {
      console.error('API health check failed:', error);
      health.components.api.status = 'error';
      health.status = 'degraded';
    }
  }

  // Calculate total response time
  const totalResponseTime = Math.round(performance.now() - start);

  // Return health status with appropriate caching headers
  return NextResponse.json(
    { 
      ...health, 
      responseTime: totalResponseTime 
    },
    { 
      status: health.status === 'ok' ? 200 : health.status === 'degraded' ? 200 : 500,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
} 