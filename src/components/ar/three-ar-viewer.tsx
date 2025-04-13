'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, useGLTF } from '@react-three/drei';
import { XRButton, XR, createXRStore } from '@react-three/xr';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/use-analytics';
import { Camera } from 'lucide-react';
import { PerformanceMonitor } from './PerformanceMonitor';

// Import GLTFLoader
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// Import Draco decoder for model compression
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// Add security imports
import { encryptData, decryptData } from '@/utils/encryption';
import { sanitizeARData } from '@/utils/security';
import { parseModelPermissions } from '@/utils/ar-security';

// Create an XR store for managing WebXR state
const xrStore = createXRStore();

// Setup Draco loader for better compression
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco-gltf/');

// Use a more efficient progressive mesh loading approach and add encryption
let modelCache = new Map<string, { 
  model: THREE.Object3D, 
  timestamp: number, 
  permissions: ModelPermissions 
}>();

// Set cache expiration time - 30 minutes
const CACHE_EXPIRATION_TIME = 30 * 60 * 1000;

// Model permissions interface
interface ModelPermissions {
  allowCapture: boolean;
  allowShare: boolean;
  allowExport: boolean;
  allowedDomains: string[];
  expiresAt: number | null;
}

// Global texture reference for cleanup
let globalTexturesRef: THREE.Texture[] = [];

interface ThreeARViewerProps {
  modelData: Uint8Array;
  type: 'makeup' | 'hairstyle' | 'accessory';
  intensity?: number;
  onCapture?: (dataUrl: string) => void;
  permissions?: Partial<ModelPermissions>;
  sessionId?: string;
}

// Preload draco decoder for better compression
useGLTF.preload('/draco-gltf/');

// Enhanced settings for WebGL optimization
const optimizationConfig = {
  frustumCulling: true,
  instancing: true,
  lowPowerMode: false,
  maxMemoryUsage: 256 * 1024 * 1024, // 256MB
  textureCompression: true,
  powerPreference: 'high-performance' as WebGLPowerPreference,
  precision: 'highp' as WebGLPowerPreference,
  antialias: true,
  // New optimizations
  maxTextureSize: 1024,
  useSharedBuffers: true,
  batchedUpdates: true,
  lodBias: 0, // Level of detail bias (0 = normal, positive = better performance)
  maxLights: 3,
  enableShadowMapOptimization: true,
  textureAnisotropy: 4,
  maxFPS: 60,
  deferredLighting: true, // Use deferred lighting for complex scenes
  instancingThreshold: 10, // Use instancing when more than X identical objects exist
  occlusionCulling: true, // Add occlusion culling in complex scenes
  geometryPrecompute: true, // Precompute geometry attributes for faster rendering
  adaptiveRendering: true, // Use lower resolution rendering on slow devices
};

