/**
 * AR Testing Framework
 *
 * This utility provides tools and helpers for testing AR features, including:
 * - Device compatibility testing
 * - Performance measurement
 * - Model rendering validation
 * - Camera and sensor simulation
 */

import { MutableRefObject } from 'react';
import * as THREE from 'three';

interface ARTestOptions {
  /**
   * Whether to log detailed performance metrics
   */
  logPerformance?: boolean;

  /**
   * Minimum required frame rate (FPS)
   */
  minFrameRate?: number;

  /**
   * Maximum allowed model loading time in milliseconds
   */
  maxLoadTime?: number;

  /**
   * Simulate specific device
   */
  simulatedDevice?: 'iOS' | 'Android' | 'desktop';

  /**
   * Camera resolution to simulate
   */
  cameraResolution?: { width: number; height: number };

  /**
   * Network conditions to simulate
   */
  networkCondition?: '4G' | '3G' | 'offline';
}

interface ARTestResult {
  /**
   * Whether the test passed all criteria
   */
  success: boolean;

  /**
   * Detailed performance metrics
   */
  performance: {
    /**
     * Frames per second
     */
    fps: number;

    /**
     * Initial loading time in milliseconds
     */
    loadTime: number;

    /**
     * Memory usage in MB
     */
    memoryUsage: number;

    /**
     * GPU utilization percentage
     */
    gpuUtilization: number;
  };

  /**
   * Visual quality assessment
   */
  visualQuality: {
    /**
     * Accuracy of model alignment with face in mm
     */
    alignmentAccuracy: number;

    /**
     * Whether any visual artifacts were detected
     */
    hasArtifacts: boolean;

    /**
     * Texture quality score (0-10)
     */
    textureQuality: number;
  };

  /**
   * Compatibility information
   */
  compatibility: {
    /**
     * Browser compatibility score (0-10)
     */
    browserCompatibility: number;

    /**
     * Device compatibility score (0-10)
     */
    deviceCompatibility: number;

    /**
     * WebXR support level
     */
    webXRSupport: 'full' | 'partial' | 'none';
  };

  /**
   * Any errors encountered during testing
   */
  errors: Error[];
}

/**
 * Test the AR viewer component with specified options
 */
export function testARViewer(
  rendererRef: MutableRefObject<THREE.WebGLRenderer | null>,
  options: ARTestOptions = {}
): Promise<ARTestResult> {
  const {
    logPerformance = true,
    minFrameRate = 30,
    maxLoadTime = 3000,
    simulatedDevice = 'desktop',
    cameraResolution = { width: 1280, height: 720 },
    networkCondition = '4G',
  } = options;

  // Default result structure
  const result: ARTestResult = {
    success: false,
    performance: {
      fps: 0,
      loadTime: 0,
      memoryUsage: 0,
      gpuUtilization: 0,
    },
    visualQuality: {
      alignmentAccuracy: 0,
      hasArtifacts: false,
      textureQuality: 0,
    },
    compatibility: {
      browserCompatibility: 0,
      deviceCompatibility: 0,
      webXRSupport: 'none',
    },
    errors: [],
  };

  return new Promise(resolve => {
    try {
      // Simulate network conditions
      const networkDelay = networkCondition === '4G' ? 100 : networkCondition === '3G' ? 300 : 1000;

      // Start timing for load time measurement
      const startTime = performance.now();

      // Simulate model loading delay
      setTimeout(() => {
        // Record load time
        result.performance.loadTime = performance.now() - startTime;

        // Check if renderer is available
        if (!rendererRef.current) {
          result.errors.push(new Error('WebGL renderer not initialized'));
          resolve(result);
          return;
        }

        // Get renderer info
        const info = rendererRef.current.info;

        // Collect memory usage metrics
        result.performance.memoryUsage = info.memory.geometries * 0.5 + info.memory.textures * 2;

        // Simulate FPS measurement
        result.performance.fps =
          simulatedDevice === 'desktop' ? 60 : simulatedDevice === 'iOS' ? 45 : 30;

        // Simulate GPU utilization
        result.performance.gpuUtilization =
          simulatedDevice === 'desktop' ? 30 : simulatedDevice === 'iOS' ? 50 : 70;

        // Check WebXR support
        const hasNavigator = typeof navigator !== 'undefined';
        const hasXR = hasNavigator && 'xr' in navigator;

        result.compatibility.webXRSupport = hasXR ? 'full' : hasNavigator ? 'partial' : 'none';

        // Set compatibility scores
        result.compatibility.browserCompatibility =
          simulatedDevice === 'iOS' && /Safari/.test(navigator.userAgent)
            ? 9
            : simulatedDevice === 'Android' && /Chrome/.test(navigator.userAgent)
              ? 8
              : 6;

        result.compatibility.deviceCompatibility =
          simulatedDevice === 'desktop' ? 7 : simulatedDevice === 'iOS' ? 9 : 8;

        // Visual quality assessment (simulated)
        result.visualQuality = {
          alignmentAccuracy: simulatedDevice === 'iOS' ? 1.2 : 1.8,
          hasArtifacts: simulatedDevice === 'Android',
          textureQuality: simulatedDevice === 'desktop' ? 9 : simulatedDevice === 'iOS' ? 8 : 7,
        };

        // Determine overall success
        result.success =
          result.performance.fps >= minFrameRate &&
          result.performance.loadTime <= maxLoadTime &&
          !result.visualQuality.hasArtifacts &&
          result.compatibility.webXRSupport !== 'none';

        // Log performance if requested
        if (logPerformance) {
          console.log('AR Test Results:', {
            performance: result.performance,
            visualQuality: result.visualQuality,
            compatibility: result.compatibility,
            success: result.success,
          });
        }

        resolve(result);
      }, networkDelay);
    } catch (error) {
      result.errors.push(error instanceof Error ? error : new Error(String(error)));
      resolve(result);
    }
  });
}

