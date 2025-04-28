# Performance Optimization Guide for VibeWell

This guide outlines performance improvements needed for the VibeWell application, focusing on 3D/AR components, bundle size reduction, and mobile optimization.

## 1. 3D/AR Component Optimization

### Current Issues

Analysis of the current AR components (`ARModelViewer.tsx`, `ARResourceMonitor.tsx`, etc.) reveals several performance issues:

1. Inefficient model loading without level-of-detail (LOD)
2. High-resolution textures always used regardless of device capabilities
3. Lack of asset preloading
4. Excessive draw calls and render passes
5. Insufficient use of the existing performance monitoring resources

### Optimization Solutions

#### 1.1 Model Optimization

**Create an optimized model loader:**

```tsx
// src/components/ar/OptimizedModelLoader.tsx
import { useGLTF, useTexture } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

export function OptimizedModelLoader({ 
  modelPath, 
  onLoaded, 
  quality = 'high', // 'low', 'medium', 'high'
  textureOverrides = {}
}) {
  // Determine quality-based paths
  const actualPath = useMemo(() => {
    // Use different model LODs based on quality setting
    if (quality === 'low') return modelPath.replace('.glb', '-low.glb');
    if (quality === 'medium') return modelPath.replace('.glb', '-medium.glb');
    return modelPath;
  }, [modelPath, quality]);
  
  // Preload the model
  const { scene, materials } = useGLTF(actualPath);
  
  // Apply texture optimizations
  useEffect(() => {
    if (!scene) return;
    
    // Apply material optimizations
    scene.traverse((object) => {
      if (object.isMesh) {
        // Apply texture overrides if provided
        if (object.material && textureOverrides) {
          Object.entries(textureOverrides).forEach(([key, value]) => {
            if (object.material[key]) object.material[key] = value;
          });
        }
        
        // Set appropriate texture quality
        if (object.material) {
          if (quality === 'low') {
            object.material.roughness = 1.0; // Simplify lighting calculations
            if (object.material.map) object.material.map.minFilter = THREE.LinearFilter;
            object.material.normalMap = null; // Disable normal maps on low quality
          }
          
          // Optimize material for performance
          object.material.precision = quality === 'high' ? 'highp' : 'mediump';
          object.material.dithering = quality === 'high';
        }
        
        // Simplify geometry on low-end devices
        if (quality === 'low' && object.geometry) {
          if (typeof object.geometry.simplifyMesh === 'function') {
            object.geometry.simplifyMesh(0.5); // Reduce vertex count by 50%
          }
        }
      }
    });
    
    // Notify when optimizations are applied
    onLoaded?.();
  }, [scene, quality, textureOverrides, onLoaded]);
  
  return scene ? <primitive object={scene} /> : null;
}
```

#### 1.2 Enhance ARResourceMonitor Usage

The `ARResourceMonitor` component already has powerful capabilities but isn't being fully utilized. Update AR components to properly use the monitor:

```tsx
// In AR viewer components
<Canvas>
  {/* Add ARResourceMonitor with appropriate settings */}
  <ARResourceMonitor 
    enableAdaptiveQuality={true}
    performanceThreshold={isMobile ? 24 : 30}
    devModeOnly={false} // Enable in production
    optimizations={{
      reduceTextureQuality: true,
      disableShadows: true,
      reduceDrawDistance: true,
      enableFrustumCulling: true,
      reduceLightCount: isMobile // Only reduce lights on mobile
    }}
    onPerformanceWarning={handlePerformanceWarning}
  />
  
  {/* Rest of the scene */}
</Canvas>
```

#### 1.3 Implement Progressive Loading

Create a progressive loading system to improve perceived performance:

```tsx
// src/components/ar/ProgressiveARViewer.tsx
export function ProgressiveARViewer({ modelId }) {
  const [qualityLevel, setQualityLevel] = useState('low');
  const [isFirstLoadComplete, setIsFirstLoadComplete] = useState(false);
  
  // Handle initial load with low quality
  const handleInitialLoad = () => {
    setIsFirstLoadComplete(true);
    
    // Schedule upgrade to better quality after initial render
    requestIdleCallback(() => {
      setQualityLevel('medium');
    });
  };
  
  // Handle medium quality load
  const handleMediumQualityLoad = () => {
    // Only upgrade to high quality on powerful devices when idle
    if (isHighEndDevice()) {
      requestIdleCallback(() => {
        setQualityLevel('high');
      }, { timeout: 5000 });
    }
  };
  
  return (
    <Canvas>
      <ARResourceMonitor enableAdaptiveQuality={true} />
      
      {/* Show placeholder during initial load */}
      {!isFirstLoadComplete && (
        <PlaceholderModel modelId={modelId} />
      )}
      
      {/* Low quality model (initially visible) */}
      {qualityLevel === 'low' && (
        <OptimizedModelLoader 
          modelPath={MODEL_PATHS[modelId]}
          quality="low"
          onLoaded={handleInitialLoad}
        />
      )}
      
      {/* Medium quality upgrade */}
      {qualityLevel === 'medium' && (
        <OptimizedModelLoader 
          modelPath={MODEL_PATHS[modelId]}
          quality="medium"
          onLoaded={handleMediumQualityLoad}
        />
      )}
      
      {/* High quality upgrade */}
      {qualityLevel === 'high' && (
        <OptimizedModelLoader 
          modelPath={MODEL_PATHS[modelId]}
          quality="high"
        />
      )}
    </Canvas>
  );
}
```

