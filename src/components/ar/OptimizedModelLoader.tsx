'use client';

import { useState, useEffect, useRef } from 'react';
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality';
import { Loader2 } from 'lucide-react';

export interface ModelLoaderProps {
  modelId: string;
  enableProgressiveLoading?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * OptimizedModelLoader - A component that loads 3D models with progressive quality
 * and performance optimizations
 */
export function OptimizedModelLoader({
  modelId,
  enableProgressiveLoading = true,
  onLoad,
  onError,
}: ModelLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [modelError, setModelError] = useState<Error | null>(null);
  
  // Get adaptive quality settings based on device capabilities
  const { qualityLevel, adaptiveSettings } = useAdaptiveQuality();
  
  // Simulate progressive loading of model
  useEffect(() => {
    if (!enableProgressiveLoading) {
      // If progressive loading is disabled, just load at the highest quality
      loadModelAtQuality('high');
      return;
    }
    
    // Progressive loading strategy
    const loadModel = async () => {
      try {
        // First load a low-quality version quickly
        await loadModelAtQuality('low');
        setLoadingProgress(30);
        
        // Then medium quality if device supports it
        if (qualityLevel >= 2) {
          await loadModelAtQuality('medium');
          setLoadingProgress(60);
        }
        
        // Finally high quality only for high-end devices
        if (qualityLevel >= 3) {
          await loadModelAtQuality('high');
        }
        
        setLoadingProgress(100);
        setIsLoading(false);
        onLoad?.();
        
      } catch (error) {
        console.error("Error loading model:", error);
        setModelError(error instanceof Error ? error : new Error('Unknown error loading model'));
        onError?.(error instanceof Error ? error : new Error('Unknown error loading model'));
      }
    };
    
    loadModel();
    
    // Cleanup function
    return () => {
      // Cleanup any loaded models or WebGL contexts
      if (containerRef.current) {
        // Remove any 3D renderer elements
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
    };
  }, [modelId, qualityLevel, enableProgressiveLoading, onLoad, onError]);
  
  // Simulate loading a model at different quality levels
  const loadModelAtQuality = async (quality: 'low' | 'medium' | 'high'): Promise<void> => {
    return new Promise((resolve, reject) => {
      // This is a placeholder for actual model loading code
      // In a real implementation, you would:
      // 1. Load the appropriate LOD (Level of Detail) based on quality
      // 2. Set up WebGL/Three.js with the correct performance settings
      // 3. Initialize the AR session with proper configurations
      
      // Simulate network delay and processing time
      const delay = quality === 'low' ? 500 : quality === 'medium' ? 1000 : 1500;
      
      setTimeout(() => {
        // Apply quality-specific settings
        const settings = {
          low: { 
            textureResolution: '512x512',
            geometryDetail: 'simplified',
            maxTriangles: 10000
          },
          medium: {
            textureResolution: '1024x1024',
            geometryDetail: 'balanced',
            maxTriangles: 50000
          },
          high: {
            textureResolution: '2048x2048',
            geometryDetail: 'detailed',
            maxTriangles: 100000
          }
        };
        
        console.log(`Loaded model ${modelId} at ${quality} quality with settings:`, settings[quality]);
        
        // In a real implementation, you would render the model to the containerRef element
        
        resolve();
      }, delay);
    });
  };
  
  // If there's an error loading the model
  if (modelError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-red-50 p-4 rounded-md">
        <p className="text-red-500 mb-2">Error loading model</p>
        <p className="text-sm text-gray-600">{modelError.message}</p>
      </div>
    );
  }
  
  return (
    <div className="w-full relative" style={{ height: '100%', minHeight: '300px' }}>
      {/* The 3D model container */}
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-80 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Loading {modelId} ({loadingProgress}%)
          </p>
          
          {enableProgressiveLoading && loadingProgress >= 30 && (
            <p className="text-xs text-gray-500 mt-1">
              {loadingProgress < 60 
                ? "Basic model loaded. Enhancing details..." 
                : loadingProgress < 100 
                  ? "Enhanced model ready. Finalizing..." 
                  : "High-quality model loaded!"
              }
            </p>
          )}
        </div>
      )}
    </div>
  );
} 