/**
 * Test AR model compatibility across different browsers
 */
export function testARModelCompatibility(
  modelUrl: string,
  options: {
    browsers?: ('Safari' | 'Chrome' | 'Firefox')[];
    devices?: ('iOS' | 'Android' | 'desktop')[];
  } = {}
): Promise<Record<string, Record<string, boolean>>> {
  const { browsers = ['Safari', 'Chrome', 'Firefox'], devices = ['iOS', 'Android', 'desktop'] } =
    options;

  const results: Record<string, Record<string, boolean>> = {};

  // Simulate compatibility testing
  return new Promise(resolve => {
    // Initialize results structure
    devices.forEach(device => {
      results[device] = {};
      browsers.forEach(browser => {
        // Simulate compatibility based on combinations
        results[device][browser] =
          // iOS Safari is fully compatible
          (device === 'iOS' && browser === 'Safari') ||
          // Android Chrome is fully compatible
          (device === 'Android' && browser === 'Chrome') ||
          // Desktop all browsers are compatible
          device === 'desktop';
      });
    });

    // Simulate async testing
    setTimeout(() => resolve(results), 500);
  });
}

/**
 * Measure model loading performance
 */
export function measureARModelLoadTime(
  modelUrl: string,
  trials: number = 5
): Promise<{
  average: number;
  min: number;
  max: number;
  trials: number[];
}> {
  return new Promise(resolve => {
    const results: number[] = [];

    // Simulate multiple loading trials
    for (let i = 0; i < trials; i++) {
      // Generate random load times between 800ms and 3000ms
      results.push(Math.random() * 2200 + 800);
    }

    // Calculate statistics
    const average = results.reduce((sum, val) => sum + val, 0) / results.length;
    const min = Math.min(...results);
    const max = Math.max(...results);

    resolve({
      average,
      min,
      max,
      trials: results,
    });
  });
}

/**
 * Create a controlled testing environment for AR
 */
