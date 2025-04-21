import { Session } from '@supabase/supabase-js';
import { logger } from './logger';

interface SessionConfig {
  maxInactivityTime: number; // in milliseconds
  refreshThreshold: number; // in milliseconds
}

export class SessionManager {
  private static instance: SessionManager;
  private lastActivity: number;
  private refreshTimeout: NodeJS.Timeout | null = null;
  private inactivityTimeout: NodeJS.Timeout | null = null;

  private config: SessionConfig = {
    maxInactivityTime: 30 * 60 * 1000, // 30 minutes
    refreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
  };

  private constructor() {
    this.lastActivity = Date.now();
    this.setupActivityListener();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private setupActivityListener() {
    if (typeof window !== 'undefined') {
      const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
      events.forEach(event => {
        window.addEventListener(event, () => this.updateActivity());
      });
    }
  }

  private updateActivity() {
    this.lastActivity = Date.now();
  }

  startSessionMonitoring(
    session: Session | null,
    onTimeout: () => void,
    onRefreshNeeded: () => Promise<void>
  ) {
    if (!session) return;

    // Clear any existing timeouts
    this.clearTimeouts();

    // Set timeout for inactivity
    this.inactivityTimeout = setTimeout(() => {
      logger.security('Session timeout due to inactivity', session.user?.id);
      onTimeout();
    }, this.config.maxInactivityTime);

    // Calculate time until refresh is needed
    const expiresAt = new Date(session.expires_at || '').getTime();
    const now = Date.now();
    const timeUntilRefresh = expiresAt - now - this.config.refreshThreshold;

    if (timeUntilRefresh > 0) {
      this.refreshTimeout = setTimeout(async () => {
        try {
          await onRefreshNeeded();
          logger.info('Session refreshed successfully', session.user?.id);
        } catch (error) {
          logger.error('Failed to refresh session', session.user?.id, { error });
          onTimeout();
        }
      }, timeUntilRefresh);
    } else {
      // If the session is already close to expiring, refresh immediately
      onRefreshNeeded().catch(error => {
        logger.error('Failed to refresh session', session.user?.id, { error });
        onTimeout();
      });
    }
  }

  clearTimeouts() {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = null;
    }
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  updateConfig(newConfig: Partial<SessionConfig>) {
    this.config = {
      ...this.config,
      ...newConfig,
    };
  }

  getLastActivity(): number {
    return this.lastActivity;
  }
}

export const sessionManager = SessionManager.getInstance();
