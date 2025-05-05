export interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail';
  latency: number;
  lastChecked: string;
export interface SystemHealthStatus {
  status: 'healthy' | 'unhealthy';
  checks: HealthCheckResult[];
  timestamp: string;
export interface AlertConfig {
  id: string;
  metric: string;
  threshold: number;
  acknowledged: boolean;
export interface MonitoringService {
  getMetrics(): Record<string, number>;
  checkSystemHealth(): Promise<SystemHealthStatus>;
