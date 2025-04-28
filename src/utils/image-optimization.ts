import sharp from 'sharp';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { ImageOptimizer } from '../types/image-optimization';
import { ImageOptimizationStats } from '../types/monitoring';
import { performanceMonitor } from './performance-monitoring';

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

interface OptimizedImage {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  size: number;
}

class ImageOptimizerImpl implements ImageOptimizer {
  private stats: ImageOptimizationStats = {
    optimizationRate: 0,
    cdnLatency: 0,
    compressionRatio: 0,
    processingTime: 0,
  };

  private cacheDir: string;
  private static instance: ImageOptimizerImpl;

  private constructor() {
    this.cacheDir = path.join(process.cwd(), '.cache', 'images');
    this.ensureCacheDir();
  }

  public static getInstance(): ImageOptimizerImpl {
    if (!ImageOptimizerImpl.instance) {
      ImageOptimizerImpl.instance = new ImageOptimizerImpl();
    }
    return ImageOptimizerImpl.instance;
  }

  private async ensureCacheDir(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('Error creating cache directory:', error);
    }
  }

  private generateCacheKey(buffer: Buffer, options: ImageOptimizationOptions): string {
    const hash = createHash('sha256');
    hash.update(buffer);
    hash.update(JSON.stringify(options));
    return hash.digest('hex');
  }

  private async getCachedImage(cacheKey: string): Promise<Buffer | null> {
    try {
      const cachePath = path.join(this.cacheDir, cacheKey);
      const buffer = await fs.readFile(cachePath);
      return buffer;
    } catch {
      return null;
    }
  }

  private async cacheImage(cacheKey: string, buffer: Buffer): Promise<void> {
    try {
      const cachePath = path.join(this.cacheDir, cacheKey);
      await fs.writeFile(cachePath, buffer);
    } catch (error) {
      console.error('Error caching image:', error);
    }
  }

  public async optimizeImage(
    input: Buffer | string,
    options: ImageOptimizationOptions = {},
  ): Promise<OptimizedImage> {
    const inputBuffer = typeof input === 'string' ? await fs.readFile(input) : input;

    const cacheKey = this.generateCacheKey(inputBuffer, options);
    const cachedBuffer = await this.getCachedImage(cacheKey);

    if (cachedBuffer) {
      const metadata = await sharp(cachedBuffer).metadata();
      return {
        buffer: cachedBuffer,
        format: metadata.format || 'unknown',
        width: metadata.width || 0,
        height: metadata.height || 0,
        size: cachedBuffer.length,
      };
    }

    const pipeline = sharp(inputBuffer);
    const initialMetadata = await pipeline.metadata();

    // Apply resizing if dimensions are specified
    if (options.width || options.height) {
      pipeline.resize(options.width, options.height, {
        fit: options.fit || 'cover',
        withoutEnlargement: true,
      });
    }

    // Convert format if specified
    if (options.format) {
      pipeline.toFormat(options.format, {
        quality: options.quality || 80,
        effort: 6, // Higher compression effort
      });
    }

    const outputBuffer = await pipeline.toBuffer();
    await this.cacheImage(cacheKey, outputBuffer);

    let outputMetadata = initialMetadata;
    if (options.width || options.height || options.format) {
      outputMetadata = await sharp(outputBuffer).metadata();
    }

    return {
      buffer: outputBuffer,
      format: outputMetadata.format || 'unknown',
      width: outputMetadata.width || 0,
      height: outputMetadata.height || 0,
      size: outputBuffer.length,
    };
  }

  public async generateResponsiveImages(
    input: Buffer | string,
    breakpoints: number[] = [640, 750, 828, 1080, 1200, 1920],
  ): Promise<Map<number, OptimizedImage>> {
    const results = new Map<number, OptimizedImage>();

    await Promise.all(
      breakpoints.map(async (width) => {
        const optimized = await this.optimizeImage(input, {
          width,
          format: 'webp',
          quality: 80,
        });
        results.set(width, optimized);
      }),
    );

    return results;
  }

  public async generatePlaceholder(input: Buffer | string): Promise<string> {
    const placeholder = await this.optimizeImage(input, {
      width: 10,
      height: 10,
      format: 'webp',
      quality: 30,
    });

    return `data:image/${placeholder.format};base64,${placeholder.buffer.toString('base64')}`;
  }

  public async cleanCache(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      const now = Date.now();

      await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(this.cacheDir, file);
          const stats = await fs.stat(filePath);

          if (now - stats.mtimeMs > maxAge) {
            await fs.unlink(filePath);
          }
        }),
      );
    } catch (error) {
      console.error('Error cleaning cache:', error);
    }
  }

  public async getImageMetadata(input: Buffer | string): Promise<sharp.Metadata> {
    const inputBuffer = typeof input === 'string' ? await fs.readFile(input) : input;

    return sharp(inputBuffer).metadata();
  }

  async optimize(image: Buffer): Promise<{ size: number; quality: number }> {
    const startTime = performance.now();

    try {
      // TODO: Implement actual image optimization
      const optimizedSize = image.length * 0.7; // Simulate 30% reduction
      const quality = 80;

      this.updateStats(image.length, optimizedSize, startTime);

      return { size: optimizedSize, quality };
    } catch (error) {
      console.error('Image optimization failed:', error);
      throw error;
    }
  }

  private updateStats(originalSize: number, optimizedSize: number, startTime: number): void {
    const processingTime = performance.now() - startTime;
    const compressionRatio = optimizedSize / originalSize;

    this.stats = {
      ...this.stats,
      optimizationRate: (1 - compressionRatio) * 100,
      processingTime,
      compressionRatio,
    };

    performanceMonitor.track({
      imageOptimizationTime: processingTime,
      imageCompressionRatio: compressionRatio,
    });
  }

  async getOptimizationStats(): Promise<ImageOptimizationStats> {
    return { ...this.stats };
  }

  getMetrics(): Record<string, number> {
    return {
      optimizationRate: this.stats.optimizationRate,
      cdnLatency: this.stats.cdnLatency,
      compressionRatio: this.stats.compressionRatio,
      processingTime: this.stats.processingTime,
    };
  }
}

export default ImageOptimizerImpl;
