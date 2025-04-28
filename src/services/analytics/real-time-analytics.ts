import { WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

interface AnalyticsEvent {
  type: 'view' | 'interaction' | 'conversion' | 'error';
  timestamp: number;
  data: Record<string, any>;
  sessionId: string;
  userId?: string;
}

export class RealTimeAnalytics extends EventEmitter {
  private static instance: RealTimeAnalytics;
  private connections: Set<WebSocket> = new Set();
  private eventBuffer: AnalyticsEvent[] = [];
  private readonly BUFFER_FLUSH_INTERVAL = 5000; // 5 seconds
  private readonly BUFFER_SIZE_LIMIT = 100;

  private constructor() {
    super();
    this.startBufferFlush();
  }

  public static getInstance(): RealTimeAnalytics {
    if (!RealTimeAnalytics.instance) {
      RealTimeAnalytics.instance = new RealTimeAnalytics();
    }
    return RealTimeAnalytics.instance;
  }

  public addConnection(ws: WebSocket): void {
    this.connections.add(ws);
    ws.on('close', () => this.connections.delete(ws));
  }

  public async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Add to buffer
      this.eventBuffer.push(event);

      // Broadcast to all connected clients
      this.broadcastEvent(event);

      // Flush buffer if size limit reached
      if (this.eventBuffer.length >= this.BUFFER_SIZE_LIMIT) {
        await this.flushBuffer();
      }
    } catch (error) {
      logger.error('Error tracking analytics event:', error);
    }
  }

  private broadcastEvent(event: AnalyticsEvent): void {
    const message = JSON.stringify(event);
    this.connections.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  private startBufferFlush(): void {
    setInterval(async () => {
      await this.flushBuffer();
    }, this.BUFFER_FLUSH_INTERVAL);
  }

  private async flushBuffer(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    try {
      // Group events by type for batch processing
      const events = [...this.eventBuffer];
      this.eventBuffer = [];

      // Batch insert events into database
      await prisma.$transaction(async (tx) => {
        for (const event of events) {
          switch (event.type) {
            case 'view':
              await tx.analyticsView.create({
                data: {
                  sessionId: event.sessionId,
                  userId: event.userId,
                  timestamp: new Date(event.timestamp),
                  ...event.data,
                },
              });
              break;
            case 'interaction':
              await tx.analyticsInteraction.create({
                data: {
                  sessionId: event.sessionId,
                  userId: event.userId,
                  timestamp: new Date(event.timestamp),
                  ...event.data,
                },
              });
              break;
            case 'conversion':
              await tx.analyticsConversion.create({
                data: {
                  sessionId: event.sessionId,
                  userId: event.userId,
                  timestamp: new Date(event.timestamp),
                  ...event.data,
                },
              });
              break;
            case 'error':
              await tx.analyticsError.create({
                data: {
                  sessionId: event.sessionId,
                  userId: event.userId,
                  timestamp: new Date(event.timestamp),
                  ...event.data,
                },
              });
              break;
          }
        }
      });
    } catch (error) {
      logger.error('Error flushing analytics buffer:', error);
      // Retry failed events in next flush
      this.eventBuffer = [...this.eventBuffer, ...this.eventBuffer];
    }
  }

  public async getRealtimeMetrics(): Promise<Record<string, any>> {
    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const [views, interactions, conversions, errors] = await Promise.all([
        prisma.analyticsView.count({
          where: { timestamp: { gte: fiveMinutesAgo } },
        }),
        prisma.analyticsInteraction.count({
          where: { timestamp: { gte: fiveMinutesAgo } },
        }),
        prisma.analyticsConversion.count({
          where: { timestamp: { gte: fiveMinutesAgo } },
        }),
        prisma.analyticsError.count({
          where: { timestamp: { gte: fiveMinutesAgo } },
        }),
      ]);

      return {
        lastUpdated: now.toISOString(),
        metrics: {
          views,
          interactions,
          conversions,
          errors,
          conversionRate: views > 0 ? (conversions / views) * 100 : 0,
        },
      };
    } catch (error) {
      logger.error('Error getting realtime metrics:', error);
      throw error;
    }
  }
}
