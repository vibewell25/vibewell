'use client';

import { useState, useEffect } from 'react';

// Add type extension for Navigator to include deviceMemory property
declare global {
  interface Navigator {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  }
}

interface AdaptiveSettings {
  maxTextureSize: number;
  maxPolygons: number;
  shadows: boolean;
  antialiasing: boolean;
  effects: 'none' | 'basic' | 'advanced';
  targetFrameRate: number;
}

/**
 * Hook that determines the device's capabilities and returns appropriate
 * quality settings for 3D rendering and AR experiences
 */
export function useAdaptiveQuality() {
  const [qualityLevel, setQualityLevel] = useState(2); // Default to medium (1=low, 2=medium, 3=high)
  const [adaptiveSettings, setAdaptiveSettings] = useState<AdaptiveSettings>({
    maxTextureSize: 1024,
    maxPolygons: 50000,
    shadows: true,
    antialiasing: true,
    effects: 'basic',
    targetFrameRate: 60
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectDeviceCapabilities = async () => {
      setIsLoading(true);
      
      try {
        // Get device information
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const isLowEndDevice = isMobile && (
          (navigator.deviceMemory && navigator.deviceMemory < 4) || 
          (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4)
        );
        const isHighEndDevice = !isMobile || (
          (navigator.deviceMemory && navigator.deviceMemory >= 8) && 
          (navigator.hardwareConcurrency && navigator.hardwareConcurrency >= 6)
        );
        
        // Check WebGL capabilities
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        if (!gl) {
          // WebGL not supported - use lowest quality
          setQualityLevel(1);
          setAdaptiveSettings({
            maxTextureSize: 512,
            maxPolygons: 10000,
            shadows: false,
            antialiasing: false,
            effects: 'none',
            targetFrameRate: 30
          });
          setIsLoading(false);
          return;
        }
        
        // Check max texture size
        const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        
        // Benchmark rendering performance (simple test)
        const startTime = performance.now();
        let frameCount = 0;
        const testDuration = 500; // ms
        
        // Define renderTestFrame outside the block to avoid strict mode issues
        const renderTestFrame = () => {
          if (!gl) return;
          
          // Simple rendering test
          gl.clearColor(0, 0, 0, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);
          frameCount++;
          
          const elapsed = performance.now() - startTime;
          if (elapsed < testDuration) {
            requestAnimationFrame(renderTestFrame);
          } else {
            // Calculate approximate FPS
            const fps = (frameCount / elapsed) * 1000;
            finalizeSettings(
              fps, 
              maxTextureSize, 
              Boolean(isLowEndDevice), 
              Boolean(isHighEndDevice)
            );
          }
        };
        
        renderTestFrame();
      } catch (error) {
        console.error("Error detecting device capabilities:", error);
        // Fallback to medium quality
        setQualityLevel(2);
        setAdaptiveSettings({
          maxTextureSize: 1024,
          maxPolygons: 50000,
          shadows: true,
          antialiasing: true,
          effects: 'basic',
          targetFrameRate: 60
        });
        setIsLoading(false);
      }
    };
    
    const finalizeSettings = (
      fps: number, 
      maxTextureSize: number, 
      isLowEndDevice: boolean, 
      isHighEndDevice: boolean
    ) => {
      let level: 1 | 2 | 3;
      let settings: AdaptiveSettings;
      
      if (fps < 30 || isLowEndDevice) {
        // Low-end device or poor performance
        level = 1;
        settings = {
          maxTextureSize: Math.min(1024, maxTextureSize),
          maxPolygons: 10000,
          shadows: false,
          antialiasing: false,
          effects: 'none',
          targetFrameRate: 30
        };
      } else if (fps > 55 && isHighEndDevice) {
        // High-end device with good performance
        level = 3;
        settings = {
          maxTextureSize: Math.min(2048, maxTextureSize),
          maxPolygons: 100000,
          shadows: true,
          antialiasing: true,
          effects: 'advanced',
          targetFrameRate: 60
        };
      } else {
        // Medium-quality device
        level = 2;
        settings = {
          maxTextureSize: Math.min(1024, maxTextureSize),
          maxPolygons: 50000,
          shadows: true,
          antialiasing: true,
          effects: 'basic',
          targetFrameRate: 45
        };
      }
      
      setQualityLevel(level);
      setAdaptiveSettings(settings);
      setIsLoading(false);
    };
    
    detectDeviceCapabilities();
    
    // Add a separate function for battery level check
    const checkBatteryStatus = () => {
      if ('getBattery' in navigator) {
        // @ts-expect-error - getBattery may not be recognized in TypeScript
        navigator.getBattery().then((battery: any) => {
          if (battery.level < 0.2 && !battery.charging) {
            // Ensure we have a valid quality level to work with
            const currentLevel = qualityLevel || 2;
            const newQualityLevel = Math.max(1, currentLevel - 1);
            setQualityLevel(newQualityLevel);
            setAdaptiveSettings((prev: AdaptiveSettings) => {
              // Force boolean type for antialiasing
              const isHigherQuality = Boolean(newQualityLevel > 1);
              return {
                ...prev,
                shadows: false,
                antialiasing: isHigherQuality,
                effects: isHigherQuality ? 'basic' : 'none',
                targetFrameRate: isHigherQuality ? 45 : 30
              };
            });
          }
        });
      }
    };

    checkBatteryStatus();
  }, []);
  
  return {
    qualityLevel, // 1=low, 2=medium, 3=high
    adaptiveSettings,
    isLoading
  };
} 