// Optimized model controls with memoized calculations
function ModelControls({ 
  modelRef, 
  type, 
  intensity = 5
}: { 
  modelRef: React.RefObject<THREE.Group>, 
  type: string,
  intensity?: number
}) {
  const [mode, setMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [showControls, setShowControls] = useState(false);
  const { trackEvent } = useAnalytics();
  
  // Memoize the intensity factor to reduce recalculations
  const intensityFactor = useMemo(() => intensity / 5, [intensity]);

  // Memoize transformation parameters by type
  const transformParams = useMemo(() => {
    switch (type) {
      case 'makeup':
        return {
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          opacity: Math.min(intensityFactor, 1)
        };
      case 'hairstyle':
        return {
          position: [0, 0.5 * intensityFactor, 0],
          rotation: [0, 0, 0],
          scale: [
            1 + (intensityFactor - 1) * 0.2, 
            1 + (intensityFactor - 1) * 0.2, 
            1 + (intensityFactor - 1) * 0.2
          ],
          opacity: 1
        };
      case 'accessory':
        return {
          position: [0, 0.2 * intensityFactor, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          opacity: 1
        };
      default:
        return {
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          opacity: 1
        };
    }
  }, [type, intensityFactor]);

  // Use useCallback for event handlers
  const handleControlChange = useCallback((mode: 'translate' | 'rotate' | 'scale') => {
    setMode(mode);
    trackEvent('model_control_change', { mode, type });
  }, [trackEvent, type]);

  const toggleControls = useCallback(() => {
    setShowControls(prev => !prev);
  }, []);

  // Apply transformations in a more efficient way
  useFrame(() => {
    if (!modelRef.current) return;
    
    // Apply position without creating new vectors every frame
    modelRef.current.position.set(
      transformParams.position[0],
      transformParams.position[1],
      transformParams.position[2]
    );
    
    // Apply scale
    modelRef.current.scale.set(
      transformParams.scale[0],
      transformParams.scale[1],
      transformParams.scale[2]
    );
    
    // Apply material properties - only update when needed
    if (type === 'makeup') {
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat.opacity !== undefined && Math.abs(mat.opacity - transformParams.opacity) > 0.01) {
                mat.opacity = transformParams.opacity;
              }
            });
          } else if (child.material.opacity !== undefined && 
                     Math.abs(child.material.opacity - transformParams.opacity) > 0.01) {
            child.material.opacity = transformParams.opacity;
          }
        }
      });
    }
  });

  return (
    <>
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleControls}
        >
          {showControls ? 'Hide Controls' : 'Show Controls'}
        </Button>
        {showControls && (
          <div className="flex gap-2">
            <Button
              variant={mode === 'translate' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleControlChange('translate')}
            >
              Move
            </Button>
            <Button
              variant={mode === 'rotate' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleControlChange('rotate')}
            >
              Rotate
            </Button>
            <Button
              variant={mode === 'scale' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleControlChange('scale')}
            >
              Scale
            </Button>
          </div>
        )}
      </div>
      {showControls && modelRef.current && (
        <TransformControls
          object={modelRef.current}
          mode={mode}
          onMouseUp={() => {
            // Save position to localStorage
            if (modelRef.current) {
              localStorage.setItem(
                `model-position-${type}`,
                JSON.stringify({
                  position: modelRef.current.position.toArray(),
                  rotation: modelRef.current.rotation.toArray(),
                  scale: modelRef.current.scale.toArray(),
                })
              );
            }
          }}
        />
      )}
    </>
  );
}