#### 1.4 Texture Atlas Implementation

Create texture atlases to reduce draw calls:

```tsx
// src/utils/texture-atlas.ts
import * as THREE from 'three';

export function createTextureAtlas(textures: Record<string, string>, size = 1024) {
  // Implementation to combine multiple textures into a single atlas
  // This reduces texture switches and draw calls
}
```

#### 1.5 Model Compression Pipeline

Add a build-time pipeline to optimize and compress 3D models:

```bash
# Example scripts/optimize-models.js
const gltfPipeline = require('gltf-pipeline');
const fs = require('fs');
const path = require('path');

// Process each model
const processGLTF = async (inputPath, outputPath, options) => {
  const gltf = fs.readFileSync(inputPath);
  const result = await gltfPipeline.processGltf(gltf, options);
  fs.writeFileSync(outputPath, result.gltf);
};

// Create LOD variants
const generateLODs = async (inputPath) => {
  // Generate low quality version
  await processGLTF(inputPath, inputPath.replace('.glb', '-low.glb'), {
    compressTextures: true,
    textureCompressionOptions: { format: 'webp', quality: 60 },
    draco: { compressionLevel: 7 },
    meshOptimizer: { simplify: true, simplificationRatio: 0.5 }
  });
  
  // Generate medium quality version
  await processGLTF(inputPath, inputPath.replace('.glb', '-medium.glb'), {
    compressTextures: true,
    textureCompressionOptions: { format: 'webp', quality: 80 },
    draco: { compressionLevel: 5 },
    meshOptimizer: { simplify: true, simplificationRatio: 0.8 }
  });
  
  // Optimize high quality version
  await processGLTF(inputPath, inputPath, {
    compressTextures: true,
    textureCompressionOptions: { format: 'webp', quality: 90 },
    draco: { compressionLevel: 3 }
  });
};

// Process all models
const modelDir = path.join(__dirname, '../public/models');
fs.readdirSync(modelDir).forEach(file => {
  if (file.endsWith('.glb') && !file.includes('-low') && !file.includes('-medium')) {
    generateLODs(path.join(modelDir, file));
  }
});
```

## 2. Bundle Size and Loading Performance

### Current Issues

1. Large JavaScript bundles affecting initial load time
2. Unoptimized critical rendering path
3. Render-blocking resources
4. Inefficient code splitting

### Optimization Solutions

#### 2.1 Implement Route-Based Code Splitting

```tsx
// src/app/page.tsx
import dynamic from 'next/dynamic';

// Dynamically import AR components only when needed
const ARViewComponent = dynamic(
  () => import('@/components/ARViewComponent'),
  { 
    loading: () => <p>Loading AR experience...</p>,
    ssr: false // Disable server-side rendering for AR components
  }
);
```

#### 2.2 Tree-Shake Three.js

Create a custom Three.js import map to reduce bundle size:

```tsx
// src/utils/three-minimal.ts
// Only import what's needed from Three.js
import { 
  Scene, 
  PerspectiveCamera, 
  WebGLRenderer 
} from 'three/src/Three';

// Export only what's used
export {
  Scene,
  PerspectiveCamera,
  WebGLRenderer
};
```

#### 2.3 Implement Long-Term Asset Caching

Update the Next.js config:

```js
// next.config.js
module.exports = {
  // ...existing config
  
  // Improve caching of static assets
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cdn.example.com' : '',
  
  // Generate static versions of critical pages
  exportPathMap: async function() {
    return {
      '/': { page: '/' },
      '/login': { page: '/login' },
      '/dashboard': { page: '/dashboard' },
    }
  },
  
  // Optimize bundle
  webpack: (config, { dev, isServer }) => {
    // Only apply in production client builds
    if (!dev && !isServer) {
      // Split chunks more aggressively
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          three: {
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            name: 'three-vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          // Add more vendor groups as needed
        }
      };
    }
    
    return config;
  }
}
```

#### 2.4 Implement Resource Hints

Add resource hints in HTML `<head>`:

```html
<!-- src/app/layout.tsx -->
<head>
  <!-- Preconnect to critical domains -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  
  <!-- Preload critical fonts -->
  <link 
    rel="preload" 
    href="/fonts/inter-var.woff2" 
    as="font" 
    type="font/woff2" 
    crossorigin="anonymous" 
  />
  
  <!-- Preload critical CSS -->
  <link 
    rel="preload" 
    href="/styles/critical.css" 
    as="style" 
  />
  
  <!-- Prefetch important but non-critical routes -->
  <link rel="prefetch" href="/dashboard" />
</head>
```

#### 2.5 Implement Module/NoModule Pattern

Serve modern JS to capable browsers and legacy JS to older browsers:

