'use client';

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF } from '@react-three/drei';

interface ARViewerProps {
  modelUrl: string;
  backgroundColor?: string;
  autoRotate?: boolean;
  environmentPreset?: 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'city' | 'park' | 'lobby';
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
  environmentPreset = 'studio'
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
      <div className="w-full h-96 flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-96" style={{ backgroundColor }}>
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