'use client';

import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF, Preload, useTexture, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

interface ARViewerProps {
  modelUrl: string;
  backgroundColor?: string;
  autoRotate?: boolean;
  environmentPreset?:
    | 'sunset'
    | 'dawn'
    | 'night'
    | 'warehouse'
    | 'forest'
    | 'apartment'
    | 'studio'
    | 'city'
    | 'park'
    | 'lobby';
  lowPerformanceMode?: boolean;
}

// Performance monitor component to adjust quality based on framerate
function PerformanceMonitor() {
  const { gl } = useThree();
  
  useEffect(() => {
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
    // Set reasonable anisotropy value (not maximum)
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Clean up when unmounting
    return () => {
      // Dispose any resources if needed
      gl.renderLists.dispose();
    };
  }, [gl]);
  
  return null;
}

// Loading placeholder for Suspense
function LoadingPlaceholder() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#cccccc" />
    </mesh>
  );
}

// Model component that loads the 3D model with proper resource management
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url, true);  // true enables error handling

  useEffect(() => {
    // Clean up function to dispose resources
    return () => {
      scene.traverse((object) => {
        if (object.type === 'Mesh') {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      
      // Clean up GLTF cache for this model
      useGLTF.dispose(url);
    };
  }, [url, scene]);

  return <primitive object={scene} scale={1} />;
}

/**
 * Optimized AR Viewer Component
 *
 * Uses performance optimization techniques to efficiently render 3D models
 */
export default function ARViewer({
  modelUrl,
  backgroundColor = '#f5f5f5',
  autoRotate = true,
  environmentPreset = 'studio',
  lowPerformanceMode = false,
}: ARViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Check if we're running on a device that likely has low performance
  const [devicePerformance, setDevicePerformance] = useState('high');
  
  useEffect(() => {
    // Detect low-end devices
    const checkDevicePerformance = () => {
      // Get logical processors count if available
      const processors = navigator.hardwareConcurrency || 4;
      // Check if running on mobile
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      // Lower-end device heuristic
      const isLowEnd = processors <= 4 || isMobile;
      
      setDevicePerformance(isLowEnd ? 'low' : 'high');
    };
    
    checkDevicePerformance();
    
    // Simulate heavy resource loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);
  
  // Determine quality settings based on device performance and props
  const dpr = (devicePerformance === 'low' || lowPerformanceMode) ? [0.5, 1] : [1, 2];
  const frameloop = (devicePerformance === 'low' || lowPerformanceMode) ? 'demand' : 'always';

  if (!isLoaded) {
    return (
      <div
        className="flex h-96 w-full items-center justify-center bg-gray-100"
        data-testid="ar-viewer-container"
      >
        <div
          className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"
          data-testid="loading-spinner"
        ></div>
      </div>
    );
  }

  return (
    <div className="h-96 w-full" style={{ backgroundColor }} data-testid="ar-viewer-container">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={dpr}
        frameloop={frameloop as 'always' | 'demand' | 'never'}
        gl={{ 
          powerPreference: 'high-performance',
          antialias: devicePerformance === 'high',
          depth: true,
          stencil: false,
          alpha: true
        }}
        performance={{ min: 0.5 }}
      >
        <PerformanceMonitor />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow={devicePerformance === 'high'} />
        
        <Suspense fallback={<LoadingPlaceholder />}>
          <Model url={modelUrl} />
          <Environment preset={environmentPreset} />
        </Suspense>
        
        <OrbitControls 
          autoRotate={autoRotate} 
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.5}
          enableZoom={true}
        />
        
        <Preload all />
      </Canvas>
    </div>
  );
}
