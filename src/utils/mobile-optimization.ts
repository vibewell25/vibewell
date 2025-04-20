import { logger } from '@/lib/logger';

interface DeviceCapabilities {
  webgl: boolean;
  webgl2: boolean;
  mediaDevices: boolean;
  gyroscope: boolean;
  accelerometer: boolean;
  tensorflowJS: boolean;
}

interface PerformanceMetrics {
  fps: number;
  memoryUsage?: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
  batteryLevel?: number;
}

export class MobileOptimization {
  private static instance: MobileOptimization;
  private fpsHistory: number[] = [];
  private readonly FPS_SAMPLE_SIZE = 60;
  private animationFrameId?: number;
  private lastFrameTime = performance.now();
  private isMonitoring = false;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): MobileOptimization {
    if (!MobileOptimization.instance) {
      MobileOptimization.instance = new MobileOptimization();
    }
    return MobileOptimization.instance;
  }

  /**
   * Checks device capabilities
   */
  public async checkDeviceCapabilities(): Promise<DeviceCapabilities> {
    try {
      // Check WebGL support
      const canvas = document.createElement('canvas');
      const webgl = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      const webgl2 = !!canvas.getContext('webgl2');

      // Check media devices
      const mediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

      // Check motion sensors
      const gyroscope = 'DeviceOrientationEvent' in window;
      const accelerometer = 'DeviceMotionEvent' in window;

      // Check TensorFlow.js support
      const tensorflowJS = 'tf' in window;

      return {
        webgl,
        webgl2,
        mediaDevices,
        gyroscope,
        accelerometer,
        tensorflowJS
      };
    } catch (error) {
      logger.error('Error checking device capabilities', 'MobileOptimization', { error });
      throw error;
    }
  }

  /**
   * Starts monitoring performance
   */
  public startPerformanceMonitoring(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.monitorFrame();
  }

  /**
   * Stops performance monitoring
   */
  public stopPerformanceMonitoring(): void {
    this.isMonitoring = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Gets current performance metrics
   */
  public async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const metrics: PerformanceMetrics = {
      fps: this.calculateAverageFPS()
    };

    // Get memory usage if available
    if ('memory' in performance) {
      metrics.memoryUsage = (performance as any).memory;
    }

    // Get battery level if available
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        metrics.batteryLevel = battery.level * 100;
      }
    } catch (error) {
      logger.warn('Error getting battery info', 'MobileOptimization', { error });
    }

    return metrics;
  }

  /**
   * Optimizes rendering based on device capabilities and performance
   */
  public async optimizeRendering(
    targetFPS: number = 30,
    minQuality: number = 0.5
  ): Promise<void> {
    try {
      const metrics = await this.getPerformanceMetrics();
      const capabilities = await this.checkDeviceCapabilities();

      // Adjust quality based on performance
      let quality = 1.0;
      
      // Reduce quality if FPS is below target
      if (metrics.fps < targetFPS) {
        quality = Math.max(minQuality, quality * (metrics.fps / targetFPS));
      }

      // Reduce quality on low-end devices
      if (!capabilities.webgl2) {
        quality *= 0.8;
      }

      // Reduce quality on low memory devices
      if (metrics.memoryUsage && metrics.memoryUsage.usedJSHeapSize > metrics.memoryUsage.jsHeapSizeLimit * 0.8) {
        quality *= 0.7;
      }

      // Apply optimizations
      this.applyOptimizations(quality);

      logger.info('Applied rendering optimizations', 'MobileOptimization', {
        quality,
        metrics,
        capabilities
      });
    } catch (error) {
      logger.error('Error optimizing rendering', 'MobileOptimization', { error });
      throw error;
    }
  }

  /**
   * Monitors frame rate
   */
  private monitorFrame = (): void => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    const fps = 1000 / deltaTime;

    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > this.FPS_SAMPLE_SIZE) {
      this.fpsHistory.shift();
    }

    this.lastFrameTime = currentTime;
    this.animationFrameId = requestAnimationFrame(this.monitorFrame);
  };

  /**
   * Calculates average FPS
   */
  private calculateAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    const sum = this.fpsHistory.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  /**
   * Applies performance optimizations
   */
  private applyOptimizations(quality: number): void {
    // Update render resolution
    const pixelRatio = Math.max(1, window.devicePixelRatio * quality);
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(pixelRatio, pixelRatio);
      }
    }

    // Update model quality
    if (window.virtualTryOn?.setQuality) {
      window.virtualTryOn.setQuality(quality);
    }

    // Disable certain effects on low quality
    if (quality < 0.7) {
      // Disable shadows
      if (window.virtualTryOn?.setShadows) {
        window.virtualTryOn.setShadows(false);
      }
      
      // Reduce particle effects
      if (window.virtualTryOn?.setParticles) {
        window.virtualTryOn.setParticles(false);
      }
    }
  }
}

// Add type definitions for global window object
declare global {
  interface Window {
    virtualTryOn?: {
      setQuality?: (quality: number) => void;
      setShadows?: (enabled: boolean) => void;
      setParticles?: (enabled: boolean) => void;
    };
  }
} 