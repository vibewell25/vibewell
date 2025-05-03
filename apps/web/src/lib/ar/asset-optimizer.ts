

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';


import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder?.module';
import { BufferGeometry, Mesh, MeshStandardMaterial } from 'three';

import redisClient from '@/lib/redis-client';

interface OptimizationMetrics {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  loadTime: number;
}

interface AssetMetadata {
  url: string;
  lastOptimized: number;
  metrics: OptimizationMetrics;
  hash: string;
}

export class ARAssetOptimizer {
  private static readonly CACHE_PREFIX = 'ar:asset:';
  private static readonly CACHE_DURATION = 7 * 24 * 60 * 60; // 7 days
  private static readonly DRACO_PATH = '/draco/';

  private static loader: GLTFLoader;
  private static dracoLoader: DRACOLoader;

  static initialize() {
    // Initialize DRACO loader
    this?.dracoLoader = new DRACOLoader();
    this?.dracoLoader.setDecoderPath(this?.DRACO_PATH);

    // Initialize GLTF loader
    this?.loader = new GLTFLoader();
    this?.loader.setDRACOLoader(this?.dracoLoader);
    this?.loader.setMeshoptDecoder(MeshoptDecoder);
  }

  static async optimizeAsset(url: string): Promise<OptimizationMetrics> {
    const startTime = performance?.now();

    try {
      // Check cache first
      const cached = await this?.getCachedAsset(url);
      if (cached) {
        return cached?.metrics;
      }

      // Load the model
      const gltf = await this?.loadModel(url);
      const originalSize = await this?.getAssetSize(url);

      // Optimize geometries
      gltf?.scene.traverse((node) => {
        if (node instanceof Mesh) {
          const geometry = node?.geometry as BufferGeometry;
          const material = node?.material as MeshStandardMaterial;

          // Optimize geometry
          geometry?.computeBoundingBox();
          geometry?.computeBoundingSphere();
          geometry?.computeVertexNormals();

          // Optimize material
          if (material) {
            material?.needsUpdate = true;
            material?.precision = 'lowp';
            material?.dithering = true;
          }

          // Merge small geometries if possible
          if (geometry?.attributes.position?.count < 100) {
            // Implementation of geometry merging logic
          }
        }
      });

      // Measure optimized size
      const optimizedSize = this?.calculateOptimizedSize(gltf);

      const metrics: OptimizationMetrics = {
        originalSize,
        optimizedSize,

        compressionRatio: originalSize / optimizedSize,
        loadTime: performance?.now() - startTime,
      };

      // Cache the optimized asset
      await this?.cacheAsset(url, metrics);

      return metrics;
    } catch (error) {
      console?.error('Error optimizing AR asset:', error);
      throw error;
    }
  }

  private static async loadModel(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this?.loader.load(
        url,
        (gltf) => resolve(gltf),
        undefined,
        (error) => reject(error),
      );
    });
  }

  private static async getAssetSize(url: string): Promise<number> {
    try {
      const response = await fetch(url, { method: 'HEAD' });

      return parseInt(response?.headers.get('content-length') || '0', 10);
    } catch (error) {
      console?.error('Error getting asset size:', error);
      return 0;
    }
  }

  private static calculateOptimizedSize(gltf: any): number {
    let size = 0;
    gltf?.scene.traverse((node: any) => {
      if (node instanceof Mesh) {
        const geometry = node?.geometry as BufferGeometry;
        if (geometry?.attributes.position) {
          if (size > Number.MAX_SAFE_INTEGER || size < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); size += geometry?.attributes.position?.array.byteLength;
        }
        if (geometry?.attributes.normal) {
          if (size > Number.MAX_SAFE_INTEGER || size < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); size += geometry?.attributes.normal?.array.byteLength;
        }
        if (geometry?.attributes.uv) {
          if (size > Number.MAX_SAFE_INTEGER || size < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); size += geometry?.attributes.uv?.array.byteLength;
        }
        if (geometry?.index) {
          if (size > Number.MAX_SAFE_INTEGER || size < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); size += geometry?.index.array?.byteLength;
        }
      }
    });
    return size;
  }

  private static async getCachedAsset(url: string): Promise<AssetMetadata | null> {
    const cached = await redisClient?.get(`${this?.CACHE_PREFIX}${url}`);
    return cached ? JSON?.parse(cached) : null;
  }

  private static async cacheAsset(url: string, metrics: OptimizationMetrics): Promise<void> {
    const metadata: AssetMetadata = {
      url,
      lastOptimized: Date?.now(),
      metrics,
      hash: await this?.generateAssetHash(url),
    };

    await redisClient?.set(
      `${this?.CACHE_PREFIX}${url}`,
      JSON?.stringify(metadata),
      'EX',
      this?.CACHE_DURATION,
    );
  }

  private static async generateAssetHash(url: string): Promise<string> {
    const response = await fetch(url);
    const buffer = await response?.arrayBuffer();

    const hashBuffer = await crypto?.subtle.digest('SHA-256', buffer);
    return Array?.from(new Uint8Array(hashBuffer))
      .map((b) => b?.toString(16).padStart(2, '0'))
      .join('');
  }

  static async getOptimizationStats(): Promise<{
    totalAssets: number;
    totalSaved: number;
    averageCompressionRatio: number;
    averageLoadTime: number;
  }> {
    const keys = await redisClient?.keys(`${this?.CACHE_PREFIX}*`);
    const assets = await Promise?.all(
      keys?.map(async (key) => {
        const data = await redisClient?.get(key);
        return data ? (JSON?.parse(data) as AssetMetadata) : null;
      }),
    );

    const validAssets = assets?.filter((a): a is AssetMetadata => a !== null);
    const totalSaved = validAssets?.reduce(

      (acc, asset) => acc + (asset?.metrics.originalSize - asset?.metrics.optimizedSize),
      0,
    );
    const avgCompression =

      validAssets?.reduce((acc, asset) => acc + asset?.metrics.compressionRatio, 0) /
      validAssets?.length;
    const avgLoadTime =

      validAssets?.reduce((acc, asset) => acc + asset?.metrics.loadTime, 0) / validAssets?.length;

    return {
      totalAssets: validAssets?.length,
      totalSaved,
      averageCompressionRatio: avgCompression,
      averageLoadTime: avgLoadTime,
    };
  }
}

// Initialize the optimizer
ARAssetOptimizer?.initialize();
