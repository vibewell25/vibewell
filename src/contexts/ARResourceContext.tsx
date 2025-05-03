/**
 * AR Resource Management Context
 * 
 * This context provides centralized management of AR/3D resources to:
 * - Prevent memory leaks by properly disposing unused resources
 * - Track and limit resource usage
 * - Optimize loading and unloading of textures and models
 * - Monitor performance metrics
 */

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { logger } from '@/lib/logger';
import { getCacheService, PREFIX, TTL } from '@/lib/cache-service';

// Types for resource management
interface ResourceStats {
  texturesLoaded: number;
  textureMemory: number; // In MB
  geometriesLoaded: number;
  geometryMemory: number; // In MB
  drawCalls: number;
  triangles: number;
  fps: number;
}

interface ResourceMap {
  [key: string]: {
    resource: THREE.Object3D | THREE.Texture | THREE.Material | THREE.BufferGeometry;
    type: 'texture' | 'geometry' | 'model' | 'material';
    lastUsed: number;
    size: number; // Approximate size in bytes
  };
}

interface ARResourceContextType {
  registerResource: (
    key: string,
    resource: THREE.Object3D | THREE.Texture | THREE.Material | THREE.BufferGeometry,
    type: 'texture' | 'geometry' | 'model' | 'material',
    size?: number
  ) => void;
  unregisterResource: (key: string) => void;
  preloadModel: (url: string) => Promise<void>;
  preloadTexture: (url: string) => Promise<THREE.Texture>;
  disposeUnusedResources: () => void;
  getStats: () => ResourceStats;
  clearResources: () => void;
  optimizeMemoryUsage: () => void;
  pauseRendering: () => void;
  resumeRendering: () => void;
  isRendering: boolean;
}

// Create context with default values
const ARResourceContext = createContext<ARResourceContextType>({
  registerResource: () => {},
  unregisterResource: () => {},
  preloadModel: async () => {},
  preloadTexture: async () => new THREE.Texture(),
  disposeUnusedResources: () => {},
  getStats: () => ({
    texturesLoaded: 0,
    textureMemory: 0,
    geometriesLoaded: 0,
    geometryMemory: 0,
    drawCalls: 0,
    triangles: 0,
    fps: 0,
  }),
  clearResources: () => {},
  optimizeMemoryUsage: () => {},
  pauseRendering: () => {},
  resumeRendering: () => {},
  isRendering: true,
});

