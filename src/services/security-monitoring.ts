import { createClient } from '@supabase/supabase-js';
import { Redis } from 'ioredis';
import { logger } from '@/lib/logger';

interface SecurityEvent {
  userId?: string;
  eventType: SecurityEventType;
  timestamp: Date;
  metadata: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  sourceIp: string;
  userAgent: string;
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
  private supabase: ReturnType<typeof createClient>;
  private config: ThreatDetectionConfig;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || '');
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

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
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Store event in Supabase for long-term storage and analysis
      const { error } = await this.supabase
        .from('security_events')
        .insert([{
          user_id: event.userId,
          event_type: event.eventType,
          timestamp: event.timestamp.toISOString(),
          metadata: event.metadata,
          severity: event.severity,
          source_ip: event.sourceIp,
          user_agent: event.userAgent,
        }]);

      if (error) {
        throw error;
      }

      // Store recent events in Redis for real-time analysis
      const recentEventKey = `security:recent:${event.eventType}:${event.userId || 'anonymous'}`;
      await this.redis.lpush(recentEventKey, JSON.stringify(event));
      await this.redis.ltrim(recentEventKey, 0, 99); // Keep last 100 events
      await this.redis.expire(recentEventKey, 86400); // Expire after 24 hours

      // Trigger threat analysis
      await this.analyzeThreat(event);
    } catch (error) {
      logger.error('Failed to log security event', 'security', { error, event });
    }
  }

  /**
   * Analyze event for potential security threats
   */
  private async analyzeThreat(event: SecurityEvent): Promise<void> {
    try {
      switch (event.eventType) {
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
    const key = `security:failed_login:${event.sourceIp}`;
    const attempts = await this.redis.incr(key);
    await this.redis.expire(key, this.config.loginAttemptsWindow * 60);

    if (attempts >= this.config.maxLoginAttempts) {
      await this.handleThreat({
        type: 'brute_force_detected',
        severity: 'high',
        sourceIp: event.sourceIp,
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
    await this.redis.hset(key, event.sourceIp, JSON.stringify({
      timestamp: event.timestamp,
      userAgent: event.userAgent,
    }));

    if (currentSessions >= this.config.maxConcurrentSessions) {
      await this.handleThreat({
        type: 'concurrent_sessions_exceeded',
        severity: 'medium',
        sourceIp: event.sourceIp,
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
    const key = `security:mfa_failures:${event.userId || event.sourceIp}`;
    const failures = await this.redis.incr(key);
    await this.redis.expire(key, 3600); // 1 hour window

    if (failures >= 3) {
      await this.handleThreat({
        type: 'mfa_abuse_detected',
        severity: 'high',
        sourceIp: event.sourceIp,
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
    const key = `security:api_requests:${event.sourceIp}`;
    const requests = await this.redis.incr(key);
    await this.redis.expire(key, this.config.rateLimitWindow * 60);

    if (requests > this.config.maxRequestsPerWindow) {
      await this.handleThreat({
        type: 'api_abuse_detected',
        severity: 'medium',
        sourceIp: event.sourceIp,
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
    
    const key = `security:activity:${event.userId || event.sourceIp}:${event.eventType}`;
    const recentActivity = await this.redis.lrange(key, 0, 9);
    
    if (recentActivity.length >= 10) {
      const patterns = this.analyzeActivityPatterns(recentActivity);
      if (patterns.suspicious) {
        await this.handleThreat({
          type: 'anomalous_activity_detected',
          severity: 'medium',
          sourceIp: event.sourceIp,
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
    const patterns = {
      rapidSuccession: false,
      unusualTiming: false,
      mixedLocations: false,
    };

    try {
      const events = activities.map(a => JSON.parse(a));
      const timestamps = events.map(e => new Date(e.timestamp).getTime());
      
      // Check for rapid succession of events
      const timeDiffs = timestamps.slice(1).map((t, i) => t - timestamps[i]);
      patterns.rapidSuccession = timeDiffs.some(diff => diff < 1000); // Less than 1 second apart
      
      // Check for unusual timing
      const hours = timestamps.map(t => new Date(t).getHours());
      patterns.unusualTiming = hours.some(h => h >= 0 && h <= 5); // Activity between midnight and 5 AM
      
      // Check for mixed locations (if IP geolocation data is available)
      const locations = new Set(events.map(e => e.metadata?.location?.country));
      patterns.mixedLocations = locations.size > 1;
      
      return {
        suspicious: Object.values(patterns).some(Boolean),
        details: patterns,
      };
    } catch (error) {
      logger.error('Failed to analyze activity patterns', 'security', { error });
      return { suspicious: false, details: {} };
    }
  }

  /**
   * Handle detected threats
   */
  private async handleThreat(threat: {
    type: string;
    severity: SecurityEvent['severity'];
    sourceIp: string;
    userId?: string;
    metadata: Record<string, any>;
  }): Promise<void> {
    try {
      // Log the threat
      await this.logSecurityEvent({
        userId: threat.userId,
        eventType: 'suspicious_activity',
        timestamp: new Date(),
        metadata: {
          threatType: threat.type,
          ...threat.metadata,
        },
        severity: threat.severity,
        sourceIp: threat.sourceIp,
        userAgent: threat.metadata.userAgent || 'Unknown',
      });

      // Take immediate action based on severity
      if (threat.severity === 'high' || threat.severity === 'critical') {
        await this.takeDefensiveAction(threat);
      }

      // Notify security team
      await this.notifySecurityTeam(threat);
    } catch (error) {
      logger.error('Failed to handle threat', 'security', { error, threat });
    }
  }

  /**
   * Take defensive action against detected threats
   */
  private async takeDefensiveAction(threat: {
    type: string;
    severity: SecurityEvent['severity'];
    sourceIp: string;
    userId?: string;
    metadata: Record<string, any>;
  }): Promise<void> {
    try {
      // Block IP address
      if (threat.severity === 'critical') {
        await this.redis.sadd('security:blocked_ips', threat.sourceIp);
        await this.redis.expire('security:blocked_ips', 86400); // Block for 24 hours
      }

      // Lock user account if necessary
      if (threat.userId && (threat.type === 'brute_force_detected' || threat.type === 'mfa_abuse_detected')) {
        await this.supabase
          .from('users')
          .update({ locked: true })
          .eq('id', threat.userId);
      }

      // Implement additional defensive measures as needed
    } catch (error) {
      logger.error('Failed to take defensive action', 'security', { error, threat });
    }
  }

  /**
   * Notify security team of detected threats
   */
  private async notifySecurityTeam(threat: {
    type: string;
    severity: SecurityEvent['severity'];
    sourceIp: string;
    userId?: string;
    metadata: Record<string, any>;
  }): Promise<void> {
    try {
      // Implement notification logic (e.g., email, Slack, etc.)
      // This is a placeholder for actual implementation
      logger.warn('Security threat detected', 'security', {
        threat,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to notify security team', 'security', { error, threat });
    }
  }
}

// Export singleton instance
export const securityMonitoring = new SecurityMonitoringService(); 