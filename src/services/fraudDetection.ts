import { Redis } from 'ioredis';
import { logger } from '@/lib/logger';
import { SecurityMonitoringService } from './securityMonitoring';

interface UserBehavior {
  userId: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  action: string;
  metadata: Record<string, any>;
}

interface FraudScore {
  score: number;
  reasons: string[];
  timestamp: Date;
}

export class FraudDetectionService {
  private redis: Redis;
  private securityMonitoring: SecurityMonitoringService;
  private readonly scoreThreshold = 0.7;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || '');
    this.securityMonitoring = new SecurityMonitoringService();
  }

  /**
   * Analyze user behavior for potential fraud
   */
  async analyzeBehavior(behavior: UserBehavior): Promise<FraudScore> {
    try {
      const features = await this.extractFeatures(behavior);
      const score = await this.calculateRiskScore(features);
      const reasons = await this.determineRiskFactors(features);

      const fraudScore: FraudScore = {
        score,
        reasons,
        timestamp: new Date(),
      };

      // Store the fraud score
      await this.storeFraudScore(behavior.userId, fraudScore);

      // Log high-risk behavior
      if (score >= this.scoreThreshold) {
        await this.securityMonitoring.logEvent({
          type: 'fraud_detection',
          severity: 'high',
          userId: behavior.userId,
          ip: behavior.ip,
          userAgent: behavior.userAgent,
          details: {
            score,
            reasons,
            action: behavior.action,
          },
        });
      }

      return fraudScore;
    } catch (error) {
      logger.error('Fraud detection failed', 'fraud', { error, behavior });
      return {
        score: 0,
        reasons: ['Error in fraud detection'],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Extract behavioral features for analysis
   */
  private async extractFeatures(behavior: UserBehavior): Promise<Record<string, number>> {
    const userId = behavior.userId;
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    try {
      // Get recent actions
      const recentActions = await this.getRecentActions(userId, hourAgo);

      // Calculate features
      const features: Record<string, number> = {
        actionFrequency: recentActions.length,
        uniqueIPs: new Set(recentActions.map(a => a.ip)).size,
        uniqueUserAgents: new Set(recentActions.map(a => a.userAgent)).size,
        suspiciousActionCount: recentActions.filter(a => this.isSuspiciousAction(a.action)).length,
        timeSinceLastAction: this.getTimeSinceLastAction(recentActions),
        locationVariance: await this.calculateLocationVariance(recentActions),
        riskScore: await this.getUserRiskScore(userId),
      };

      return features;
    } catch (error) {
      logger.error('Feature extraction failed', 'fraud', { error, userId });
      return {
        actionFrequency: 0,
        uniqueIPs: 0,
        uniqueUserAgents: 0,
        suspiciousActionCount: 0,
        timeSinceLastAction: 0,
        locationVariance: 0,
        riskScore: 0,
      };
    }
  }

  /**
   * Calculate risk score based on features
   */
  private async calculateRiskScore(features: Record<string, number>): Promise<number> {
    // Weights for different features
    const weights = {
      actionFrequency: 0.2,
      uniqueIPs: 0.15,
      uniqueUserAgents: 0.15,
      suspiciousActionCount: 0.25,
      timeSinceLastAction: 0.1,
      locationVariance: 0.1,
      riskScore: 0.05,
    };

    // Normalize and combine features
    let score = 0;
    for (const [feature, weight] of Object.entries(weights)) {
      const normalizedValue = this.normalizeFeature(features[feature], feature);
      score += normalizedValue * weight;
    }

    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Determine specific risk factors
   */
  private async determineRiskFactors(features: Record<string, number>): Promise<string[]> {
    const reasons: string[] = [];

    if (features.actionFrequency > 100) {
      reasons.push('Unusually high activity frequency');
    }
    if (features.uniqueIPs > 3) {
      reasons.push('Multiple IP addresses detected');
    }
    if (features.uniqueUserAgents > 2) {
      reasons.push('Multiple devices detected');
    }
    if (features.suspiciousActionCount > 0) {
      reasons.push('Suspicious actions detected');
    }
    if (features.locationVariance > 1000) {
      reasons.push('Unusual location changes');
    }
    if (features.riskScore > 0.7) {
      reasons.push('High historical risk score');
    }

    return reasons;
  }

  /**
   * Store fraud score for future reference
   */
  private async storeFraudScore(userId: string, score: FraudScore): Promise<void> {
    const key = `fraud:score:${userId}`;
    await this.redis.zadd(key, score.timestamp.getTime(), JSON.stringify(score));
    // Keep only last 100 scores
    await this.redis.zremrangebyrank(key, 0, -101);
  }

  /**
   * Get recent user actions
   */
  private async getRecentActions(userId: string, since: Date): Promise<UserBehavior[]> {
    const actions = await this.redis.zrangebyscore(
      `user:actions:${userId}`,
      since.getTime(),
      '+inf'
    );

    return actions.map(action => JSON.parse(action));
  }

  /**
   * Check if an action is suspicious
   */
  private isSuspiciousAction(action: string): boolean {
    const suspiciousActions = [
      'password_reset',
      'mfa_disable',
      'payment_info_change',
      'email_change',
      'high_value_transaction',
    ];
    return suspiciousActions.includes(action);
  }

  /**
   * Calculate time since last action
   */
  private getTimeSinceLastAction(actions: UserBehavior[]): number {
    if (actions.length === 0) return Infinity;

    const lastActionTime = Math.max(...actions.map(a => a.timestamp.getTime()));
    return Date.now() - lastActionTime;
  }

  /**
   * Calculate variance in user locations
   */
  private async calculateLocationVariance(actions: UserBehavior[]): Promise<number> {
    if (actions.length < 2) return 0;

    // This would typically involve geolocation lookup and distance calculation
    // For now, we'll just check if IPs are different
    const uniqueIPs = new Set(actions.map(a => a.ip));
    return uniqueIPs.size > 1 ? 1000 : 0;
  }

  /**
   * Get user's historical risk score
   */
  private async getUserRiskScore(userId: string): Promise<number> {
    const scores = await this.redis.zrange(`fraud:score:${userId}`, -5, -1);

    if (scores.length === 0) return 0;

    const avgScore =
      scores.map(s => JSON.parse(s).score).reduce((a, b) => a + b, 0) / scores.length;

    return avgScore;
  }

  /**
   * Normalize feature values to 0-1 range
   */
  private normalizeFeature(value: number, feature: string): number {
    const ranges: Record<string, [number, number]> = {
      actionFrequency: [0, 100],
      uniqueIPs: [1, 5],
      uniqueUserAgents: [1, 3],
      suspiciousActionCount: [0, 5],
      timeSinceLastAction: [0, 3600000], // 1 hour in ms
      locationVariance: [0, 1000],
      riskScore: [0, 1],
    };

    const [min, max] = ranges[feature];
    return Math.min(Math.max((value - min) / (max - min), 0), 1);
  }
}