// Resource manager provider component
export const ARResourceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [resources, setResources] = useState<ResourceMap>({});
  const [stats, setStats] = useState<ResourceStats>({
    texturesLoaded: 0,
    textureMemory: 0,
    geometriesLoaded: 0,
    geometryMemory: 0,
    drawCalls: 0,
    triangles: 0,
    fps: 0,
  });
  const [isRendering, setIsRendering] = useState(true);
  
  const resourceRef = useRef(resources);
  const textureLoader = useRef(new THREE.TextureLoader());
  const lastStatsUpdate = useRef(Date.now());
  const frameCountRef = useRef(0);
  const lastFrameTime = useRef(Date.now());
  
  // Update ref when state changes
  useEffect(() => {
    resourceRef.current = resources;
  }, [resources]);
  
  // Handle memory cleanup on unmount
  useEffect(() => {
    return () => {
      clearResources();
    };
  }, []);

  // Update stats periodically
  useEffect(() => {
    const updateInterval = setInterval(() => {
      updateStats();
    }, 5000);
    
    return () => {
      clearInterval(updateInterval);
    };
  }, []);
  
  // Automatic resource cleanup based on time
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      disposeUnusedResources();
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);
  
  // Register a new resource
  const registerResource = (
    key: string,
    resource: THREE.Object3D | THREE.Texture | THREE.Material | THREE.BufferGeometry,
    type: 'texture' | 'geometry' | 'model' | 'material',
    size: number = 0
  ) => {
    // Calculate approximate size if not provided
    let estimatedSize = size;
    
    if (size === 0) {
      if (type === 'texture' && resource instanceof THREE.Texture) {
        // Estimate texture size: width * height * 4 bytes (RGBA)
        const width = resource.image?.width || 512;
        const height = resource.image?.height || 512;
        estimatedSize = width * height * 4;
      } else if (type === 'geometry' && resource instanceof THREE.BufferGeometry) {
        // Estimate geometry size based on vertex count
        const position = resource.getAttribute('position');
        const positionCount = position ? position.count : 0;
        estimatedSize = positionCount * 12; // 3 floats per vertex * 4 bytes per float
      }
    }
    
    setResources(prev => ({
      ...prev,
      [key]: {
        resource,
        type,
        lastUsed: Date.now(),
        size: estimatedSize,
      },
    }));
    
    logger.debug(`AR resource registered: ${key} (${type})`);
  };
  
  // Unregister and cleanup a resource
  const unregisterResource = (key: string) => {
    setResources(prev => {
      const newResources = { ...prev };
      
      if (newResources[key]) {
        const { resource, type } = newResources[key];
        
        // Properly dispose based on resource type
        if (type === 'texture' && resource instanceof THREE.Texture) {
          resource.dispose();
        } else if (type === 'geometry' && resource instanceof THREE.BufferGeometry) {
          resource.dispose();
        } else if (type === 'material' && resource instanceof THREE.Material) {
          resource.dispose();
        } else if (type === 'model' && resource instanceof THREE.Object3D) {
          // Traverse and dispose all geometries and materials
          resource.traverse(child => {
            if (child instanceof THREE.Mesh) {
              if (child.geometry) child.geometry.dispose();
              
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach(material => material.dispose());
                } else {
                  child.material.dispose();
                }
              }
            }
          });
        }
        
        delete newResources[key];
        logger.debug(`AR resource unregistered: ${key}`);
      }
      
      return newResources;
    });
  };
  
  // Preload a 3D model
  const preloadModel = async (url: string): Promise<void> => {
    try {
      const cache = getCacheService();
      const cacheKey = `${PREFIX.AR_MODEL}${url}`;
      
      // Check if we've already loaded this model
      if (resourceRef.current[url]) {
        // Update last used timestamp
        setResources(prev => ({
          ...prev,
          [url]: {
            ...prev[url],
            lastUsed: Date.now(),
          },
        }));
        return;
      }
      
      // Check if model is in cache
      const cached = await cache.get(cacheKey);
      if (cached) {
        logger.debug(`AR model loaded from cache: ${url}`);
        // We can't cache the actual model object, just record that it was requested
        return;
      }
      
      logger.debug(`Preloading AR model: ${url}`);
      
      // Load the model
      useGLTF.preload(url);
      
      // Add to cache
      await cache.set(cacheKey, { url, timestamp: Date.now() }, TTL.LONG);
      
    } catch (error) {
      logger.error(`Error preloading model: ${url}`, error);
    }
  };
  
  // Preload a texture
  const preloadTexture = async (url: string): Promise<THREE.Texture> => {
    return new Promise((resolve, reject) => {
      // Check if we already have this texture
      if (resourceRef.current[url] && resourceRef.current[url].type === 'texture') {
        // Update last used timestamp
        setResources(prev => ({
          ...prev,
          [url]: {
            ...prev[url],
            lastUsed: Date.now(),
          },
        }));
        
        resolve(resourceRef.current[url].resource as THREE.Texture);
        return;
      }
      
      // Load new texture
      textureLoader.current.load(
        url,
        texture => {
          // Optimize texture
          texture.generateMipmaps = false;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.needsUpdate = true;
          
          // Register the loaded texture
          const textureWidth = texture.image?.width || 512;
          const textureHeight = texture.image?.height || 512;
          const textureSize = textureWidth * textureHeight * 4; // RGBA
          
          registerResource(url, texture, 'texture', textureSize);
          
          resolve(texture);
        },
        undefined, // Progress callback
        error => {
          logger.error(`Error loading texture: ${url}`, error);
          reject(error);
        }
      );
    });
  };
  
  // Dispose resources that haven't been used recently
  const disposeUnusedResources = () => {
    const now = Date.now();
    const unusedThreshold = 5 * 60 * 1000; // 5 minutes
    
    setResources(prev => {
      const newResources = { ...prev };
      let disposed = 0;
      
      Object.keys(newResources).forEach(key => {
        const resource = newResources[key];
        
        // Skip recently used resources
        if (now - resource.lastUsed < unusedThreshold) {
          return;
        }
        
        // Properly dispose based on resource type
        if (resource.type === 'texture' && resource.resource instanceof THREE.Texture) {
          resource.resource.dispose();
        } else if (resource.type === 'geometry' && resource.resource instanceof THREE.BufferGeometry) {
          resource.resource.dispose();
        } else if (resource.type === 'material' && resource.resource instanceof THREE.Material) {
          resource.resource.dispose();
        } else if (resource.type === 'model' && resource.resource instanceof THREE.Object3D) {
          // Traverse and dispose all geometries and materials
          resource.resource.traverse(child => {
            if (child instanceof THREE.Mesh) {
              if (child.geometry) child.geometry.dispose();
              
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach(material => material.dispose());
                } else {
                  child.material.dispose();
                }
              }
            }
          });
        }
        
        delete newResources[key];
        disposed++;
      });
      
      if (disposed > 0) {
        logger.debug(`Disposed ${disposed} unused AR resources`);
      }
      
      return newResources;
    });
  };
  
  // Clear all resources
  const clearResources = () => {
    setResources(prev => {
      // Dispose all resources
      Object.keys(prev).forEach(key => {
        const { resource, type } = prev[key];
        
        if (type === 'texture' && resource instanceof THREE.Texture) {
          resource.dispose();
        } else if (type === 'geometry' && resource instanceof THREE.BufferGeometry) {
          resource.dispose();
        } else if (type === 'material' && resource instanceof THREE.Material) {
          resource.dispose();
        } else if (type === 'model' && resource instanceof THREE.Object3D) {
          resource.traverse(child => {
            if (child instanceof THREE.Mesh) {
              if (child.geometry) child.geometry.dispose();
              
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach(material => material.dispose());
                } else {
                  child.material.dispose();
                }
              }
            }
          });
        }
      });
      
      logger.debug(`Cleared all AR resources (${Object.keys(prev).length} items)`);
      
      return {};
    });
  };
  
  // Force garbage collection for unused resources
  const optimizeMemoryUsage = () => {
    // Dispose unused resources
    disposeUnusedResources();
    
    // Force renderer to release GPU memory (would be done in a component using this)
    THREE.Cache.clear();
    
    logger.debug('AR resource memory optimized');
  };
  
  // Update performance metrics
  const updateStats = () => {
    const now = Date.now();
    const elapsedTime = now - lastStatsUpdate.current;
    lastStatsUpdate.current = now;
    
    // Calculate FPS
    const frameCount = frameCountRef.current;
    frameCountRef.current = 0;
    const fps = Math.round((frameCount * 1000) / elapsedTime);
    
    // Count resources by type
    let texturesLoaded = 0;
    let textureMemory = 0;
    let geometriesLoaded = 0;
    let geometryMemory = 0;
    
    Object.keys(resourceRef.current).forEach(key => {
      const { type, size } = resourceRef.current[key];
      
      if (type === 'texture') {
        texturesLoaded++;
        textureMemory += size;
      } else if (type === 'geometry') {
        geometriesLoaded++;
        geometryMemory += size;
      }
    });
    
    // Convert bytes to MB
    textureMemory = Math.round(textureMemory / (1024 * 1024) * 100) / 100;
    geometryMemory = Math.round(geometryMemory / (1024 * 1024) * 100) / 100;
    
    setStats({
      texturesLoaded,
      textureMemory,
      geometriesLoaded,
      geometryMemory,
      drawCalls: stats.drawCalls, // These would be updated by components
      triangles: stats.triangles,
      fps,
    });
  };
  
  // Track frame for FPS calculation
  const trackFrame = () => {
    frameCountRef.current++;
    lastFrameTime.current = Date.now();
  };
  
  // Pause rendering to save resources
  const pauseRendering = () => {
    setIsRendering(false);
    logger.debug('AR rendering paused');
  };
  
  // Resume rendering
  const resumeRendering = () => {
    setIsRendering(true);
    logger.debug('AR rendering resumed');
  };
  
  // Get current performance stats
  const getStats = () => stats;
  
  // Context value
  const contextValue: ARResourceContextType = {
    registerResource,
    unregisterResource,
    preloadModel,
    preloadTexture,
    disposeUnusedResources,
    getStats,
    clearResources,
    optimizeMemoryUsage,
    pauseRendering,
    resumeRendering,
    isRendering,
  };
  
  return (
    <ARResourceContext.Provider value={contextValue}>
      {children}
    </ARResourceContext.Provider>
  );
};

// Custom hook for accessing the context
export const useARResources = () => useContext(ARResourceContext);

// Custom hook for tracking frame rate
export const useFrameTracker = () => {
  const { isRendering } = useARResources();
  
  useEffect(() => {
    if (!isRendering) return;
    
    let frameId: number;
    let previousTime = performance.now();
    
    const animate = (time: number) => {
      const delta = time - previousTime;
      previousTime = time;
      
      // Here you could update your own FPS counter
      
      frameId = requestAnimationFrame(animate);
    };
    
    frameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isRendering]);
};

export default ARResourceContext; 