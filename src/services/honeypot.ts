import { Redis } from 'ioredis';
import { logger } from '@/lib/logger';
import { SecurityMonitoringService } from './securityMonitoring';

type HoneypotPayload = {
  [key: string]: string | number | boolean | null | undefined;
};

interface HoneypotEvent {
  timestamp: Date;
  ip: string;
  userAgent: string;
  path: string;
  method: string;
  payload: HoneypotPayload | undefined;
  headers: Record<string, string>;
}

interface HoneypotConfig {
  paths: {
    path: string;
    method: string;
    response: {
      status: number;
      body: HoneypotPayload;
    };
  }[];
  delayResponse?: boolean;
  trackHeaders?: string[];
}

class HoneypotError extends Error {
  constructor(
    message: string,
    public readonly code: 'INVALID_EVENT' | 'VALIDATION_ERROR' | 'PARSE_ERROR' | 'ANALYSIS_FAILED'
  ) {
    super(message);
    this.name = 'HoneypotError';
  }
}

export class HoneypotService {
  private redis: Redis;
  private securityMonitoring: SecurityMonitoringService;
  private config: HoneypotConfig;
  private readonly keyPrefix = 'honeypot';

  constructor(config: HoneypotConfig) {
    this.redis = new Redis(process.env['REDIS_URL'] || '');
    this.securityMonitoring = new SecurityMonitoringService();
    this.config = config;
  }

  /**
   * Check if a request path is a honeypot
   */
  isHoneypotPath(path: string, method: string): boolean {
    return this.config.paths.some(
      (p) => p.path === path && p.method === method
    );
  }

  /**
   * Handle honeypot request
   */
  async handleRequest(
    path: string,
    method: string,
    requestData: {
      ip: string;
      userAgent: string;
      headers: Record<string, string>;
      payload?: Record<string, any>;
    }
  ): Promise<{ status: number; body: Record<string, any> }> {
    try {
      // Record the event
      const event: HoneypotEvent = {
        timestamp: new Date(),
        ip: requestData.ip,
        userAgent: requestData.userAgent,
        path,
        method,
        payload: requestData.payload,
        headers: this.filterHeaders(requestData.headers)
      };

      await this.recordEvent(event);

      // Get configured response
      const honeypotConfig = this.config.paths.find(
        (p) => p.path === path && p.method === method
      );

      if (!honeypotConfig) {
        throw new Error('Invalid honeypot path');
      }

      // Optional delay to make the honeypot more convincing
      if (this.config.delayResponse) {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
      }

      return honeypotConfig.response;
    } catch (error) {
      logger.error('Honeypot request handling failed', 'honeypot', { error });
      throw error;
    }
  }

  /**
   * Record honeypot event
   */
  private async recordEvent(event: HoneypotEvent): Promise<void> {
    try {
      // Store event in Redis
      const key = `${this.keyPrefix}:events:${event.ip}`;
      await this.redis.lpush(key, JSON.stringify(event));
      
      // Keep only last 100 events per IP
      await this.redis.ltrim(key, 0, 99);

      // Check for suspicious patterns
      await this.analyzeEvents(event.ip);

      // Log security event
      await this.securityMonitoring.logEvent({
        type: 'honeypot_triggered',
        severity: 'high',
        ip: event.ip,
        userAgent: event.userAgent,
        details: {
          path: event.path,
          method: event.method,
          payload: event.payload
        }
      });
    } catch (error) {
      logger.error('Failed to record honeypot event', 'honeypot', { error });
      throw error;
    }
  }

  /**
   * Analyze events for suspicious patterns
   */
  private async analyzeEvents(ip: string): Promise<void> {
    try {
      const key = `${this.keyPrefix}:events:${ip}`;
      const events = await this.redis.lrange(key, 0, -1);
      const parsedEvents = events.map(e => this.validateEvent(JSON.parse(e)));

      // Check frequency
      const recentEvents = parsedEvents.filter(
        (e) => new Date().getTime() - new Date(e.timestamp).getTime() < 3600000
      );

      if (recentEvents.length > 10) {
        await this.securityMonitoring.logEvent({
          type: 'honeypot_abuse',
          severity: 'critical',
          ip,
          details: {
            eventCount: recentEvents.length,
            timeWindow: '1 hour'
          }
        });
      }

      // Check for pattern matching (e.g., hitting multiple honeypots)
      const uniquePaths = new Set(recentEvents.map((e) => e.path));
      if (uniquePaths.size > 3) {
        await this.securityMonitoring.logEvent({
          type: 'honeypot_pattern',
          severity: 'critical',
          ip,
          details: {
            uniquePaths: Array.from(uniquePaths),
            timeWindow: '1 hour'
          }
        });
      }
    } catch (error) {
      if (error instanceof HoneypotError) {
        throw error;
      }
      logger.error('Failed to analyze honeypot events', 'honeypot', { error });
      throw new HoneypotError('Event analysis failed', 'ANALYSIS_FAILED');
    }
  }

  /**
   * Filter headers based on configuration
   */
  private filterHeaders(headers: Record<string, string>): Record<string, string> {
    if (!this.config.trackHeaders) return {};

    return Object.fromEntries(
      Object.entries(headers).filter(([key]) =>
        this.config.trackHeaders?.includes(key.toLowerCase())
      )
    );
  }

  private validateEvent(data: unknown): HoneypotEvent {
    if (!data || typeof data !== 'object') {
      throw new HoneypotError('Invalid event data structure', 'VALIDATION_ERROR');
    }

    const event = data as Partial<HoneypotEvent>;
    const requiredFields: Array<keyof HoneypotEvent> = ['timestamp', 'ip', 'path', 'method', 'userAgent'];
    
    for (const field of requiredFields) {
      if (!event[field]) {
        throw new HoneypotError(`Missing required field: ${field}`, 'VALIDATION_ERROR');
      }
    }

    const timestamp = new Date(event.timestamp as string | number | Date);
    if (isNaN(timestamp.getTime())) {
      throw new HoneypotError('Invalid timestamp format', 'VALIDATION_ERROR');
    }

    return {
      timestamp,
      ip: event.ip as string,
      path: event.path as string,
      method: event.method as string,
      userAgent: event.userAgent as string,
      headers: event.headers || {},
      payload: event.payload
    };
  }

  /**
   * Get honeypot events for an IP
   * @throws {HoneypotError} When validation or parsing fails
   */
  async getEvents(ip: string): Promise<HoneypotEvent[]> {
    try {
      const key = `${this.keyPrefix}:events:${ip}`;
      const events = await this.redis.lrange(key, 0, -1);
      return await Promise.all(events.map(async (e) => {
        try {
          const parsed = JSON.parse(e);
          return this.validateEvent(parsed);
        } catch (parseError) {
          throw new HoneypotError(
            `Failed to parse event data: ${(parseError as Error).message}`,
            'PARSE_ERROR'
          );
        }
      }));
    } catch (error) {
      if (error instanceof HoneypotError) {
        throw error;
      }
      logger.error(`Failed to get honeypot events for IP ${ip}: ${error}`);
      return [];
    }
  }
} 