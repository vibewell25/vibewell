export type ModelType = 'makeup' | 'hairstyle' | 'accessory';

export interface ModelInfo {
  id: string;
  name: string;
  url: string;
  type: ModelType;
  description?: string;
  thumbnail?: string;
}

export interface ARPerformanceMetrics {
  fps: number;
  loadTime: number;
  memoryUsage?: number;
}

export interface ModelLoadingResult {
  success: boolean;
  model?: any;
  performance: ARPerformanceMetrics;
  error?: string;
}

export interface ARCacheStats {
  modelCount: number;
  totalSize: number;
  deviceQuota: number;
  percentUsed: number;
} 