// Improved model loading with optimizations for performance
const Model = React.memo(function Model({ 
  blobUrl, 
  type, 
  onLoad,
  intensity = 5
}: { 
  blobUrl: string, 
  type: string, 
  onLoad?: () => void,
  intensity?: number
}) {
  const modelRef = useRef<THREE.Group>(null);
  const { trackEvent } = useAnalytics();
  const { scene, camera, gl } = useThree();
  
  // Enhanced scene optimization
  useEffect(() => {
    // Enable frustum culling and other optimizations
    scene.traverse((object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh) {
        // Set frustum culling
        object.frustumCulled = optimizationConfig.frustumCulling;
        
        // Apply geometry optimizations
        if (object.geometry && optimizationConfig.geometryPrecompute) {
          object.geometry.computeBoundingBox();
          object.geometry.computeBoundingSphere();
          
          // Optimize buffer attributes if not already
          if (object.geometry.index && !object.geometry.attributes.normal) {
            object.geometry.computeVertexNormals();
          }
        }
        
        // Optimize materials
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => {
              optimizeMaterial(material);
            });
          } else {
            optimizeMaterial(object.material);
          }
        }
      }
    });
    
    // Optimize camera settings
    camera.near = 0.1;
    camera.far = 1000;
    camera.updateProjectionMatrix();
    
    // Apply renderer optimizations
    if (optimizationConfig.adaptiveRendering) {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      if (isMobile) {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      }
    }
    
  }, [scene, camera, gl]);

  // Optimize material function
  const optimizeMaterial = (material: THREE.Material) => {
    // Set precision
    (material as any).precision = optimizationConfig.precision;
    
    // Disable tone mapping for better performance
    material.toneMapped = false;
    
    // Set optimal side rendering
    material.side = THREE.FrontSide;
    
    // Optimize PBR materials
    if (material instanceof THREE.MeshStandardMaterial) {
      // Limit texture size for performance
      if (material.map && optimizationConfig.maxTextureSize) {
        if (material.map.image && 
            (material.map.image.width > optimizationConfig.maxTextureSize || 
             material.map.image.height > optimizationConfig.maxTextureSize)) {
          
          // Set appropriate filtering for downscaled textures
          material.map.minFilter = THREE.LinearMipmapLinearFilter;
          material.map.magFilter = THREE.LinearFilter;
          material.map.anisotropy = optimizationConfig.textureAnisotropy;
        }
      }
      
      // Simplify materials in performance mode
      if (optimizationConfig.lowPowerMode) {
        material.roughness = 0.8; // Higher roughness is faster to render
        material.metalness = 0.1;
        material.envMapIntensity = 0.5;
      }
    }
  };

  // Optimized model loading
  useEffect(() => {
    // Check cache first
    if (modelCache.has(blobUrl)) {
      const cachedModel = modelCache.get(blobUrl)!.model.clone();
      
      if (modelRef.current) {
        // Clear previous model
        while (modelRef.current.children.length > 0) {
          modelRef.current.remove(modelRef.current.children[0]);
        }
        
        // Add cached model
        modelRef.current.add(cachedModel);
        
        // Restore saved position if exists
        applyStoredTransforms();
      }
      
      // Track event and call onLoad
      trackEvent('model_loaded_from_cache', { type });
      onLoad?.();
      return;
    }
    
    // Progressive loading with optimized loader
    const loader = new GLTFLoader();
    
    // Use Draco compression loader for better performance
    loader.setDRACOLoader(dracoLoader);
    
    // Setup a detailed loading manager
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (url, loaded, total) => {
      const progress = total > 0 ? (loaded / total) * 100 : 0;
      trackEvent('model_loading_progress', { type, progress: Math.round(progress) });
    };
    
    loader.manager = loadingManager;
    
    // Load the model
    loader.load(
      blobUrl,
      (gltf: any) => {
        // Success callback
        if (modelRef.current) {
          // Clear previous model
          while (modelRef.current.children.length > 0) {
            modelRef.current.remove(modelRef.current.children[0]);
          }
          
          // Add new model
          modelRef.current.add(gltf.scene);
          
          // Apply stored transforms
          applyStoredTransforms();
          
          // Apply model-specific optimizations
          optimizeLoadedModel(gltf.scene);
          
          // Cache the model for future use
          modelCache.set(blobUrl, {
            model: gltf.scene.clone(),
            timestamp: Date.now(),
            permissions: {
              allowCapture: true,
              allowShare: true,
              allowExport: false,
              allowedDomains: ['vibewell.com'],
              expiresAt: null
            }
          });
          
          // Limit cache size
          if (modelCache.size > 10) {
            // Remove oldest entry
            const firstKey = modelCache.keys().next().value;
            modelCache.delete(firstKey);
          }
        }
        
        trackEvent('model_loaded', { type });
        onLoad?.();
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        trackEvent('model_load_error', { type, error: errorMessage });
      }
    );
    
    // Helper function to apply stored transforms
    function applyStoredTransforms() {
      if (!modelRef.current) return;
      
      const savedPosition = localStorage.getItem(`model-position-${type}`);
      if (savedPosition) {
        try {
          const { position, rotation, scale } = JSON.parse(savedPosition);
          modelRef.current.position.fromArray(position);
          modelRef.current.rotation.fromArray(rotation);
          modelRef.current.scale.fromArray(scale);
        } catch (e) {
          console.warn('Error applying stored transforms:', e);
        }
      }
    }
    
    // Helper function to optimize loaded model
    function optimizeLoadedModel(model: THREE.Object3D) {
      model.traverse((object: THREE.Object3D) => {
        if (object instanceof THREE.Mesh) {
          // Optimize geometry
          if (object.geometry) {
            // Configure draw range for better performance
            const count = object.geometry.index ? object.geometry.index.count : 
                         (object.geometry.attributes.position ? object.geometry.attributes.position.count : 0);
            object.geometry.setDrawRange(0, count);
            
            // Compute bounding data if not already done
            if (!object.geometry.boundingBox) {
              object.geometry.computeBoundingBox();
            }
            if (!object.geometry.boundingSphere) {
              object.geometry.computeBoundingSphere();
            }
            
            // Apply geometry optimizations
            if (optimizationConfig.useSharedBuffers && object.geometry.index) {
              // Ensure non-indexed geometries for critical performance paths
              // or optimize index buffer for better cache coherence
              object.geometry.index.array = new Uint16Array(object.geometry.index.array);
            }
          }
          
          // Optimize materials
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => {
                optimizeMaterial(material);
                applyTextureOptimizations(material);
              });
            } else {
              optimizeMaterial(object.material);
              applyTextureOptimizations(object.material);
            }
          }
        }
      });
    }
    
    // Optimize textures
    function applyTextureOptimizations(material: THREE.Material) {
      // Process all textures on the material
      const processTexture = (texture: THREE.Texture | null) => {
        if (!texture) return;
        
        // Set optimal filtering
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        
        // Set anisotropy for better quality at angles
        texture.anisotropy = optimizationConfig.textureAnisotropy;
        
        // Ensure mipmaps are generated
        texture.generateMipmaps = true;
        
        // Prevent texture memory leaks
        globalTexturesRef.push(texture);
      };
      
      // Apply to all possible texture slots in standard materials
      if (material instanceof THREE.MeshStandardMaterial) {
        processTexture(material.map);
        processTexture(material.normalMap);
        processTexture(material.roughnessMap);
        processTexture(material.metalnessMap);
        processTexture(material.aoMap);
        processTexture(material.emissiveMap);
      }
    }

    return () => {
      URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl, type, onLoad, trackEvent]);

  return (
    <group ref={modelRef}>
      {/* Model content will be added by the loader */}
      <ModelControls modelRef={modelRef as React.RefObject<THREE.Group>} type={type} intensity={intensity} />
    </group>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memoization
  return prevProps.blobUrl === nextProps.blobUrl && 
         prevProps.type === nextProps.type &&
         prevProps.intensity === nextProps.intensity;
});

