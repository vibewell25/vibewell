import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'jpeg' | 'webp' | 'avif' | 'png';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

export class ImageOptimizationService {
  private readonly cacheDir: string;
  private readonly supportedFormats = ['jpeg', 'webp', 'avif', 'png'];

  constructor(cacheDir = 'public/img-cache') {
    this.cacheDir = cacheDir;
  }

  private async ensureCacheDir(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create cache directory:', error);
      throw error;
    }
  }

  private getCacheKey(imagePath: string, options: ImageOptimizationOptions): string {
    const { quality, format, width, height, fit } = options;
    const key = `${imagePath}-${quality}-${format}-${width}-${height}-${fit}`;
    return path.join(this.cacheDir, Buffer.from(key).toString('base64'));
  }

  public async optimizeImage(
    inputPath: string,
    options: ImageOptimizationOptions = {},
  ): Promise<{ outputPath: string; metadata: ImageMetadata }> {
    await this.ensureCacheDir();

    const { quality = 80, format = 'webp', width, height, fit = 'cover' } = options;

    if (!this.supportedFormats.includes(format)) {
      throw new Error(`Unsupported format: ${format}`);
    }

    const cacheKey = this.getCacheKey(inputPath, options);
    const outputPath = `${cacheKey}.${format}`;

    try {
      // Check if cached version exists
      const cachedStats = await fs.stat(outputPath);
      if (cachedStats.isFile()) {
        const metadata = await sharp(outputPath).metadata();
        return {
          outputPath,
          metadata: {
            width: metadata.width || 0,
            height: metadata.height || 0,
            format: metadata.format || format,
            size: cachedStats.size,
          },
        };
      }
    } catch (error) {
      // Cache miss, continue with optimization
    }

    let pipeline = sharp(inputPath);

    // Resize if dimensions are provided
    if (width || height) {
      pipeline = pipeline.resize(width, height, { fit });
    }

    // Format conversion and compression
    switch (format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
      case 'avif':
        pipeline = pipeline.avif({ quality });
        break;
      case 'png':
        pipeline = pipeline.png({ quality });
        break;
    }

    // Process and save the image
    await pipeline.toFile(outputPath);

    // Get metadata of the processed image
    const metadata = await sharp(outputPath).metadata();
    const stats = await fs.stat(outputPath);

    return {
      outputPath,
      metadata: {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || format,
        size: stats.size,
      },
    };
  }

  public async generateResponsiveImages(
    inputPath: string,
    breakpoints: number[] = [640, 768, 1024, 1280, 1536],
  ): Promise<Array<{ width: number; outputPath: string }>> {
    const results = await Promise.all(
      breakpoints.map(async (width) => {
        const { outputPath } = await this.optimizeImage(inputPath, {
          width,
          format: 'webp',
          quality: 80,
        });
        return { width, outputPath };
      }),
    );

    return results;
  }

  public async cleanCache(maxAge = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      const now = Date.now();

      await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(this.cacheDir, file);
          const stats = await fs.stat(filePath);
          const age = now - stats.mtime.getTime();

          if (age > maxAge) {
            await fs.unlink(filePath);
          }
        }),
      );
    } catch (error) {
      console.error('Failed to clean cache:', error);
      throw error;
    }
  }
}
