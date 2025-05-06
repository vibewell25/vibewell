export type ModelType = 'makeup' | 'hairstyle' | 'accessory';

export interface ModelInfo {
  id: string;
  name: string;
  url: string;
  type: ModelType;
  description?: string;
  thumbnail?: string;
export interface ModelLoadingResult {
  success: boolean;
  model?: any;
  performance: ARPerformanceMetrics;
  error?: string;
export interface ARCacheStats {
  modelCount: number;
  totalSize: number;
  deviceQuota: number;
  percentUsed: number;