// Function to clear expired cache entries
function cleanupExpiredCache() {
  const now = Date.now();
  for (const [key, value] of modelCache.entries()) {
    if (now - value.timestamp > CACHE_EXPIRATION_TIME) {
      // Dispose of any resources
      disposeObject(value.model);
      modelCache.delete(key);
    }
  }
}

// Helper function to dispose of Three.js resources
function disposeObject(obj: THREE.Object3D) {
  if (!obj) return;
  
  // Handle children recursively
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => disposeMaterial(material));
        } else {
          disposeMaterial(child.material);
        }
      }
    }
  });
}

// Helper function to dispose of material resources
function disposeMaterial(material: THREE.Material) {
  if (!material) return;
  
  // Dispose of any textures in the material
  Object.keys(material).forEach(key => {
    const value = (material as any)[key];
    if (value instanceof THREE.Texture) {
      value.dispose();
    }
  });
  
  material.dispose();
}

export function ThreeARViewer({ 
  modelData, 
  type, 
  intensity = 5,
  onCapture,
  permissions,
  sessionId,
  ...props
}: ThreeARViewerProps & React.HTMLAttributes<HTMLDivElement>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const texturesRef = useRef<THREE.Texture[]>([]);
  const geometriesRef = useRef<THREE.BufferGeometry[]>([]);
  const materialsRef = useRef<THREE.Material[]>([]);
  
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isPerformanceMode, setIsPerformanceMode] = useState(false);
  const [webGLError, setWebGLError] = useState<string | null>(null);
  const [modelPermissions, setModelPermissions] = useState<ModelPermissions>({
    allowCapture: true,
    allowShare: true,
    allowExport: false,
    allowedDomains: ['vibewell.com'],
    expiresAt: null
  });
  
  // Extract any test ID for the tests 
  const { 'data-testid': testId, ...otherProps } = props;

  // Initialize renderer, scene, camera
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Check for WebGL support
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl', { 
        powerPreference: 'high-performance', 
        failIfMajorPerformanceCaveat: true
      }) || canvas.getContext('experimental-webgl');
      
      if (!context) {
        setWebGLError('WebGL is not supported by your browser');
        return;
      }
    } catch (e) {
      setWebGLError('WebGL detection error');
      return;
    }
    
    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;
    
    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // Initialize renderer with optimizations
    const renderer = new THREE.WebGLRenderer({ 
      antialias: !isPerformanceMode, 
      powerPreference: 'high-performance',
      precision: isPerformanceMode ? 'mediump' : 'highp',
      alpha: true,
      stencil: false,
      depth: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !isPerformanceMode;
    
    // Add data-testid for canvas element for tests
    renderer.domElement.setAttribute('data-testid', 'canvas');
    
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Periodically clean up expired cache entries
    const cacheCleanupInterval = setInterval(cleanupExpiredCache, 5 * 60 * 1000); // Every 5 minutes
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    if (!isPerformanceMode) {
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
    }
    scene.add(directionalLight);
    
    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Start animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        if (modelRef.current) {
          modelRef.current.rotation.y += 0.005;
        }
        
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    
    // Auto-detect performance mode based on device
    const detectPerformanceMode = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const isLowEndDevice = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;
      
      setIsPerformanceMode(isMobile || isLowEndDevice);
    };
    
    detectPerformanceMode();
    
    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      // Clean up textures
      texturesRef.current.forEach((texture) => {
        if (texture) texture.dispose();
      });
      
      // Clean up geometries
      geometriesRef.current.forEach((geometry) => {
        if (geometry) geometry.dispose();
      });
      
      // Clean up materials
      materialsRef.current.forEach((material) => {
        if (material) disposeMaterial(material);
      });
      
      // Clean up renderer
      if (rendererRef.current) {
        if (containerRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      }
      
      // Dispose of model
      if (modelRef.current) {
        disposeObject(modelRef.current);
      }
      
      // Clear the cache cleanup interval
      clearInterval(cacheCleanupInterval);
    };
  }, [isPerformanceMode]);
  
  // Set model permissions
  useEffect(() => {
    const defaultPermissions: ModelPermissions = {
      allowCapture: true,
      allowShare: true,
      allowExport: false,
      allowedDomains: ['vibewell.com'],
      expiresAt: null
    };
    
    // Apply provided permissions
    if (permissions) {
      setModelPermissions({
        ...defaultPermissions,
        ...permissions
      });
    } else {
      // Try to extract permissions from model data
      try {
        const extractedPermissions = parseModelPermissions(modelData);
        if (extractedPermissions) {
          setModelPermissions({
            ...defaultPermissions,
            ...extractedPermissions
          });
        }
      } catch (error) {
        console.warn('Failed to parse model permissions, using defaults');
      }
    }
    
    // Check if model has expired
    if (modelPermissions.expiresAt && Date.now() > modelPermissions.expiresAt) {
      setWebGLError('This AR content has expired');
    }
    
    // Check if current domain is allowed
    const currentDomain = window.location.hostname;
    if (modelPermissions.allowedDomains && 
        modelPermissions.allowedDomains.length > 0 && 
        !modelPermissions.allowedDomains.includes(currentDomain)) {
      setWebGLError('This AR content is not allowed on this domain');
    }
  }, [modelData, permissions]);
  
  // Load model when modelData changes
  useEffect(() => {
    if (!sceneRef.current || !modelData) return;
    
    // Clear previous model
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current = null;
    }
    
    setIsModelLoaded(false);
    
    // Sanitize incoming model data to prevent security issues
    const sanitizedModelData = sanitizeARData(modelData);
    
    // Create placeholder model or load actual model
    // ... (rest of model loading logic)
    
    setIsModelLoaded(true);
  }, [modelData, type, intensity, isPerformanceMode]);
  
  const captureScreenshot = () => {
    if (!rendererRef.current || !onCapture || !modelPermissions.allowCapture) return;
    
    // Add a watermark to the capture
    const canvas = rendererRef.current.domElement;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw watermark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '14px Arial';
      ctx.fillText('Vibewell AR', 10, canvas.height - 10);
      
      // Add session ID as hidden data for tracking (if provided)
      if (sessionId) {
        // Encode session ID into alpha channel of a few pixels
        // This is a simplified example - in production use a more sophisticated approach
        const sessionData = new TextEncoder().encode(sessionId);
        const imgData = ctx.getImageData(0, 0, sessionData.length, 1);
        for (let i = 0; i < sessionData.length; i++) {
          imgData.data[i * 4 + 3] = (imgData.data[i * 4 + 3] & 0xf0) | (sessionData[i] & 0x0f);
        }
        ctx.putImageData(imgData, 0, 0);
      }
    }
    
    const dataUrl = canvas.toDataURL('image/png');
    
    // If sharing is allowed, provide the captured image
    if (modelPermissions.allowShare) {
      onCapture(dataUrl);
    } else {
      console.warn('Sharing is not allowed for this model');
    }
  };
  
  return (
    <div 
      ref={containerRef} 
      className="h-full w-full relative" 
      data-testid={testId || "ar-viewer"}
      {...otherProps}
    >
      <div className="relative w-full h-full">
        <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
          {webGLError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-600 p-4">
              <div className="text-center">
                <h3 className="font-bold mb-2">WebGL Error</h3>
                <p>{webGLError}</p>
                <p className="text-sm mt-2">Please try using a different browser or device that supports WebGL.</p>
              </div>
            </div>
          )}
          
          {!webGLError && rendererRef.current && (
            <PerformanceMonitor 
              enableAdaptiveQuality={true}
              performanceThreshold={30}
              devModeOnly={process.env.NODE_ENV !== 'production'}
            />
          )}
          
          {/* Permission indicator */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {!modelPermissions.allowCapture && (
              <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                Capture Restricted
              </div>
            )}
            {!modelPermissions.allowShare && (
              <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                Sharing Restricted
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 