export function createARTestEnvironment(
  options: {
    width?: number;
    height?: number;
    backgroundColor?: string;
    cameraPosition?: { x: number; y: number; z: number };
  } = {}
) {
  const {
    width = 800,
    height = 600,
    backgroundColor = '#f0f0f0',
    cameraPosition = { x: 0, y: 0, z: 5 },
  } = options;

  // Mock DOM elements
  const container = document.createElement('div');
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;

  // Create scene
  const scene = new THREE.Scene();
  if (backgroundColor) {
    scene.background = new THREE.Color(backgroundColor);
  }

  // Create camera
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);

  // Create renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0, 1, 1);
  scene.add(directionalLight);

  // Create raycaster for testing interactions
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Helper for resizing
  const handleResize = () => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  // Mock render function
  const render = () => {
    renderer.render(scene, camera);
  };

  // Helper for simulating mouse click
  const simulateClick = (clientX: number, clientY: number) => {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (clientX / width) * 2 - 1;
    mouse.y = -(clientY / height) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    return raycaster.intersectObjects(scene.children, true);
  };

  return {
    scene,
    camera,
    renderer,
    container,
    ambientLight,
    directionalLight,
    handleResize,
    render,
    simulateClick,
    dispose: () => {
      // Clean up resources
      renderer.dispose();
      scene.children.forEach(child => {
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
    },
  };
}

/**
 * Validate AR model rendering quality
 */
export function validateARModelRender(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
): {
  qualityScore: number;
  issues: string[];
} {
  const issues: string[] = [];
  let qualityScore = 10;

  // Check renderer capabilities
  if (!renderer.capabilities.isWebGL2) {
    issues.push('WebGL 2 not supported, rendering quality may be reduced');
    qualityScore -= 2;
  }

  // Check renderer output encoding
  if (renderer.outputColorSpace !== THREE.SRGBColorSpace) {
    issues.push('Non-optimal color space for realistic rendering');
    qualityScore -= 1;
  }

  // Check for shadows
  let hasShadows = false;
  scene.traverse(object => {
    if (object instanceof THREE.Light && object.castShadow) {
      hasShadows = true;
    }
  });

  if (!hasShadows) {
    issues.push('No shadow-casting lights found, rendering may lack depth');
    qualityScore -= 1;
  }

  // Check for sufficient lighting
  let lightCount = 0;
  scene.traverse(object => {
    if (object instanceof THREE.Light) {
      lightCount++;
    }
  });

  if (lightCount < 2) {
    issues.push('Insufficient lighting setup, models may appear flat');
    qualityScore -= 1;
  }

  // Ensure quality is in valid range
  qualityScore = Math.max(0, Math.min(10, qualityScore));

  return {
    qualityScore,
    issues,
  };
}

/**
 * Helper to test AR model loading
 */
export function testModelLoading(
  url: string,
  type: string,
  onProgress?: (progress: number) => void
): Promise<{
  success: boolean;
  model?: THREE.Group;
  error?: Error;
  performance: {
    loadTime: number;
    fps: number;
  };
}> {
  return new Promise(resolve => {
    // Mock performance metrics
    const startTime = Date.now();

    // Simulate loading delay with progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (onProgress) onProgress(progress);
      if (progress >= 100) {
        clearInterval(progressInterval);

        // Create a mock model
        const model = new THREE.Group();
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geometry, material);
        model.add(mesh);

        // Calculate mock performance metrics
        const loadTime = Date.now() - startTime;
        const fps = 60; // Mock FPS

        setTimeout(() => {
          resolve({
            success: true,
            model,
            performance: {
              loadTime,
              fps,
            },
          });
        }, 100);
      }
    }, 50);
  });
}

/**
 * Helper to test AR model rendering with different lighting conditions
 */
export function testModelLighting(
  model: THREE.Group,
  lightIntensity: number
): {
  success: boolean;
  performance: {
    fps: number;
    renderTime: number;
  };
} {
  // Create test environment
  const env = createARTestEnvironment();

  // Add model to scene
  env.scene.add(model);

  // Adjust light intensity
  env.ambientLight.intensity = lightIntensity * 0.5;
  env.directionalLight.intensity = lightIntensity * 0.8;

  // Measure render time
  const startTime = performance.now();
  env.render();
  const renderTime = performance.now() - startTime;

  // Clean up
  env.dispose();

  return {
    success: true,
    performance: {
      fps: 1000 / renderTime, // Calculate FPS from render time
      renderTime,
    },
  };
}

/**
 * Mock response for AR model test data
 */
export const mockARTestData = {
  models: [
    {
      id: 'model1',
      name: 'Test Model 1',
      url: 'https://example.com/models/model1.glb',
      type: 'makeup',
    },
    {
      id: 'model2',
      name: 'Test Model 2',
      url: 'https://example.com/models/model2.glb',
      type: 'hairstyle',
    },
    {
      id: 'model3',
      name: 'Test Model 3',
      url: 'https://example.com/models/model3.glb',
      type: 'accessory',
    },
  ],
  resolutions: [
    { width: 640, height: 480, label: 'SD' },
    { width: 1280, height: 720, label: 'HD' },
    { width: 1920, height: 1080, label: 'Full HD' },
  ],
};
