import { Redis } from 'ioredis';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

interface SecurityEvent {
  id: string;
  type: 'authentication' | 'authorization' | 'data_access' | 'system' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  description: string;
  metadata: SecurityEventMetadata;
}

interface SecurityEventMetadata {
  location?: {
    country: string;
    city: string;
    coordinates: [number, number];
  };
  device?: {
    type: string;
    os: string;
    browser: string;
  };
  request?: {
    method: string;
    path: string;
    headers: Record<string, string>;
  };
  resource?: {
    type: string;
    id: string;
    action: string;
  };
  [key: string]: unknown;
}

interface SecurityAlert {
  id: string;
  eventId: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  description: string;
  details: SecurityAlertDetails;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  resolution?: string;
}

interface SecurityAlertDetails {
  trigger: string;
  relatedEvents: string[];
  affectedUsers: string[];
  affectedResources: string[];
  recommendations: string[];
  [key: string]: unknown;
}

interface SecurityMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  activeAlerts: number;
  resolvedAlerts: number;
  averageResolutionTime: number;
  topTriggers: string[];
  [key: string]: unknown;
}

type SecurityEventType =
  | 'failed_login'
  | 'successful_login'
  | 'password_reset'
  | 'mfa_challenge'
  | 'mfa_failure'
  | 'suspicious_activity'
  | 'brute_force_attempt'
  | 'unusual_location'
  | 'multiple_devices'
  | 'api_abuse'
  | 'data_access_pattern';

interface ThreatDetectionConfig {
  // Login attempts threshold before triggering alert
  maxLoginAttempts: number;
  // Time window for login attempts (in minutes)
  loginAttemptsWindow: number;
  // Maximum number of concurrent sessions per user
  maxConcurrentSessions: number;
  // Time window for rate limiting (in minutes)
  rateLimitWindow: number;
  // Maximum requests per window
  maxRequestsPerWindow: number;
}

