import { Redis } from 'ioredis';

import { logger } from '@/lib/logger';
import { SecurityMonitoringService } from './securityMonitoring';
import { DevSecOpsService } from './devSecOps';

interface DeploymentConfig {
  version: string;
  environment: string;
  features: Record<string, boolean>;
  canary: {
    enabled: boolean;
    percentage: number;
    metrics: string[];
  };
}

interface DeploymentMetrics {
  version: string;
  timestamp: Date;
  metrics: {
    errorRate: number;
    responseTime: number;
    cpuUsage: number;
    memoryUsage: number;
    activeUsers: number;
    customMetrics: Record<string, number>;
  };
}

export class DeploymentService {
  private redis: Redis;
  private securityMonitoring: SecurityMonitoringService;
  private devSecOps: DevSecOpsService;
  private readonly keyPrefix = 'deployment';

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || '');
    this.securityMonitoring = new SecurityMonitoringService();
    this.devSecOps = new DevSecOpsService();
  }

  /**
   * Start a new deployment
   */
  async startDeployment(config: DeploymentConfig): Promise<void> {
    try {
      // Run security checks
      const securityScan = await this.devSecOps.runSecurityScan();
      const { blocked, reason } = await this.devSecOps.shouldBlockDeployment(securityScan);

      if (blocked) {
        throw new Error(`Deployment blocked: ${reason}`);
      }

      // Store deployment config
      await this.redis.set(`${this.keyPrefix}:config:${config.version}`, JSON.stringify(config));

      // If canary is enabled, start with small percentage
      if (config.canary.enabled) {
        await this.startCanaryDeployment(config);
      } else {
        await this.fullDeployment(config);
      }

      logger.info('Deployment started', 'deployment', { config });
    } catch (error) {
      logger.error('Deployment failed to start', 'deployment', { error, config });
      throw error;
    }
  }

  /**
   * Start canary deployment
   */
  private async startCanaryDeployment(config: DeploymentConfig): Promise<void> {
    try {
      // Store initial canary percentage
      await this.redis.set(
        `${this.keyPrefix}:canary:${config.version}`,
        JSON.stringify({
          percentage: config.canary.percentage,
          startTime: new Date(),
          status: 'active',
        }),
      );

      // Start monitoring canary metrics
      await this.monitorCanaryMetrics(config);
    } catch (error) {
      logger.error('Canary deployment failed', 'deployment', { error, config });
      throw error;
    }
  }

  /**
   * Monitor canary deployment metrics
   */
  private async monitorCanaryMetrics(config: DeploymentConfig): Promise<void> {
    const monitoringInterval = setInterval(async () => {
      try {
        const metrics = await this.collectMetrics(config.version);
        await this.evaluateCanaryHealth(config, metrics);
      } catch (error) {
        logger.error('Canary monitoring failed', 'deployment', { error, config });
        clearInterval(monitoringInterval);
      }
    }, 60000); // Check every minute

    // Store monitoring reference
    await this.redis.set(
      `${this.keyPrefix}:monitoring:${config.version}`,
      monitoringInterval.toString(),
    );
  }

  /**
   * Evaluate canary deployment health
   */
  private async evaluateCanaryHealth(
    config: DeploymentConfig,
    metrics: DeploymentMetrics,
  ): Promise<void> {
    try {
      const isHealthy = this.checkMetricsHealth(metrics);

      if (!isHealthy) {
        await this.rollbackDeployment(config.version);
        return;
      }

      // If healthy and not at 100%, increase percentage
      const canaryData = await this.redis.get(`${this.keyPrefix}:canary:${config.version}`);

      if (canaryData) {
        const canary = JSON.parse(canaryData);
        if (canary.percentage < 100) {

          const newPercentage = Math.min(canary.percentage * 2, 100);
          await this.updateCanaryPercentage(config.version, newPercentage);
        }
      }
    } catch (error) {
      logger.error('Canary health evaluation failed', 'deployment', {
        error,
        config,
        metrics,
      });
      throw error;
    }
  }

  /**
   * Check if metrics are within healthy thresholds
   */
  private checkMetricsHealth(metrics: DeploymentMetrics): boolean {
    const thresholds = {
      errorRate: 0.01, // 1%
      responseTime: 500, // ms
      cpuUsage: 80, // %
      memoryUsage: 80, // %
    };

    return (
      metrics.metrics.errorRate <= thresholds.errorRate &&
      metrics.metrics.responseTime <= thresholds.responseTime &&
      metrics.metrics.cpuUsage <= thresholds.cpuUsage &&
      metrics.metrics.memoryUsage <= thresholds.memoryUsage
    );
  }

  /**
   * Update canary deployment percentage
   */
  private async updateCanaryPercentage(version: string, percentage: number): Promise<void> {
    const key = `${this.keyPrefix}:canary:${version}`;
    const canaryData = await this.redis.get(key);

    if (canaryData) {
      const canary = JSON.parse(canaryData);
      canary.percentage = percentage;
      await this.redis.set(key, JSON.stringify(canary));

      logger.info('Canary percentage updated', 'deployment', {
        version,
        percentage,
      });
    }
  }

  /**
   * Perform full deployment
   */
  private async fullDeployment(config: DeploymentConfig): Promise<void> {
    try {
      // Update active version
      await this.redis.set(`${this.keyPrefix}:active:${config.environment}`, config.version);

      // Enable all features
      await this.updateFeatureFlags(config.version, config.features);

      logger.info('Full deployment completed', 'deployment', { config });
    } catch (error) {
      logger.error('Full deployment failed', 'deployment', { error, config });
      throw error;
    }
  }

  /**
   * Rollback deployment
   */
  async rollbackDeployment(version: string): Promise<void> {
    try {
      // Get previous version
      const config = await this.getDeploymentConfig(version);
      if (!config) throw new Error('Deployment config not found');

      const previousVersion = await this.redis.get(
        `${this.keyPrefix}:previous:${config.environment}`,
      );

      if (!previousVersion) {
        throw new Error('No previous version found for rollback');
      }

      // Restore previous version
      await this.redis.set(`${this.keyPrefix}:active:${config.environment}`, previousVersion);

      // Stop canary if active
      await this.stopCanary(version);

      // Log rollback
      await this.securityMonitoring.logEvent({
        type: 'deployment_rollback',
        severity: 'high',
        details: {
          version,
          previousVersion,
          reason: 'Unhealthy metrics detected',
        },
      });

      logger.info('Deployment rolled back', 'deployment', {
        version,
        previousVersion,
      });
    } catch (error) {
      logger.error('Rollback failed', 'deployment', { error, version });
      throw error;
    }
  }

  /**
   * Stop canary deployment
   */
  private async stopCanary(version: string): Promise<void> {
    const monitoringInterval = await this.redis.get(`${this.keyPrefix}:monitoring:${version}`);

    if (monitoringInterval) {
      clearInterval(parseInt(monitoringInterval));
      await this.redis.del(`${this.keyPrefix}:monitoring:${version}`);
    }

    await this.redis.del(`${this.keyPrefix}:canary:${version}`);
  }

  /**
   * Get deployment configuration
   */
  private async getDeploymentConfig(version: string): Promise<DeploymentConfig | null> {
    const config = await this.redis.get(`${this.keyPrefix}:config:${version}`);
    return config ? JSON.parse(config) : null;
  }

  /**
   * Update feature flags
   */
  private async updateFeatureFlags(
    version: string,
    features: Record<string, boolean>,
  ): Promise<void> {
    await this.redis.set(`${this.keyPrefix}:features:${version}`, JSON.stringify(features));
  }

  /**
   * Collect deployment metrics
   */
  private async collectMetrics(version: string): Promise<DeploymentMetrics> {
    // This would typically integrate with your monitoring system
    // For now, we'll return mock metrics
    return {
      version,
      timestamp: new Date(),
      metrics: {
        errorRate: Math.random() * 0.02, // 0-2%
        responseTime: Math.random() * 1000, // 0-1000ms
        cpuUsage: Math.random() * 100, // 0-100%
        memoryUsage: Math.random() * 100, // 0-100%
        activeUsers: Math.floor(Math.random() * 1000),
        customMetrics: {},
      },
    };
  }

  /**
   * Check if a request should be routed to canary
   */
  async shouldRouteToCanary(version: string): Promise<boolean> {
    const canaryData = await this.redis.get(`${this.keyPrefix}:canary:${version}`);

    if (!canaryData) return false;

    const canary = JSON.parse(canaryData);
    if (canary.status !== 'active') return false;

    // Route based on percentage
    return Math.random() * 100 < canary.percentage;
  }
}
