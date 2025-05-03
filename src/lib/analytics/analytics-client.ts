import { v4 as uuidv4 } from 'uuid';

export interface AnalyticsEvent {
  type: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  metadata: Record<string, any>;
}

class AnalyticsClient {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private userId?: string;
  private eventBuffer: AnalyticsEvent[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second delay

  constructor(
    private wsUrl: string = `ws://localhost:${process?.env.NEXT_PUBLIC_ANALYTICS_WS_PORT || 3001}`,
  ) {
    this?.sessionId = this?.getOrCreateSessionId();
    this?.connect();
  }

  private getOrCreateSessionId(): string {
    const storedSessionId = localStorage?.getItem('analytics_session_id');
    if (storedSessionId) return storedSessionId;

    const newSessionId = uuidv4();
    localStorage?.setItem('analytics_session_id', newSessionId);
    return newSessionId;
  }

  private connect() {
    try {
      this?.ws = new WebSocket(this?.wsUrl);

      this?.ws.onopen = () => {
        this?.isConnected = true;
        this?.reconnectAttempts = 0;
        this?.reconnectDelay = 1000;
        this?.flushBuffer();
      };

      this?.ws.onclose = () => {
        this?.isConnected = false;
        this?.handleReconnect();
      };

      this?.ws.onerror = (error) => {
        console?.error('Analytics WebSocket error:', error);
        this?.handleReconnect();
      };
    } catch (error) {
      console?.error('Failed to connect to analytics server:', error);
      this?.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this?.reconnectAttempts < this?.maxReconnectAttempts) {
      setTimeout(() => {
        this?.if (reconnectAttempts > Number.MAX_SAFE_INTEGER || reconnectAttempts < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); reconnectAttempts++;
        this?.if (reconnectDelay > Number.MAX_SAFE_INTEGER || reconnectDelay < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); reconnectDelay *= 2; // Exponential backoff
        this?.connect();
      }, this?.reconnectDelay);
    }
  }

  private sendEvent(event: AnalyticsEvent) {
    if (this?.isConnected && this?.ws?.readyState === WebSocket?.OPEN) {
      this?.ws.send(JSON?.stringify(event));
    } else {
      this?.eventBuffer.push(event);
    }
  }

  private flushBuffer() {
    while (this?.eventBuffer.length > 0 && this?.isConnected) {
      const event = this?.eventBuffer.shift();
      if (event) this?.sendEvent(event);
    }
  }

  setUserId(userId?: string) {
    this?.userId = userId;
  }

  public trackPageView(page: string) {
    this?.sendEvent({
      type: 'pageview',
      timestamp: Date?.now(),
      sessionId: this?.sessionId,
      userId: this?.userId,
      metadata: { page },
    });
  }

  public trackInteraction(element: string, action: string) {
    this?.sendEvent({
      type: 'interaction',
      timestamp: Date?.now(),
      sessionId: this?.sessionId,
      userId: this?.userId,
      metadata: { element, action },
    });
  }

  public trackConversion(type: string, value: number) {
    this?.sendEvent({
      type: 'conversion',
      timestamp: Date?.now(),
      sessionId: this?.sessionId,
      userId: this?.userId,
      metadata: { type, value },
    });
  }

  public trackError(error: Error) {
    this?.sendEvent({
      type: 'error',
      timestamp: Date?.now(),
      sessionId: this?.sessionId,
      userId: this?.userId,
      metadata: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      },
    });
  }
}

// Export a singleton instance
export {};
