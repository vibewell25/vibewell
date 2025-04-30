import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import { useARContext } from '@/contexts/ARContext';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface ARSceneProps {
  children: React.ReactNode;
}

export const ARScene = React.forwardRef<THREE.Scene, ARSceneProps>(
  ({ children }, ref) => {
    const sceneRef = useRef<THREE.Scene>(null);
    const { camera, gl } = useThree();
    const { updateMetrics } = usePerformanceMonitor();
    const { arState, updateARState } = useARContext();

    useEffect(() => {
      if (!sceneRef.current) return;

      // Setup scene
      const scene = sceneRef.current;
      scene.background = new THREE.Color(0x000000);
      scene.fog = new THREE.Fog(0x000000, 1, 1000);

      // Setup lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 1, 1);
      scene.add(ambientLight, directionalLight);

      // Setup camera
      camera.position.z = 5;
      camera.lookAt(0, 0, 0);

      // Setup renderer
      gl.setPixelRatio(window.devicePixelRatio);
      gl.setSize(window.innerWidth, window.innerHeight);
      gl.shadowMap.enabled = true;
      gl.shadowMap.type = THREE.PCFSoftShadowMap;

      // Handle window resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        gl.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        scene.remove(ambientLight, directionalLight);
      };
    }, [camera, gl]);

    useFrame((state, delta) => {
      if (!sceneRef.current) return;

      // Update performance metrics
      updateMetrics({
        fps: 1 / delta,
        triangles: renderer.info.render.triangles,
        calls: renderer.info.render.calls
      });

      // Update AR state
      if (arState.isTracking) {
        const worldMatrix = camera.matrixWorld.clone();
        updateARState({
          cameraPosition: camera.position.clone(),
          worldMatrix
        });
      }

      // Render scene
      gl.render(sceneRef.current, camera);
    });

    return (
      <scene ref={mergeRefs([sceneRef, ref])}>
        <primitive object={camera} />
        {children}
      </scene>
    );
  }
);

ARScene.displayName = 'ARScene';

// Utility to merge refs
const mergeRefs = <T extends any>(
  refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>
): React.RefCallback<T> => {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}; 