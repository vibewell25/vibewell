import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { ModelControls } from './ModelControls';

// Setup Draco loader for better compression
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco-gltf/');

// Use a cache for loaded models
let modelCache = new Map<string, THREE.Object3D>();

// Reference for textures to ensure proper cleanup
let globalTexturesRef: THREE.Texture[] = [];

// Enhanced settings for WebGL optimization
const optimizationConfig = {
  frustumCulling: true,
  instancing: true,
  maxTextureSize: 1024,
  useSharedBuffers: true,
  geometryPrecompute: true,
  textureAnisotropy: 4,
  adaptiveRendering: true,
};

/**
 * Model component for rendering 3D models in ThreeARViewer
 *
 * This component handles the loading, caching, and optimization of 3D models
 * using Three.js and GLTFLoader. It also applies transformations based on model type.
 *
 * @param props - Component props
 * @param props.blobUrl - URL to the model blob data
 * @param props.type - Type of model ('makeup', 'hairstyle', 'accessory')
 * @param props.onLoad - Callback when model is loaded
 * @param props.intensity - Intensity value (1-10) affecting model appearance
 * @returns React component
 */
export const Model = React.memo(
  function Model({
    blobUrl,
    type,
    onLoad,
    intensity = 5,
  }: {
    blobUrl: string;
    type: string;
    onLoad?: () => void;
    intensity?: number;
  }) {
    const modelRef = useRef<THREE.Group>(null);
    const { scene, camera, gl } = useThree();

    // Optimize the scene
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
    const optimizeMaterial = useCallback((material: THREE.Material) => {
      // Set optimum side rendering
      material.side = THREE.FrontSide;

      // Disable tone mapping for better performance
      material.toneMapped = false;

      // Optimize PBR materials
      if (material instanceof THREE.MeshStandardMaterial) {
        // Limit texture size for performance
        if (material.map && optimizationConfig.maxTextureSize) {
          if (
            material.map.image &&
            (material.map.image.width > optimizationConfig.maxTextureSize ||
              material.map.image.height > optimizationConfig.maxTextureSize)
          ) {
            // Set appropriate filtering for downscaled textures
            material.map.minFilter = THREE.LinearMipmapLinearFilter;
            material.map.magFilter = THREE.LinearFilter;
            material.map.anisotropy = optimizationConfig.textureAnisotropy;
          }
        }
      }
    }, []);

    // Process textures for optimization
    const applyTextureOptimizations = useCallback((material: THREE.Material) => {
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

        // Track texture for cleanup
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
    }, []);

    // Apply any stored transforms from localStorage
    const applyStoredTransforms = useCallback(() => {
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
    }, [type]);

    // Optimize loaded model
    const optimizeLoadedModel = useCallback(
      (model: THREE.Object3D) => {
        model.traverse((object: THREE.Object3D) => {
          if (object instanceof THREE.Mesh) {
            // Optimize geometry
            if (object.geometry) {
              // Configure draw range for better performance
              const count = object.geometry.index
                ? object.geometry.index.count
                : object.geometry.attributes.position
                  ? object.geometry.attributes.position.count
                  : 0;
              object.geometry.setDrawRange(0, count);

              // Compute bounding data if not already done
              if (!object.geometry.boundingBox) {
                object.geometry.computeBoundingBox();
              }
              if (!object.geometry.boundingSphere) {
                object.geometry.computeBoundingSphere();
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
      },
      [optimizeMaterial, applyTextureOptimizations]
    );

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

        // Call onLoad
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
      };

      loader.manager = loadingManager;

      // Load the model
      loader.load(
        blobUrl,
        gltf => {
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
              if (firstKey) {
                modelCache.delete(firstKey);
              }
            }
          }

          onLoad?.();
        },
        undefined,
        error => {
          console.error('Error loading model:', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
        }
      );

      return () => {
        URL.revokeObjectURL(blobUrl);
      };
    }, [blobUrl, type, onLoad, applyStoredTransforms, optimizeLoadedModel]);

    return (
      <group ref={modelRef}>
        {/* Model content will be added by the loader */}
        <ModelControls modelRef={modelRef} type={type} intensity={intensity} />
      </group>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memoization
    return (
      prevProps.blobUrl === nextProps.blobUrl &&
      prevProps.type === nextProps.type &&
      prevProps.intensity === nextProps.intensity
    );
  }
);
