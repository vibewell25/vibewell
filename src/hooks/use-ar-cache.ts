'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { arModelCache } from '@/lib/cache';
import { useAnalytics } from './use-analytics';

export interface UseARCacheOptions {
  /**
   * Enable prefetching of models likely to be used
   */
  prefetchEnabled?: boolean;
  
  /**
   * Automatically adjust cache size based on device
   */
  autoAdjustCacheSize?: boolean;
  
  /**
   * Custom error handler
   */
  onError?: (error: Error) => void;
}

/**
 * React hook for accessing the AR model cache
 * Provides an interface for components to load, prefetch, and manage cached AR models
 */
export function useARCache(options: UseARCacheOptions = {}) {
  const { 
    prefetchEnabled = true, 
    autoAdjustCacheSize = true,
    onError
  } = options;
  
  const [modelLoading, setModelLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [modelError, setModelError] = useState<Error | null>(null);
  const [stats, setStats] = useState<{
    modelCount: number;
    totalSize: number;
    deviceQuota: number;
    percentUsed: number;
  }>({
    modelCount: 0,
    totalSize: 0,
    deviceQuota: 0,
    percentUsed: 0,
  });
  
  const { trackEvent } = useAnalytics();
  const abortControllers = useRef<Map<string, AbortController>>(new Map());
  
  // Initialize and apply settings
  useEffect(() => {
    // Update cache settings based on options
    const updateSettings = async () => {
      await arModelCache.updateSettings({
        prefetchEnabled
      });
      
      // Get initial stats
      const cacheStats = await arModelCache.getCacheStats();
      setStats({
        modelCount: cacheStats.modelCount,
        totalSize: cacheStats.totalSize,
        deviceQuota: cacheStats.deviceQuota,
        percentUsed: cacheStats.percentUsed,
      });
    };
    
    updateSettings();
    
    // Set up event listeners for cache events
    const handleCacheError = (event: any) => {
      if (event.error) {
        console.error('AR cache error:', event.error);
        if (onError) {
          onError(event.error);
        }
      }
    };
    
    arModelCache.addEventListener('error', handleCacheError);
    
    // Cleanup function
    return () => {
      arModelCache.removeEventListener('error', handleCacheError);
      
      // Cancel any pending requests
      abortControllers.current.forEach(controller => {
        controller.abort();
      });
    };
  }, [prefetchEnabled, onError, trackEvent]);
  
  /**
   * Get a model from the cache, fetching it if not present
   */
  const getModel = useCallback(async (
    url: string,
    type: string,
    progressCallback?: (progress: number) => void
  ): Promise<Uint8Array> => {
    if (!url) {
      throw new Error('URL is required');
    }
    
    try {
      setModelLoading(true);
      setModelError(null);
      setLoadingProgress(0);
      
      // Try to get from cache first
      const cachedModel = await arModelCache.getModel(url, type);
      if (cachedModel) {
        trackEvent('model_loaded_from_cache', { type });
        setLoadingProgress(100);
        setModelLoading(false);
        return cachedModel;
      }
      
      // Not in cache, need to fetch
      // Create an abort controller for this request
      const controller = new AbortController();
      abortControllers.current.set(url, controller);
      
      try {
        const response = await fetch(url, { 
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load model: HTTP ${response.status}`);
        }
        
        // Get total size from content length if available
        const totalSize = Number(response.headers.get('content-length')) || 0;
        
        // Set up progress tracking with a reader
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Response body reader not available');
        }
        
        let receivedLength = 0;
        const chunks: Uint8Array[] = [];
        
        // Read the stream
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
          
          // Add this chunk
          chunks.push(value);
          receivedLength += value.length;
          
          // Calculate progress if possible
          if (totalSize > 0 && progressCallback) {
            const progress = Math.round((receivedLength / totalSize) * 100);
            setLoadingProgress(progress);
            progressCallback(progress);
          }
        }
        
        // Combine chunks into a single Uint8Array
        const modelData = new Uint8Array(receivedLength);
        let position = 0;
        for (const chunk of chunks) {
          modelData.set(chunk, position);
          position += chunk.length;
        }
        
        // Add to cache
        await arModelCache.addModel(url, type, modelData);
        
        // Update stats
        const cacheStats = await arModelCache.getCacheStats();
        setStats({
          modelCount: cacheStats.modelCount,
          totalSize: cacheStats.totalSize,
          deviceQuota: cacheStats.deviceQuota,
          percentUsed: cacheStats.percentUsed,
        });
        
        trackEvent('model_loaded', { type, size: modelData.byteLength });
        setLoadingProgress(100);
        setModelLoading(false);
        
        return modelData;
      } finally {
        // Clean up the abort controller
        abortControllers.current.delete(url);
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // Request was aborted, don't treat as an error
        console.log('Model loading aborted');
        setModelLoading(false);
        return new Uint8Array();
      }
      
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Error loading model:', err);
      
      trackEvent('model_load_error', { 
        type,
        error: err.message
      });
      
      setModelError(err);
      setModelLoading(false);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    }
  }, [trackEvent, onError]);
  
  /**
   * Prefetch models for future use
   */
  const prefetchModels = useCallback(async (
    urls: Array<{ url: string, type: string, priority?: number }>
  ): Promise<void> => {
    if (!prefetchEnabled) return;
    
    for (const { url, type, priority } of urls) {
      await arModelCache.prefetchModel(url, type, priority);
    }
  }, [prefetchEnabled]);
  
  /**
   * Clear the entire cache
   */
  const clearARCache = useCallback(async () => {
    try {
      trackEvent('clear_cache_started');
      await arModelCache.clearCache();
      
      // Update stats
      const cacheStats = await arModelCache.getCacheStats();
      setStats({
        modelCount: cacheStats.modelCount,
        totalSize: cacheStats.totalSize,
        deviceQuota: cacheStats.deviceQuota,
        percentUsed: cacheStats.percentUsed,
      });
      
      trackEvent('clear_cache_completed');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      trackEvent('clear_cache_error', { 
        error: err.message
      });
      
      if (onError) {
        onError(err);
      } else {
        console.error('Error clearing AR cache:', err);
      }
    }
  }, [trackEvent, onError]);
  
  /**
   * Cancel loading of a specific model
   */
  const cancelModelLoading = useCallback((url: string) => {
    const controller = abortControllers.current.get(url);
    if (controller) {
      controller.abort();
      abortControllers.current.delete(url);
      setModelLoading(false);
    }
  }, []);

  return {
    getModel,
    prefetchModel: (url: string, type: string, priority?: number) => 
      arModelCache.prefetchModel(url, type, priority),
    prefetchModels,
    clearCache: clearARCache,
    cancelLoading: cancelModelLoading,
    isLoading: modelLoading,
    loadingProgress,
    error: modelError,
    stats
  };
} 