import { useState, useEffect } from 'react';

interface ImageDimensions {
  width: number;
  height: number;
}

interface ImageOptimizationOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png';
  placeholder?: 'blur' | 'color' | 'none';
}

interface ProcessedImage {
  url: string;
  dimensions: ImageDimensions;
  originalSize: number;
  optimizedSize: number;
  format: string;
}

class ImageOptimizer {
  private static instance: ImageOptimizer;
  private cache: Map<string, ProcessedImage>;
  private worker: Worker | null;

  private constructor() {
    this.cache = new Map();
    this.initializeWorker();
  }

  public static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  private initializeWorker(): void {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker('/workers/imageWorker.js');
    } else {
      console.warn('Web Workers are not supported in this environment');
      this.worker = null;
    }
  }

  public async optimizeImage(
    file: File | Blob,
    options: ImageOptimizationOptions = {}
  ): Promise<ProcessedImage> {
    const imageUrl = URL.createObjectURL(file);
    const cacheKey = await this.generateCacheKey(file, options);

    if (this.cache.has(cacheKey)) {
      URL.revokeObjectURL(imageUrl);
      return this.cache.get(cacheKey)!;
    }

    try {
      const optimized = await this.processImage(file, options);
      this.cache.set(cacheKey, optimized);
      URL.revokeObjectURL(imageUrl);
      return optimized;
    } catch (error) {
      URL.revokeObjectURL(imageUrl);
      throw error;
    }
  }

  private async generateCacheKey(
    file: File | Blob,
    options: ImageOptimizationOptions
  ): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hashHex}-${JSON.stringify(options)}`;
  }

  private async processImage(
    file: File | Blob,
    options: ImageOptimizationOptions
  ): Promise<ProcessedImage> {
    const {
      quality = 0.8,
      maxWidth = 1920,
      maxHeight = 1080,
      format = 'webp'
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        try {
          // Calculate dimensions while maintaining aspect ratio
          let { width, height } = img;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Draw and optimize image
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedUrl = canvas.toDataURL(`image/${format}`, quality);

            resolve({
              url: optimizedUrl,
              dimensions: { width, height },
              originalSize: file.size,
              optimizedSize: Math.round((optimizedUrl.length * 3) / 4),
              format
            });
          } else {
            reject(new Error('Could not get canvas context'));
          }
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  public async generatePlaceholder(
    file: File | Blob,
    type: 'blur' | 'color' = 'blur'
  ): Promise<string> {
    if (type === 'blur') {
      return this.generateBlurPlaceholder(file);
    } else {
      return this.generateColorPlaceholder(file);
    }
  }

  private async generateBlurPlaceholder(file: File | Blob): Promise<string> {
    const options: ImageOptimizationOptions = {
      quality: 0.1,
      maxWidth: 20,
      maxHeight: 20,
      format: 'webp'
    };

    const { url } = await this.processImage(file, options);
    return url;
  }

  private async generateColorPlaceholder(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        try {
          canvas.width = 1;
          canvas.height = 1;

          if (ctx) {
            ctx.drawImage(img, 0, 0, 1, 1);
            const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
            resolve(`rgb(${r},${g},${b})`);
          } else {
            reject(new Error('Could not get canvas context'));
          }
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

// React hook for optimized image loading
export function useOptimizedImage(
  file: File | Blob | null,
  options?: ImageOptimizationOptions
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [image, setImage] = useState<ProcessedImage | null>(null);
  const [placeholder, setPlaceholder] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setLoading(false);
      return;
    }

    const optimizer = ImageOptimizer.getInstance();
    let mounted = true;

    const loadImage = async () => {
      try {
        setLoading(true);
        setError(null);

        // Generate placeholder while loading
        if (options?.placeholder !== 'none') {
          const placeholderData = await optimizer.generatePlaceholder(
            file,
            options?.placeholder
          );
          if (mounted) {
            setPlaceholder(placeholderData);
          }
        }

        // Process image
        const optimizedImage = await optimizer.optimizeImage(file, options);
        if (mounted) {
          setImage(optimizedImage);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load image'));
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [file, options]);

  return { loading, error, image, placeholder };
}

export default ImageOptimizer; 