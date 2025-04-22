import { Analytics } from 'analytics';
import googleAnalytics from '@analytics/google-analytics';
import mixpanel from '@analytics/mixpanel';
import segment from '@analytics/segment';
import amplitude from '@analytics/amplitude';

interface AnalyticsConfig {
  google?: {
    trackingId: string;
  };
  mixpanel?: {
    token: string;
  };
  segment?: {
    writeKey: string;
  };
  amplitude?: {
    apiKey: string;
  };
}

interface EventData {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: Date;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private analytics: Analytics;
  private enabled: boolean = true;

  private constructor(config: AnalyticsConfig) {
    const plugins = [];

    if (config.google) {
      plugins.push(googleAnalytics({
        trackingId: config.google.trackingId
      }));
    }

    if (config.mixpanel) {
      plugins.push(mixpanel({
        token: config.mixpanel.token
      }));
    }

    if (config.segment) {
      plugins.push(segment({
        writeKey: config.segment.writeKey
      }));
    }

    if (config.amplitude) {
      plugins.push(amplitude({
        apiKey: config.amplitude.apiKey
      }));
    }

    this.analytics = Analytics({
      app: 'vibewell',
      plugins
    });
  }

  public static getInstance(config?: AnalyticsConfig): AnalyticsService {
    if (!AnalyticsService.instance && config) {
      AnalyticsService.instance = new AnalyticsService(config);
    }
    return AnalyticsService.instance;
  }

  public async trackEvent(data: EventData): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.analytics.track(data.event, {
        ...data.properties,
        userId: data.userId,
        timestamp: data.timestamp || new Date()
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  public async identifyUser(userId: string, traits?: Record<string, any>): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.analytics.identify(userId, traits);
    } catch (error) {
      console.error('Analytics identify error:', error);
    }
  }

  public async page(name: string, properties?: Record<string, any>): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.analytics.page({
        name,
        properties
      });
    } catch (error) {
      console.error('Analytics page tracking error:', error);
    }
  }

  public async group(groupId: string, traits?: Record<string, any>): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.analytics.group(groupId, traits);
    } catch (error) {
      console.error('Analytics group error:', error);
    }
  }

  public enable(): void {
    this.enabled = true;
  }

  public disable(): void {
    this.enabled = false;
  }

  public async reset(): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.analytics.reset();
    } catch (error) {
      console.error('Analytics reset error:', error);
    }
  }

  public getState(): object {
    return this.analytics.getState();
  }

  public async flush(): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.analytics.flush();
    } catch (error) {
      console.error('Analytics flush error:', error);
    }
  }
}

export default AnalyticsService; 