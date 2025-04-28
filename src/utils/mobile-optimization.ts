import { logger } from '@/lib/logger';
import { cacheManager } from './caching';
import { performanceMonitor } from './performance-monitoring';

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

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  connection: {
    type: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
  memory: {
    total: number;
    used: number;
  };
  battery: {
    level: number;
    charging: boolean;
  };
  viewport: {
    width: number;
    height: number;
    pixelRatio: number;
  };
}

interface OptimizationConfig {
  imageQuality: number;
  videoQuality: number;
  prefetchDistance: number;
  cacheSize: number;
  offlineSupport: boolean;
  compressionLevel: number;
}

export class MobileOptimization {
  private static instance: MobileOptimization;
  private fpsHistory: number[] = [];
  private readonly FPS_SAMPLE_SIZE = 60;
  private animationFrameId?: number;
  private lastFrameTime = performance.now();
  private isMonitoring = false;
  private deviceInfo: DeviceInfo;
  private config: OptimizationConfig;

  private constructor() {
    this.initializeDeviceInfo();
    this.initializeConfig();
    this.setupEventListeners();
  }

  public static getInstance(): MobileOptimization {
    if (!MobileOptimization.instance) {
      MobileOptimization.instance = new MobileOptimization();
    }
    return MobileOptimization.instance;
  }

  private async initializeDeviceInfo() {
    this.deviceInfo = {
      type: this.getDeviceType(),
      connection: await this.getConnectionInfo(),
      memory: await this.getMemoryInfo(),
      battery: await this.getBatteryInfo(),
      viewport: this.getViewportInfo(),
    };
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (
      /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua,
      )
    ) {
      return 'mobile';
    }
    return 'desktop';
  }

  private async getConnectionInfo() {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    return {
      type: connection?.type || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      saveData: connection?.saveData || false,
    };
  }

  private async getMemoryInfo() {
    const memory = (performance as any).memory || {};
    return {
      total: memory.jsHeapSizeLimit || 0,
      used: memory.usedJSHeapSize || 0,
    };
  }

  private async getBatteryInfo() {
    try {
      const battery = await (navigator as any).getBattery();
      return {
        level: battery.level,
        charging: battery.charging,
      };
    } catch {
      return {
        level: 1,
        charging: true,
      };
    }
  }

  private getViewportInfo() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
    };
  }

  private initializeConfig() {
    this.config = this.calculateOptimalConfig();
  }

  private calculateOptimalConfig(): OptimizationConfig {
    const { connection, memory, battery, type } = this.deviceInfo;

    // Base configuration
    const config: OptimizationConfig = {
      imageQuality: 80,
      videoQuality: 720,
      prefetchDistance: 3,
      cacheSize: 50 * 1024 * 1024, // 50MB
      offlineSupport: true,
      compressionLevel: 6,
    };

    // Adjust based on connection
    if (connection.saveData || connection.type === '2g') {
      config.imageQuality = 60;
      config.videoQuality = 480;
      config.prefetchDistance = 1;
      config.compressionLevel = 8;
    }

    // Adjust based on memory
    if (memory.used / memory.total > 0.8) {
      config.cacheSize = 20 * 1024 * 1024; // 20MB
      config.prefetchDistance = 1;
    }

    // Adjust based on battery
    if (!battery.charging && battery.level < 0.2) {
      config.imageQuality = 70;
      config.videoQuality = 480;
      config.prefetchDistance = 1;
    }

    return config;
  }

  private setupEventListeners() {
    // Listen for connection changes
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', async () => {
        this.deviceInfo.connection = await this.getConnectionInfo();
        this.updateConfiguration();
      });
    }

    // Listen for memory changes
    if ((performance as any).memory) {
      setInterval(async () => {
        this.deviceInfo.memory = await this.getMemoryInfo();
        this.updateConfiguration();
      }, 30000);
    }

    // Listen for battery changes
    if ((navigator as any).getBattery) {
      (navigator as any).getBattery().then((battery: any) => {
        battery.addEventListener('levelchange', async () => {
          this.deviceInfo.battery = await this.getBatteryInfo();
          this.updateConfiguration();
        });
      });
    }

    // Listen for viewport changes
    window.addEventListener('resize', () => {
      this.deviceInfo.viewport = this.getViewportInfo();
      this.updateConfiguration();
    });
  }

  private updateConfiguration() {
    const newConfig = this.calculateOptimalConfig();
    this.config = newConfig;

    // Update cache size
    cacheManager.updateConfig({ maxSize: this.config.cacheSize });

    // Track configuration changes
    performanceMonitor.trackMetrics({
      configUpdate: Date.now(),
      imageQuality: this.config.imageQuality,
      videoQuality: this.config.videoQuality,
    });
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
        tensorflowJS,
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
      fps: this.calculateAverageFPS(),
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
  public async optimizeRendering(targetFPS: number = 30, minQuality: number = 0.5): Promise<void> {
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
      if (
        metrics.memoryUsage &&
        metrics.memoryUsage.usedJSHeapSize > metrics.memoryUsage.jsHeapSizeLimit * 0.8
      ) {
        quality *= 0.7;
      }

      // Apply optimizations
      this.applyOptimizations(quality);

      logger.info('Applied rendering optimizations', 'MobileOptimization', {
        quality,
        metrics,
        capabilities,
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

  public getOptimizedImageUrl(url: string, width?: number): string {
    const quality = this.config.imageQuality;
    const targetWidth = width || this.deviceInfo.viewport.width;

    return `${url}?w=${targetWidth}&q=${quality}&auto=format`;
  }

  public getOptimizedVideoUrl(url: string): string {
    const quality = this.config.videoQuality;
    return `${url}?quality=${quality}`;
  }

  public shouldPrefetch(distance: number): boolean {
    return distance <= this.config.prefetchDistance;
  }

  public getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }

  public getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  public async optimizeForCurrentDevice(): Promise<void> {
    await this.initializeDeviceInfo();
    this.updateConfiguration();
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

export {};