```html
<!-- In public/index.html -->
<script type="module" src="/js/main.modern.js"></script>
<script nomodule src="/js/main.legacy.js"></script>
```

## 3. Mobile Optimization Challenges

### Current Issues

1. Touch targets too small for mobile users
2. AR features drain battery quickly
3. High-resolution assets served to all devices
4. Insufficient use of responsive design patterns

### Optimization Solutions

#### 3.1 Implement Adaptive Serving Based on Device Capabilities

Create a device capability detection service:

```tsx
// src/utils/device-capability.ts
export type DeviceCapabilityLevel = 'low' | 'medium' | 'high';

export interface DeviceCapabilities {
  performanceLevel: DeviceCapabilityLevel;
  gpuTier: number; // 0-3
  isLowEndDevice: boolean;
  isMobileDevice: boolean;
  supportsDynamicImports: boolean;
  supportsWebGL2: boolean;
  supportsWebXR: boolean;
  hasLimitedMemory: boolean;
  pixelRatio: number;
  preferReducedMotion: boolean;
  connectionType?: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  batteryStatus?: {
    level: number;
    charging: boolean;
  };
}

export async function detectDeviceCapabilities(): Promise<DeviceCapabilities> {
  // Implement device capability detection logic
  // This will assess CPU, GPU, memory, network speed, etc.
  
  // Return comprehensive device capability information
}
```

#### 3.2 Develop Adaptive UI Components

Create adaptive components that respond to device capabilities:

```tsx
// src/components/adaptive/AdaptiveARViewer.tsx
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';

export function AdaptiveARViewer({ modelId }) {
  const { performanceLevel, isMobileDevice, batteryStatus } = useDeviceCapabilities();
  
  // Select appropriate quality based on device capabilities
  const qualityLevel = useMemo(() => {
    if (performanceLevel === 'low') return 'low';
    if (isMobileDevice && (!batteryStatus?.charging && batteryStatus?.level < 0.3)) {
      return 'low'; // Preserve battery on mobile
    }
    return performanceLevel === 'high' ? 'high' : 'medium';
  }, [performanceLevel, isMobileDevice, batteryStatus]);
  
  // Render appropriate viewer based on capabilities
  if (!isMobileDevice || performanceLevel === 'high') {
    return <FullFeaturedARViewer modelId={modelId} quality={qualityLevel} />;
  }
  
  return <LightweightARViewer modelId={modelId} quality={qualityLevel} />;
}
```

#### 3.3 Increase Touch Target Sizes

Create a mobile-friendly button component:

```tsx
// src/components/ui/mobile-button.tsx
import { BaseButton, BaseButtonProps } from '@/components/ui/base-button';

export function MobileButton(props: BaseButtonProps) {
  return (
    <BaseButton
      {...props}
      className={`min-h-[48px] min-w-[48px] ${props.className || ''}`}
    />
  );
}
```

#### 3.4 Add Power-Aware Rendering

Implement battery-aware features:

```tsx
// src/hooks/usePowerAwareRendering.tsx
export function usePowerAwareRendering() {
  const [isPowerSaveMode, setIsPowerSaveMode] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(1);
  const [isCharging, setIsCharging] = useState(true);
  
  useEffect(() => {
    // Monitor battery status
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        // Update state
        setIsCharging(battery.charging);
        setBatteryLevel(battery.level);
        
        // Set power save mode if battery is low and not charging
        setIsPowerSaveMode(battery.level < 0.2 && !battery.charging);
        
        // Add event listeners
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(battery.level);
          setIsPowerSaveMode(battery.level < 0.2 && !battery.charging);
        });
        
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
          setIsPowerSaveMode(battery.level < 0.2 && !battery.charging);
        });
      });
    }
  }, []);
  
  return { isPowerSaveMode, batteryLevel, isCharging };
}
```

## 4. Implementation Plan

1. **Phase 1: Optimize 3D/AR Components**
   - Implement OptimizedModelLoader
   - Create model compression pipeline
   - Properly use ARResourceMonitor in all AR components

2. **Phase 2: Reduce Bundle Size**
   - Implement route-based code splitting
   - Tree-shake Three.js
   - Optimize webpack configuration

3. **Phase 3: Enhance Mobile Experience**
   - Implement device capability detection
   - Create adaptive components
   - Increase touch target sizes for mobile

4. **Phase 4: Add Power-Aware Features**
   - Implement battery-aware rendering
   - Add power-saving mode for low battery

5. **Phase 5: Implement Progressive Loading**
   - Create progressive loading system
   - Implement resource hints
   - Optimize critical rendering path

## 5. Key Performance Metrics to Track

- First Contentful Paint (FCP): target under 1.8s
- Largest Contentful Paint (LCP): target under 2.5s
- First Input Delay (FID): target under 100ms
- Cumulative Layout Shift (CLS): target under 0.1
- Time to Interactive (TTI): target under 3.5s
- Frame rate in AR/3D experiences: target 30+ FPS on mobile, 60+ FPS on desktop
- Battery usage: reduce current consumption by 30%
- Bundle size: reduce by 40% through code splitting and tree-shaking 