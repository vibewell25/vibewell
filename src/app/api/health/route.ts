import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// Helper to check if the request is coming from an allowed IP
function isAllowedIP(ip: string): boolean {
  const allowedIPs = process.env['HEALTH_CHECK_ALLOWED_IPS']?.split(',') || ['127.0.0.1', '::1'];
  return allowedIPs.includes(ip);
}

// Helper to validate API key
function isValidApiKey(apiKey: string | null): boolean {
  const validApiKey = process.env['HEALTH_CHECK_API_KEY'];
  return validApiKey !== undefined && apiKey === validApiKey;
}

// Simple rate limiter for health check endpoint
const ipRequestCounts = new Map<string, { count: number, resetTime: number }>();
async function checkRateLimit(ip: string): Promise<{ 
  success: boolean, 
  limit: number, 
  remaining: number, 
  reset: number 
}> {
  const MAX_REQUESTS = 10;
  const WINDOW_MS = 60 * 1000; // 1 minute
  
  const now = Date.now();
  const record = ipRequestCounts.get(ip) || { count: 0, resetTime: now + WINDOW_MS };
  
  // Reset count if window expired
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + WINDOW_MS;
  }
  
  record.count += 1;
  ipRequestCounts.set(ip, record);
  
  return {
    success: record.count <= MAX_REQUESTS,
    limit: MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - record.count),
    reset: record.resetTime
  };
}

// Simple function to get client IP from request
function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0];
    return firstIp ? firstIp.trim() : '127.0.0.1';
  }
  return '127.0.0.1';
}

export async function GET(request: Request) {
  const start = Date.now();
  
  try {
    // Get request IP and headers
    const ip = getClientIp(request);
    const apiKey = request.headers.get('x-api-key');
    const userAgent = request.headers.get('user-agent') || '';
    
    // Check if this is a monitoring service
    const isMonitoringService = userAgent.toLowerCase().includes('monitoring') || 
                               userAgent.toLowerCase().includes('health-check') ||
                               userAgent.toLowerCase().includes('uptime');
    
    // Apply rate limit for non-monitoring services
    if (!isMonitoringService) {
      const { success, limit, remaining, reset } = await checkRateLimit(ip);
      
      if (!success) {
        logger.warn(`Rate limit exceeded for health check from IP: ${ip}`);
        return NextResponse.json(
          { status: 'error', message: 'Rate limit exceeded' },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
            }
          }
        );
      }
    }
    
    // Check authorization - either valid API key or allowed IP
    if (!isValidApiKey(apiKey) && !isAllowedIP(ip)) {
      logger.warn(`Unauthorized health check access attempt from IP: ${ip}`);
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Perform actual health check
    // Add any critical service checks here
    
    const responseTime = Date.now() - start;
    logger.info(`Health check successful, response time: ${responseTime}ms`);
    
    return NextResponse.json(
      { 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      }
    );
  } catch (error) {
    logger.error('Health check failed:', error);
    return NextResponse.json(
      { status: 'unhealthy', error: 'Service check failed' },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      }
    );
  }
}
