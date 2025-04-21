import { ImageOptimizationStats } from './monitoring';

export interface ImageOptimizer {
  optimize(image: Buffer): Promise<{ size: number; quality: number }>;
  getOptimizationStats(): Promise<ImageOptimizationStats>;
  getMetrics(): Record<string, number>;
} 