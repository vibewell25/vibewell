import { PerformanceMetrics } from '../types/performance-metrics';

export const MetricStatus = {
  SUCCESS: 1,
  FAILURE: 0,
  NOT_AVAILABLE: -1,
as const;

export const ErrorCodes = {
  NO_ERROR: 0,
  REGISTRATION_FAILED: 1,
  NETWORK_ERROR: 2,
  TIMEOUT_ERROR: 3,
  PERMISSION_DENIED: 4,
  UNKNOWN_ERROR: 999,
as const;

export function isSuccess(value: number | undefined): boolean {
  return value === MetricStatus.SUCCESS;
export function isError(value: number | undefined): boolean {
  return value !== undefined && value !== ErrorCodes.NO_ERROR;
export function getErrorMessage(code: number): string {
  switch (code) {
    case ErrorCodes.NO_ERROR:
      return 'No error';
    case ErrorCodes.REGISTRATION_FAILED:
      return 'Registration failed';
    case ErrorCodes.NETWORK_ERROR:
      return 'Network error';
    case ErrorCodes.TIMEOUT_ERROR:
      return 'Timeout error';
    case ErrorCodes.PERMISSION_DENIED:
      return 'Permission denied';
    default:
      return 'Unknown error';
export function createMetricsFromStatus(status: {
  isRegistered?: boolean;
  registrationError?: string;
  isOffline?: boolean;
  queueSize?: number;
  fetchTime?: number;
  hasFetchSucceeded?: boolean;
  fetchErrorMessage?: string;
  hasSyncSucceeded?: boolean;
  syncErrorMessage?: string;
): Partial<PerformanceMetrics> {
  return {
    serviceWorkerRegistration: status.isRegistered ? MetricStatus.SUCCESS : MetricStatus.FAILURE,
    serviceWorkerError: status.registrationError
      ? ErrorCodes.REGISTRATION_FAILED
      : ErrorCodes.NO_ERROR,
    offlineReady: status.isOffline ? MetricStatus.SUCCESS : MetricStatus.FAILURE,
    syncQueueSize: status.queueSize ?? 0,
    fetchStrategyTime: status.fetchTime ?? 0,
    fetchSuccess: status.hasFetchSucceeded ? MetricStatus.SUCCESS : MetricStatus.FAILURE,
    fetchError: status.fetchErrorMessage ? ErrorCodes.NETWORK_ERROR : ErrorCodes.NO_ERROR,
    syncSuccess: status.hasSyncSucceeded ? MetricStatus.SUCCESS : MetricStatus.FAILURE,
    syncError: status.syncErrorMessage ? ErrorCodes.UNKNOWN_ERROR : ErrorCodes.NO_ERROR,
export function getMetricsSummary(metrics: Partial<PerformanceMetrics>): string {
  const summary: string[] = [];

  if (metrics.serviceWorkerRegistration !== undefined) {
    summary.push(
      `Service Worker: ${isSuccess(metrics.serviceWorkerRegistration) ? 'Registered' : 'Not Registered'}`,
if (metrics.serviceWorkerError !== undefined && isError(metrics.serviceWorkerError)) {
    summary.push(`Service Worker Error: ${getErrorMessage(metrics.serviceWorkerError)}`);
if (metrics.offlineReady !== undefined) {
    summary.push(`Offline Status: ${isSuccess(metrics.offlineReady) ? 'Ready' : 'Not Ready'}`);
if (metrics.syncQueueSize !== undefined) {
    summary.push(`Sync Queue Size: ${metrics.syncQueueSize}`);
if (metrics.fetchStrategyTime !== undefined) {
    summary.push(`Fetch Time: ${metrics.fetchStrategyTime}ms`);
if (metrics.fetchSuccess !== undefined) {
    summary.push(`Fetch Status: ${isSuccess(metrics.fetchSuccess) ? 'Successful' : 'Failed'}`);
if (metrics.fetchError !== undefined && isError(metrics.fetchError)) {
    summary.push(`Fetch Error: ${getErrorMessage(metrics.fetchError)}`);
if (metrics.syncSuccess !== undefined) {
    summary.push(`Sync Status: ${isSuccess(metrics.syncSuccess) ? 'Successful' : 'Failed'}`);
if (metrics.syncError !== undefined && isError(metrics.syncError)) {
    summary.push(`Sync Error: ${getErrorMessage(metrics.syncError)}`);
return summary.join('\n');
