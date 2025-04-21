import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * Performance metrics to be displayed
 */
interface PerformanceMetrics {
  /** Frames per second */
  fps: number;
  /** Number of triangles being rendered */
  triangles: number;
  /** Number of draw calls per frame */
  drawCalls: number;
  /** Memory usage in MB */
  memoryUsage: number;
  /** Flag indicating if there's a performance issue */
  isPerformanceIssue: boolean;
}

/**
 * Props for the PerformanceMonitor component
 */
interface PerformanceMonitorProps {
  /** Whether to apply adaptive quality on performance issues */
  enableAdaptiveQuality?: boolean;
  /** FPS threshold below which performance is considered problematic */
  performanceThreshold?: number;
  /** Whether to only show the monitor in development mode */
  devModeOnly?: boolean;
}

/**
 * PerformanceMonitor component
 *
 * A diagnostic component that monitors and displays real-time performance metrics
 * for a Three.js scene. Can apply automatic optimizations when performance drops.
 *
 * @param props - Component props
 * @returns React component for monitoring WebGL performance
 */
export function PerformanceMonitor({
  enableAdaptiveQuality = true,
  performanceThreshold = 30,
  devModeOnly = true,
}: PerformanceMonitorProps) {
  const { gl } = useThree();
  const frameRate = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const lastUpdate = useRef<number>(Date.now());
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    triangles: 0,
    drawCalls: 0,
    memoryUsage: 0,
    isPerformanceIssue: false,
  });
  const adaptiveQualityTimer = useRef<NodeJS.Timeout | null>(null);

  // Update metrics each frame
  useFrame(() => {
    frameCount.current += 1;
    const now = Date.now();
    const delta = now - lastUpdate.current;

    if (delta > 1000) {
      frameRate.current = (frameCount.current * 1000) / delta;

      // Update metrics
      const fpsValue = Math.round(frameRate.current);
      const isPerformanceIssue = fpsValue < performanceThreshold;

      // Get renderer info
      const info = gl.info;

      setMetrics({
        fps: fpsValue,
        triangles: info.render?.triangles || 0,
        drawCalls: info.render?.calls || 0,
        memoryUsage: (info.memory?.geometries || 0) * 0.25 + (info.memory?.textures || 0) * 2,
        isPerformanceIssue,
      });

      frameCount.current = 0;
      lastUpdate.current = now;

      // Apply adaptive optimizations for sustained low performance
      if (enableAdaptiveQuality && isPerformanceIssue) {
        if (!adaptiveQualityTimer.current) {
          adaptiveQualityTimer.current = setTimeout(() => {
            // Apply progressive optimizations
            const pixelRatio = Math.max(1, window.devicePixelRatio * 0.75);
            gl.setPixelRatio(pixelRatio);

            // Reduce shadow map size
            if (gl.shadowMap.enabled) {
              gl.shadowMap.autoUpdate = false;
              gl.shadowMap.needsUpdate = true;
            }

            adaptiveQualityTimer.current = null;
          }, 2000); // Apply after 2 seconds of poor performance
        }
      } else if (adaptiveQualityTimer.current) {
        clearTimeout(adaptiveQualityTimer.current);
        adaptiveQualityTimer.current = null;
      }
    }
  });

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (adaptiveQualityTimer.current) {
        clearTimeout(adaptiveQualityTimer.current);
      }
    };
  }, []);

  // Only render in development mode if devModeOnly is true
  if (devModeOnly && process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="absolute top-0 left-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded">
      <div>
        FPS: {metrics.fps} {metrics.isPerformanceIssue && '⚠️'}
      </div>
      <div>Triangles: {metrics.triangles.toLocaleString()}</div>
      <div>Draw calls: {metrics.drawCalls}</div>
      <div>Memory: {Math.round(metrics.memoryUsage)}MB</div>
    </div>
  );
}
