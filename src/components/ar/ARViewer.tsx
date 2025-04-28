'use client';

import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF } from '@react-three/drei';

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
}

// Model component that loads the 3D model
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    // Clean up function to dispose resources
    return () => {
      useGLTF.preload(url);
    };
  }, [url]);

  return <primitive object={scene} scale={1} />;
}

/**
 * AR Viewer Component
 *
 * A heavy component that uses Three.js to render 3D models
 */
export default function ARViewer({
  modelUrl,
  backgroundColor = '#f5f5f5',
  autoRotate = true,
  environmentPreset = 'studio',
}: ARViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate heavy resource loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <Model url={modelUrl} />
        <OrbitControls autoRotate={autoRotate} />
        <Environment preset={environmentPreset} />
      </Canvas>
    </div>
  );
}