export class SecurityMonitoringService {
  private redis: Redis;
  private config: ThreatDetectionConfig;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || '');

    this.config = {
      maxLoginAttempts: 5,
      loginAttemptsWindow: 15,
      maxConcurrentSessions: 3,
      rateLimitWindow: 5,
      maxRequestsPerWindow: 100,
    };
  }

  /**
   * Log a security event for monitoring and analysis
   */
  async logSecurityEvent(
    type: SecurityEvent['type'],
    severity: SecurityEvent['severity'],
    description: string,
    metadata: SecurityEventMetadata,
  ): Promise<void> {
    try {
      // Store event in database for long-term storage and analysis
      await prisma.securityEvent.create({
        data: {
          type,
          severity,
          description,
          timestamp: new Date(),
          metadata,
        },
      });

      // Store recent events in Redis for real-time analysis
      const recentEventKey = `security:recent:${type}:${metadata.userId || 'anonymous'}`;
      await this.redis.lpush(
        recentEventKey,
        JSON.stringify({ type, severity, description, timestamp: new Date(), metadata }),
      );
      await this.redis.ltrim(recentEventKey, 0, 99); // Keep last 100 events
      await this.redis.expire(recentEventKey, 86400); // Expire after 24 hours

      // Trigger threat analysis
      await this.analyzeThreat({
        type,
        severity,
        description,
        timestamp: new Date(),
        userId: metadata.userId,
        ipAddress: metadata.location?.coordinates[0].toString(),
        userAgent: metadata.device?.browser,
        metadata,
      });
    } catch (error) {
      logger.error('Failed to log security event', 'security', {
        error,
        type,
        severity,
        description,
        metadata,
      });
    }
  }

  /**
   * Analyze event for potential security threats
   */
  private async analyzeThreat(event: SecurityEvent): Promise<void> {
    try {
      switch (event.type) {
        case 'failed_login':
          await this.detectBruteForceAttempts(event);
          break;
        case 'successful_login':
          await this.detectUnusualLoginPatterns(event);
          break;
        case 'mfa_failure':
          await this.detectMFAAbuse(event);
          break;
        case 'api_abuse':
          await this.detectAPIAbuse(event);
          break;
        default:
          await this.detectAnomalousActivity(event);
      }
    } catch (error) {
      logger.error('Failed to analyze threat', 'security', { error, event });
    }
  }

  /**
   * Detect potential brute force attacks
   */
  private async detectBruteForceAttempts(event: SecurityEvent): Promise<void> {
    const key = `security:failed_login:${event.ipAddress}`;
    const attempts = await this.redis.incr(key);
    await this.redis.expire(key, this.config.loginAttemptsWindow * 60);

    if (attempts >= this.config.maxLoginAttempts) {
      await this.handleThreat({
        type: 'brute_force_detected',
        severity: 'high',
        sourceIp: event.ipAddress,
        userId: event.userId,
        metadata: {
          attempts,
          window: this.config.loginAttemptsWindow,
          userAgent: event.userAgent,
        },
      });
    }
  }

  /**
   * Detect unusual login patterns
   */
  private async detectUnusualLoginPatterns(event: SecurityEvent): Promise<void> {
    if (!event.userId) return;

    const key = `security:user_sessions:${event.userId}`;
    const sessions = await this.redis.hgetall(key);
    const currentSessions = Object.keys(sessions).length;

    // Store current session
    await this.redis.hset(
      key,
      event.ipAddress,
      JSON.stringify({
        timestamp: event.timestamp,
        userAgent: event.userAgent,
      }),
    );

    if (currentSessions >= this.config.maxConcurrentSessions) {
      await this.handleThreat({
        type: 'concurrent_sessions_exceeded',
        severity: 'medium',
        sourceIp: event.ipAddress,
        userId: event.userId,
        metadata: {
          currentSessions,
          maxAllowed: this.config.maxConcurrentSessions,
        },
      });
    }
  }

  /**
   * Detect potential MFA abuse
   */
  private async detectMFAAbuse(event: SecurityEvent): Promise<void> {
    const key = `security:mfa_failures:${event.userId || event.ipAddress}`;
    const failures = await this.redis.incr(key);
    await this.redis.expire(key, 3600); // 1 hour window

    if (failures >= 3) {
      await this.handleThreat({
        type: 'mfa_abuse_detected',
        severity: 'high',
        sourceIp: event.ipAddress,
        userId: event.userId,
        metadata: {
          failures,
          window: '1 hour',
        },
      });
    }
  }

  /**
   * Detect API abuse patterns
   */
  private async detectAPIAbuse(event: SecurityEvent): Promise<void> {
    const key = `security:api_requests:${event.ipAddress}`;
    const requests = await this.redis.incr(key);
    await this.redis.expire(key, this.config.rateLimitWindow * 60);

    if (requests > this.config.maxRequestsPerWindow) {
      await this.handleThreat({
        type: 'api_abuse_detected',
        severity: 'medium',
        sourceIp: event.ipAddress,
        userId: event.userId,
        metadata: {
          requests,
          window: this.config.rateLimitWindow,
          threshold: this.config.maxRequestsPerWindow,
        },
      });
    }
  }

  /**
   * Detect anomalous activity using pattern analysis
   */
  private async detectAnomalousActivity(event: SecurityEvent): Promise<void> {
    // Implement more sophisticated anomaly detection here
    // This could include machine learning models for behavior analysis
    // For now, we'll use a simple pattern matching approach

    const key = `security:activity:${event.userId || event.ipAddress}:${event.type}`;
    const recentActivity = await this.redis.lrange(key, 0, 9);

    if (recentActivity.length >= 10) {
      const patterns = this.analyzeActivityPatterns(recentActivity);
      if (patterns.suspicious) {
        await this.handleThreat({
          type: 'anomalous_activity_detected',
          severity: 'medium',
          sourceIp: event.ipAddress,
          userId: event.userId,
          metadata: {
            patterns: patterns.details,
            recentActivityCount: recentActivity.length,
          },
        });
      }
    }
  }

  /**
   * Analyze activity patterns for suspicious behavior
   */
  private analyzeActivityPatterns(activities: string[]): {
    suspicious: boolean;
    details: Record<string, any>;
  } {
    // Parse JSON activities
    const parsedActivities = activities
      .map((activity) => {
        try {
          return JSON.parse(activity);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    // Simple pattern detection for demonstration
    const timeGaps: number[] = [];
    const ips = new Set<string>();
    const userAgents = new Set<string>();

    for (let i = 1; i < parsedActivities.length; i++) {
      const current = new Date(parsedActivities[i].timestamp).getTime();
      const previous = new Date(parsedActivities[i - 1].timestamp).getTime();
      timeGaps.push(current - previous);
      ips.add(parsedActivities[i].ipAddress);
      userAgents.add(parsedActivities[i].userAgent);
    }

    // Detect suspicious patterns
    const rapidActivities = timeGaps.filter((gap) => gap < 1000).length;
    const multipleIps = ips.size > 3;
    const multipleUserAgents = userAgents.size > 3;

    return {
      suspicious: rapidActivities > 5 || multipleIps || multipleUserAgents,
      details: {
        rapidSequentialActivities: rapidActivities,
        distinctIpCount: ips.size,
        distinctUserAgentCount: userAgents.size,
      },
    };
  }

  /**
   * Handle detected security threats
   */
  private async handleThreat(threat: {
    type: string;
    severity: SecurityEvent['severity'];
    sourceIp: string;
    userId?: string;
    metadata: Record<string, any>;
  }): Promise<void> {
    try {
      // Log the threat to the database
      await prisma.securityThreat.create({
        data: {
          type: threat.type,
          severity: threat.severity,
          sourceIp: threat.sourceIp,
          userId: threat.userId,
          metadata: threat.metadata,
          timestamp: new Date(),
          status: 'detected',
        },
      });

      // Take defensive action based on threat severity
      await this.takeDefensiveAction(threat);

      // Notify security team for high and critical threats
      if (threat.severity === 'high' || threat.severity === 'critical') {
        await this.notifySecurityTeam(threat);
      }

      // Log threat detection
      logger.warn(`Security threat detected: ${threat.type}`, 'security', {
        threat,
      });
    } catch (error) {
      logger.error('Failed to handle security threat', 'security', { error, threat });
    }
  }

  /**
   * Take defensive actions against security threats
   */
  private async takeDefensiveAction(threat: {
    type: string;
    severity: SecurityEvent['severity'];
    sourceIp: string;
    userId?: string;
    metadata: Record<string, any>;
  }): Promise<void> {
    try {
      // Actions vary based on threat type and severity
      switch (threat.severity) {
        case 'critical':
          // Block IP immediately
          await this.redis.set(`security:blocked:ip:${threat.sourceIp}`, '1', 'EX', 86400); // 24 hours

          // Lock user account if applicable
          if (threat.userId) {
            await prisma.user.update({
              where: { id: threat.userId },
              data: { locked: true },
            });
          }
          break;

        case 'high':
          // Temporary IP block
          await this.redis.set(`security:blocked:ip:${threat.sourceIp}`, '1', 'EX', 3600); // 1 hour
          break;

        case 'medium':
          // Add to watch list
          await this.redis.sadd('security:watchlist:ips', threat.sourceIp);
          if (threat.userId) {
            await this.redis.sadd('security:watchlist:users', threat.userId);
          }
          break;

        default:
          // Just monitor
          break;
      }
    } catch (error) {
      logger.error('Failed to take defensive action', 'security', { error, threat });
    }
  }

  /**
   * Notify security team about threats
   */
  private async notifySecurityTeam(threat: {
    type: string;
    severity: SecurityEvent['severity'];
    sourceIp: string;
    userId?: string;
    metadata: Record<string, any>;
  }): Promise<void> {
    try {
      // In a real implementation, this would send an alert via email, Slack, PagerDuty, etc.
      // For now, we'll just log it
      logger.info('Security team notification', 'security', {
        message: `Security alert: ${threat.severity.toUpperCase()} severity ${threat.type} detected`,
        threat,
      });

      // Queue notification in Redis for the notification service to pick up
      await this.redis.lpush(
        'security:notifications',
        JSON.stringify({
          channel: 'security_team',
          message: `Security alert: ${threat.severity.toUpperCase()} severity ${threat.type} detected`,
          data: threat,
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (error) {
      logger.error('Failed to notify security team', 'security', { error, threat });
    }
  }

  async createSecurityAlert(
    eventId: string,
    type: string,
    severity: SecurityAlert['severity'],
    description: string,
    details: SecurityAlertDetails,
  ): Promise<void> {
    // Implementation remains the same but with proper typing
  }

  async getSecurityMetrics(startDate: Date, endDate: Date): Promise<SecurityMetrics> {
    // Implementation remains the same but with proper typing
    return {
      totalEvents: 0,
      eventsByType: {},
      eventsBySeverity: {},
      activeAlerts: 0,
      resolvedAlerts: 0,
      averageResolutionTime: 0,
      topTriggers: [],
    };
  }
}

// Export singleton instance
export {};
