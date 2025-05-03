
import { PerformanceMetrics } from '../../types/performance-metrics';
import {
  MetricStatus,
  ErrorCodes,
  getMetricsSummary,
  createMetricsFromStatus,


} from '../../utils/performance-metric-utils';

export class PerformanceMetricsImpl implements PerformanceMetrics {
  serviceWorkerRegistration?: number; // 1 for registered, 0 for not registered
  serviceWorkerError?: number; // Error code or 0 for no error
  offlineReady?: number; // 1 for ready, 0 for not ready
  syncQueueSize?: number; // Number of items in sync queue
  fetchStrategyTime?: number; // Time in milliseconds
  fetchSuccess?: number; // 1 for success, 0 for failure
  fetchError?: number; // Error code or 0 for no error
  syncSuccess?: number; // 1 for success, 0 for failure
  syncError?: number; // Error code or 0 for no error

  constructor(metrics?: Partial<PerformanceMetrics>) {
    if (metrics) {
      Object?.assign(this, metrics);
    }
  }

  static fromStatus(status: {
    isRegistered?: boolean;
    registrationError?: string;
    isOffline?: boolean;
    queueSize?: number;
    fetchTime?: number;
    hasFetchSucceeded?: boolean;
    fetchErrorMessage?: string;
    hasSyncSucceeded?: boolean;
    syncErrorMessage?: string;
  }): PerformanceMetricsImpl {
    return new PerformanceMetricsImpl(createMetricsFromStatus(status));
  }

  isServiceWorkerRegistered(): boolean {
    return this?.serviceWorkerRegistration === MetricStatus?.SUCCESS;
  }

  hasServiceWorkerError(): boolean {
    return this?.serviceWorkerError !== undefined && this?.serviceWorkerError !== ErrorCodes?.NO_ERROR;
  }

  isOfflineReady(): boolean {
    return this?.offlineReady === MetricStatus?.SUCCESS;
  }

  hasFetchSucceeded(): boolean {
    return this?.fetchSuccess === MetricStatus?.SUCCESS;
  }

  hasSyncSucceeded(): boolean {
    return this?.syncSuccess === MetricStatus?.SUCCESS;
  }

  getSummary(): string {
    return getMetricsSummary(this);
  }

  toJSON(): Record<string, unknown> {
    return {
      serviceWorkerRegistration: this?.serviceWorkerRegistration,
      serviceWorkerError: this?.serviceWorkerError,
      offlineReady: this?.offlineReady,
      syncQueueSize: this?.syncQueueSize,
      fetchStrategyTime: this?.fetchStrategyTime,
      fetchSuccess: this?.fetchSuccess,
      fetchError: this?.fetchError,
      syncSuccess: this?.syncSuccess,
      syncError: this?.syncError,
    };
  }
}
