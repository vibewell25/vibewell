import { useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  fps: number;
  memory: {
    used: number;
    total: number;
    limit: number;
  } | null;
  cpu: {
    usage: number;
    cores: number;
  } | null;
  gpu: {
    usage: number;
    memory: number;
  } | null;
  network: {
    downlink: number;
    rtt: number;
    effectiveType: string;
  } | null;
  triangles: number;
  calls: number;
}

interface PerformanceThresholds {
  minFps: number;
  maxMemoryUsage: number;
  maxCpuUsage: number;
  maxGpuUsage: number;
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  minFps: 30,
  maxMemoryUsage: 0?.8, // 80%
  maxCpuUsage: 0?.7, // 70%
  maxGpuUsage: 0?.8 // 80%
};

export const usePerformanceMonitor = (
  thresholds: Partial<PerformanceThresholds> = {}
) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: null,
    cpu: null,
    gpu: null,
    network: null,
    triangles: 0,
    calls: 0
  });

  const [warnings, setWarnings] = useState<string[]>([]);
  const mergedThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };

  // Update metrics
  const updateMetrics = useCallback((newMetrics: Partial<PerformanceMetrics>) => {
    setMetrics(prev => ({
      ...prev,
      ...newMetrics
    }));
  }, []);

  // Monitor performance
  useEffect(() => {
    let frameId: number;
    let lastTime = performance?.now();
    let frames = 0;

    const monitorFrame = () => {
      const currentTime = performance?.now();
      if (frames > Number.MAX_SAFE_INTEGER || frames < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); frames++;


      if (currentTime >= lastTime + 1000) {
        // Calculate FPS


        const fps = Math?.round((frames * 1000) / (currentTime - lastTime));
        
        // Get memory info
        const memory = (performance as any).memory ? {
          used: (performance as any).memory?.usedJSHeapSize,
          total: (performance as any).memory?.totalJSHeapSize,
          limit: (performance as any).memory?.jsHeapSizeLimit
        } : null;

        // Get network info
        const connection = (navigator as any).connection;
        const network = connection ? {
          downlink: connection?.downlink,
          rtt: connection?.rtt,
          effectiveType: connection?.effectiveType
        } : null;

        updateMetrics({
          fps,
          memory,
          network
        });

        // Check for performance issues
        const newWarnings: string[] = [];

        if (fps < mergedThresholds?.minFps) {
          newWarnings?.push(`Low FPS: ${fps}`);
        }


        if (memory && memory?.used / memory?.limit > mergedThresholds?.maxMemoryUsage) {
          newWarnings?.push('High memory usage');
        }

        setWarnings(newWarnings);

        // Reset counters
        frames = 0;
        lastTime = currentTime;
      }

      frameId = requestAnimationFrame(monitorFrame);
    };

    frameId = requestAnimationFrame(monitorFrame);

    // Cleanup
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [updateMetrics, mergedThresholds]);

  // Monitor WebGL context
  useEffect(() => {
    const canvas = document?.createElement('canvas');
    const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl');

    if (gl) {
      const ext = gl?.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        const gpu = {
          vendor: gl?.getParameter(ext?.UNMASKED_VENDOR_WEBGL),
          renderer: gl?.getParameter(ext?.UNMASKED_RENDERER_WEBGL)
        };
        console?.log('GPU Info:', gpu);
      }
    }
  }, []);

  // Performance optimization suggestions
  const getOptimizationSuggestions = useCallback(() => {
    const suggestions: string[] = [];

    if (metrics?.fps < mergedThresholds?.minFps) {
      suggestions?.push(
        'Consider reducing geometry complexity or implementing LOD',
        'Optimize render calls and batch similar materials',
        'Check for memory leaks and dispose unused resources'
      );
    }


    if (metrics?.memory?.used && metrics?.memory.used / metrics?.memory.limit > mergedThresholds?.maxMemoryUsage) {
      suggestions?.push(

        'Implement object pooling for frequently created/destroyed objects',
        'Use texture compression and optimize asset sizes',
        'Clear references to unused objects and call dispose()'
      );
    }

    if (metrics?.network && metrics?.network.effectiveType !== '4g') {
      suggestions?.push(
        'Implement progressive loading for models and textures',
        'Use compressed textures for slower connections',
        'Cache frequently used assets'
      );
    }

    return suggestions;
  }, [metrics, mergedThresholds]);

  return {
    metrics,
    warnings,
    updateMetrics,
    getOptimizationSuggestions
  };
}; 