import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import type { Material, Texture, Object3D, WebGLRenderer } from 'three';

interface ResourceStats {
  geometryCount: number;
  textureCount: number;
  materialCount: number;
  totalMemory: number;
  textureMemory: number;
  geometryMemory: number;
}

interface CacheConfig {
  maxGeometries?: number;
  maxTextures?: number;
  maxTotalMemoryMB?: number;
  textureDisposalStrategy?: 'lru' | 'size';
  enableCompression?: boolean;
}

interface DisposableResource {
  dispose: () => void;
}

/**
 * Hook for managing AR resources and memory
 */
export function useARResourceManager(config: CacheConfig = {}) {
  const {
    maxGeometries = 100,
    maxTextures = 50,
    maxTotalMemoryMB = 512,
    textureDisposalStrategy = 'lru',
    enableCompression = true
  } = config;

  const { gl } = useThree();
  const renderer = gl as WebGLRenderer;
  const resourceCache = useRef(new Map<string, Object3D | Texture | Material>());
  const lastAccessTime = useRef(new Map<string, number>());
  const disposalQueue = useRef<string[]>([]);
  const compressionWorker = useRef<Worker | null>(null);

  // Initialize compression worker
  useEffect(() => {
    if (enableCompression) {
      compressionWorker.current = new Worker('/workers/texture-compressor.js');
      compressionWorker.current.onmessage = (e) => {
        const { textureId, compressedData } = e.data;
        updateTexture(textureId, compressedData);
      };

      return () => {
        compressionWorker.current?.terminate();
      };
    }
  }, [enableCompression]);

  // Monitor and manage resources
  useEffect(() => {
    const interval = setInterval(() => {
      const stats = getResourceStats();
      
      // Check memory limits
      if (stats.totalMemory > maxTotalMemoryMB || 
          stats.geometryCount > maxGeometries ||
          stats.textureCount > maxTextures) {
        freeResources();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [maxGeometries, maxTextures, maxTotalMemoryMB]);

  // Get current resource statistics
  const getResourceStats = (): ResourceStats => {
    const info = renderer.info;
    const geometryMemory = (info.memory?.geometries || 0) * 0.25; // Estimated MB per geometry
    const textureMemory = (info.memory?.textures || 0) * 2; // Estimated MB per texture

    return {
      geometryCount: info.memory?.geometries || 0,
      textureCount: info.memory?.textures || 0,
      materialCount: info.memory?.materials || 0,
      totalMemory: geometryMemory + textureMemory,
      textureMemory,
      geometryMemory
    };
  };

  // Add resource to cache
  const cacheResource = (id: string, resource: Object3D | Texture | Material) => {
    if (resourceCache.current.has(id)) {
      console.warn(`Resource ${id} already exists in cache`);
      return;
    }

    resourceCache.current.set(id, resource);
    lastAccessTime.current.set(id, Date.now());

    // Compress textures if enabled
    if (enableCompression && resource instanceof THREE.Texture && compressionWorker.current) {
      compressionWorker.current.postMessage({
        textureId: id,
        imageData: (resource.image as HTMLImageElement).src
      });
    }
  };

  // Get resource from cache
  const getResource = (id: string) => {
    const resource = resourceCache.current.get(id);
    if (resource) {
      lastAccessTime.current.set(id, Date.now());
    }
    return resource;
  };

  // Update compressed texture
  const updateTexture = (id: string, compressedData: ArrayBuffer) => {
    const texture = resourceCache.current.get(id);
    if (texture instanceof THREE.Texture) {
      const loader = new THREE.CompressedTextureLoader();
      const compressedTexture = loader.parse(compressedData);
      
      // Copy parameters
      compressedTexture.wrapS = texture.wrapS;
      compressedTexture.wrapT = texture.wrapT;
      compressedTexture.magFilter = texture.magFilter;
      compressedTexture.minFilter = texture.minFilter;

      // Replace texture
      if ('dispose' in texture) {
        (texture as unknown as DisposableResource).dispose();
      }
      resourceCache.current.set(id, compressedTexture);
    }
  };

  // Free resources based on strategy
  const freeResources = () => {
    const stats = getResourceStats();
    const entriesToRemove: string[] = [];

    if (textureDisposalStrategy === 'lru') {
      // Sort by last access time
      const sorted = Array.from(lastAccessTime.current.entries())
        .sort(([, timeA], [, timeB]) => timeA - timeB);

      // Remove oldest entries until under limits
      for (const [id] of sorted) {
        if (stats.totalMemory <= maxTotalMemoryMB &&
            stats.textureCount <= maxTextures &&
            stats.geometryCount <= maxGeometries) {
          break;
        }

        entriesToRemove.push(id);
        const resource = resourceCache.current.get(id);
        if (resource && 'dispose' in resource) {
          (resource as unknown as DisposableResource).dispose();
          resourceCache.current.delete(id);
          lastAccessTime.current.delete(id);
        }
      }
    } else {
      // Sort by texture size
      const textureEntries = Array.from(resourceCache.current.entries())
        .filter(([, resource]) => resource instanceof THREE.Texture)
        .sort(([, textureA], [, textureB]) => {
          const sizeA = (textureA as THREE.Texture).image?.width * (textureA as THREE.Texture).image?.height || 0;
          const sizeB = (textureB as THREE.Texture).image?.width * (textureB as THREE.Texture).image?.height || 0;
          return sizeB - sizeA;
        });

      // Remove largest textures first
      for (const [id] of textureEntries) {
        if (stats.totalMemory <= maxTotalMemoryMB &&
            stats.textureCount <= maxTextures) {
          break;
        }

        entriesToRemove.push(id);
        const texture = resourceCache.current.get(id);
        if (texture && texture instanceof THREE.Texture && 'dispose' in texture) {
          (texture as unknown as DisposableResource).dispose();
          resourceCache.current.delete(id);
          lastAccessTime.current.delete(id);
        }
      }
    }

    // Add to disposal queue for garbage collection
    disposalQueue.current.push(...entriesToRemove);
    
    // Trigger garbage collection hint
    if (disposalQueue.current.length > 50) {
      disposalQueue.current = [];
      if (typeof window.gc === 'function') {
        window.gc();
      }
    }
  };

  // Dispose all resources
  const disposeAll = () => {
    resourceCache.current.forEach((resource) => {
      if ('dispose' in resource) {
        (resource as unknown as DisposableResource).dispose();
      }
    });
    resourceCache.current.clear();
    lastAccessTime.current.clear();
    disposalQueue.current = [];
  };

  return {
    cacheResource,
    getResource,
    getResourceStats,
    disposeAll
  };
} 