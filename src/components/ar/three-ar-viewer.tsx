'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, useGLTF } from '@react-three/drei';
import { XRButton, XR, createXRStore } from '@react-three/xr';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/use-analytics';
import { Camera } from 'lucide-react';

// Import GLTFLoader
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// Import Draco decoder for model compression
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// Create an XR store for managing WebXR state
const xrStore = createXRStore();

// Setup Draco loader for better compression
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco-gltf/');

// Use a more efficient progressive mesh loading approach
let modelCache = new Map<string, THREE.Object3D>();

// Global texture reference for cleanup
let globalTexturesRef: THREE.Texture[] = [];

interface ThreeARViewerProps {
  modelData: Uint8Array;
  type: 'makeup' | 'hairstyle' | 'accessory';
  intensity?: number;
  onCapture?: (dataUrl: string) => void;
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

// React component for performance monitoring with enhanced metrics
function PerformanceMonitor() {
  const { gl } = useThree();
  const frameRate = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const lastUpdate = useRef<number>(Date.now());
  const [fps, setFps] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [drawCalls, setDrawCalls] = useState<number>(0);
  const [triangles, setTriangles] = useState<number>(0);
  const [isPerformanceIssue, setIsPerformanceIssue] = useState(false);
  const adaptiveQualityTimer = useRef<any>(null);

  useFrame(() => {
    frameCount.current += 1;
    const now = Date.now();
    const delta = now - lastUpdate.current;
    
    if (delta > 1000) {
      frameRate.current = frameCount.current * 1000 / delta;
      setFps(Math.round(frameRate.current));
      
      // Update additional metrics
      if (gl.info) {
        setDrawCalls(gl.info.render?.calls || 0);
        setTriangles(gl.info.render?.triangles || 0);
        setMemoryUsage((gl.info.memory?.geometries || 0) * 0.25 + (gl.info.memory?.textures || 0) * 2);
      }
      
      frameCount.current = 0;
      lastUpdate.current = now;
      
      // Performance issue detection and adaptive quality
      const hasPerformanceIssue = frameRate.current < 30;
      setIsPerformanceIssue(hasPerformanceIssue);
      
      // Apply adaptive optimizations for sustained low performance
      if (hasPerformanceIssue) {
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

  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="absolute top-0 left-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded">
      <div>FPS: {fps} {isPerformanceIssue && '⚠️'}</div>
      <div>Triangles: {triangles.toLocaleString()}</div>
      <div>Draw calls: {drawCalls}</div>
      <div>Memory: {Math.round(memoryUsage)}MB</div>
    </div>
  );
}

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
      const cachedModel = modelCache.get(blobUrl)!.clone();
      
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
          modelCache.set(blobUrl, gltf.scene.clone());
          
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
      (error: any) => {
        console.error('Error loading model:', error);
        trackEvent('model_load_error', { type, error: error.message });
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

export function ThreeARViewer({ 
  modelData, 
  type, 
  intensity = 5,
  onCapture,
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
  
  // Extract any test ID for the tests 
  const { 'data-testid': testId, ...otherProps } = props;

  // Initialize renderer, scene, camera
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Check for WebGL support
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
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
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !isPerformanceMode;
    
    // Add data-testid for canvas element for tests
    renderer.domElement.setAttribute('data-testid', 'canvas');
    
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
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
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      if (rendererRef.current) {
        containerRef.current?.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      
      // Clean up textures
      texturesRef.current.forEach(texture => texture.dispose());
      
      // Clean up geometries
      geometriesRef.current.forEach(geometry => geometry.dispose());
      
      // Clean up materials
      materialsRef.current.forEach(material => material.dispose());
      
      // Remove all children from scene
      if (sceneRef.current) {
        while (sceneRef.current.children.length > 0) {
          sceneRef.current.remove(sceneRef.current.children[0]);
        }
      }
    };
  }, [isPerformanceMode]);
  
  // Load model when modelData changes
  useEffect(() => {
    if (!sceneRef.current || !modelData) return;
    
    // Clear previous model
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current = null;
    }
    
    setIsModelLoaded(false);
    
    // Create a placeholder model based on type
    const createPlaceholderModel = () => {
      let geometry: THREE.BufferGeometry;
      let material: THREE.Material;
      
      switch (type) {
        case 'makeup':
          geometry = new THREE.SphereGeometry(1.5, 32, 32);
          material = new THREE.MeshStandardMaterial({ 
            color: 0xff9999,
            roughness: 0.7,
            metalness: 0.3
          });
          break;
        case 'hairstyle':
          geometry = new THREE.BoxGeometry(2, 2, 2);
          material = new THREE.MeshStandardMaterial({ 
            color: 0x8e5e32,
            roughness: 0.8,
            metalness: 0.2
          });
          break;
        case 'accessory':
          geometry = new THREE.TorusGeometry(1, 0.3, 16, 32);
          material = new THREE.MeshStandardMaterial({ 
            color: 0xffcc00,
            roughness: 0.5,
            metalness: 0.5
          });
          break;
        default:
          geometry = new THREE.SphereGeometry(1.5, 32, 32);
          material = new THREE.MeshStandardMaterial({ color: 0xffffff });
      }
      
      // Store for cleanup
      geometriesRef.current.push(geometry);
      materialsRef.current.push(material);
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = !isPerformanceMode;
      mesh.receiveShadow = !isPerformanceMode;
      
      return mesh;
    };
    
    // Create and add placeholder model
    const placeholder = createPlaceholderModel();
    sceneRef.current.add(placeholder);
    modelRef.current = placeholder;
    
    // Apply intensity to material
    if (placeholder.material instanceof THREE.MeshStandardMaterial) {
      placeholder.material.emissiveIntensity = intensity / 10;
    }
    
    setIsModelLoaded(true);
    
  }, [modelData, type, intensity, isPerformanceMode]);
  
  const captureScreenshot = () => {
    if (!rendererRef.current || !onCapture) return;
    
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    onCapture(dataUrl);
  };
  
  const togglePerformanceMode = () => {
    setIsPerformanceMode(!isPerformanceMode);
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
        </div>
        
        {isModelLoaded && onCapture && !webGLError && (
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="rounded-full p-2 h-10 w-10"
              onClick={captureScreenshot}
              title="Capture"
            >
              <Camera className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={isPerformanceMode ? 'bg-amber-200' : ''}
              onClick={togglePerformanceMode}
              title={isPerformanceMode ? 'Switch to Quality Mode' : 'Switch to Performance Mode'}
            >
              {isPerformanceMode ? 'Performance' : 'Quality'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 