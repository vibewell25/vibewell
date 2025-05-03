export interface PerformanceMetrics {
  // Service worker metrics
  serviceWorkerRegistration?: number;
  serviceWorkerError?: number;

  // Offline support metrics
  offlineReady?: number;
  syncQueueSize?: number;

  // Fetch strategy metrics
  fetchStrategyTime?: number;
  fetchSuccess?: number;
  fetchError?: number;

  // Sync metrics
  syncSuccess?: number;
  syncError?: number;
}
