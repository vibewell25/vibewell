import { logger } from '@/lib/logger';
import { SecurityMonitoringService } from './securityMonitoring';

interface SIEMConfig {
  provider: 'splunk' | 'elastic' | 'sumologic';
  endpoint: string;
  apiKey: string;
  index?: string;
  sourcetype?: string;
}

interface SIEMEvent {
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  message: string;
  source: string;
  metadata: Record<string, any>;
}

export class SIEMIntegrationService {
  private config: SIEMConfig;
  private securityMonitoring: SecurityMonitoringService;

  constructor(config: SIEMConfig) {
    this.config = config;
    this.securityMonitoring = new SecurityMonitoringService();
  }

  /**
   * Send event to SIEM system
   */
  async sendEvent(event: SIEMEvent): Promise<void> {
    try {
      const formattedEvent = this.formatEventForSIEM(event);
      
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(formattedEvent)
      });

      if (!response.ok) {
        throw new Error(`SIEM integration failed: ${response.statusText}`);
      }

      logger.info('Event sent to SIEM', 'siem', { event });
    } catch (error) {
      logger.error('Failed to send event to SIEM', 'siem', { error, event });
      throw error;
    }
  }

  /**
   * Format event based on SIEM provider
   */
  private formatEventForSIEM(event: SIEMEvent): Record<string, any> {
    switch (this.config.provider) {
      case 'splunk':
        return {
          time: event.timestamp.getTime() / 1000,
          host: event.source,
          source: this.config.sourcetype || 'vibewell',
          sourcetype: this.config.sourcetype || 'vibewell_security',
          index: this.config.index || 'security',
          event: {
            severity: event.severity,
            category: event.category,
            message: event.message,
            ...event.metadata
          }
        };

      case 'elastic':
        return {
          '@timestamp': event.timestamp.toISOString(),
          log: {
            level: event.severity,
            logger: event.source
          },
          message: event.message,
          event: {
            category: event.category,
            type: 'security'
          },
          metadata: event.metadata
        };

      case 'sumologic':
        return {
          timestamp: event.timestamp.toISOString(),
          severity: event.severity,
          category: event.category,
          message: event.message,
          source: event.source,
          metadata: event.metadata
        };

      default:
        return event as Record<string, any>;
    }
  }

  /**
   * Set up real-time event forwarding
   */
  async setupEventForwarding(): Promise<void> {
    try {
      // Subscribe to security events
      this.securityMonitoring.on('securityEvent', async (event) => {
        await this.sendEvent({
          timestamp: new Date(),
          severity: event.severity,
          category: event.type,
          message: event.details?.message || 'Security event detected',
          source: 'vibewell',
          metadata: event.details
        });
      });

      logger.info('SIEM event forwarding configured', 'siem', {
        provider: this.config.provider
      });
    } catch (error) {
      logger.error('Failed to set up SIEM event forwarding', 'siem', { error });
      throw error;
    }
  }

  /**
   * Query SIEM for historical events
   */
  async queryEvents(query: string, timeRange: { start: Date; end: Date }): Promise<SIEMEvent[]> {
    try {
      const queryParams = new URLSearchParams({
        query,
        start_time: timeRange.start.toISOString(),
        end_time: timeRange.end.toISOString()
      });

      const response = await fetch(`${this.config.endpoint}/search?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`SIEM query failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseQueryResults(data);
    } catch (error) {
      logger.error('Failed to query SIEM', 'siem', { error, query });
      throw error;
    }
  }

  /**
   * Parse query results based on SIEM provider
   */
  private parseQueryResults(data: any): SIEMEvent[] {
    switch (this.config.provider) {
      case 'splunk':
        return data.results.map((result: any) => ({
          timestamp: new Date(result.time * 1000),
          severity: result.event.severity,
          category: result.event.category,
          message: result.event.message,
          source: result.host,
          metadata: result.event
        }));

      case 'elastic':
        return data.hits.hits.map((hit: any) => ({
          timestamp: new Date(hit._source['@timestamp']),
          severity: hit._source.log.level,
          category: hit._source.event.category,
          message: hit._source.message,
          source: hit._source.log.logger,
          metadata: hit._source.metadata
        }));

      default:
        return [];
    }
  }
} 