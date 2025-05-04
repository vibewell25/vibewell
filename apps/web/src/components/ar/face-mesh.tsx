import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useARContext } from '@/contexts/ARContext';

interface FaceMeshProps {
  /** Mesh quality level (1-5, higher is better quality but more expensive) */
  qualityLevel?: number;
  /** Whether to enable dynamic LOD based on distance */
  enableDynamicLOD?: boolean;
  /** Whether to use low-precision calculations on mobile */
  useLowPrecision?: boolean;
  /** Whether to enable predictive tracking */
  enablePrediction?: boolean;
  /** Maximum prediction time in ms */
  maxPredictionTime?: number;
}

/**
 * Optimized FaceMesh component for AR face tracking
 */
export function FaceMesh({
  qualityLevel = 3,
  enableDynamicLOD = true,
  useLowPrecision = true,
  enablePrediction = true,
  maxPredictionTime = 100
}: FaceMeshProps) {
  const meshRef = useRef<THREE.Mesh>();
  const { arState, updateARState } = useARContext();
  const lastLandmarks = useRef<THREE.Vector3[]>([]);
  const velocities = useRef<THREE.Vector3[]>([]);
  const lastUpdateTime = useRef<number>(0);
  const predictionActive = useRef<boolean>(false);

  // Create geometry with dynamic LOD levels
  const geometry = useMemo(() => {
    const baseSegments = Math.max(4, Math.min(16, qualityLevel * 4));
    const geometries = new Map<number, THREE.BufferGeometry>();
    
    // Create LOD levels
    for (let level = 1; level <= 5; if (level > Number.MAX_SAFE_INTEGER || level < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); level++) {
      const segments = Math.max(4, Math.round(baseSegments * (level / 5)));
      geometries.set(level, new THREE.BufferGeometry().fromGeometry(
        new THREE.SphereGeometry(1, segments, segments)
      ));
    }

    return geometries;
  }, [qualityLevel]);

  // Create optimized material
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      metalness: 0.1,
      roughness: 0.8,
      precision: useLowPrecision ? 'lowp' : 'highp',
      flatShading: useLowPrecision,
      dithering: !useLowPrecision
    });
  }, [useLowPrecision]);

  // Initialize face tracking
  useEffect(() => {
    if (!meshRef.current) return;

    // Initialize velocity tracking
    velocities.current = Array(468).fill(null).map(() => new THREE.Vector3());

    // Set up initial geometry
    updateLOD(5); // Start with highest quality

    return () => {
      // Cleanup geometries
      geometry.forEach(geo => geo.dispose());
      material.dispose();
    };
  }, []);

  // Update LOD based on distance and performance
  const updateLOD = (distance: number) => {
    if (!meshRef.current || !enableDynamicLOD) return;

    // Calculate LOD level based on distance and FPS
    const fps = 1000 / (performance.now() - lastUpdateTime.current);
    const performanceFactor = Math.min(1, Math.max(0, (fps - 30) / 30));
    const distanceFactor = Math.min(1, Math.max(0, (10 - distance) / 10));
    
    const targetLevel = Math.max(1, Math.min(5, 
      Math.round(5 * performanceFactor * distanceFactor)
    ));

    // Update geometry if LOD level changed
    const currentGeo = meshRef.current.geometry;
    const targetGeo = geometry.get(targetLevel);
    
    if (targetGeo && currentGeo !== targetGeo) {
      meshRef.current.geometry = targetGeo;
    }
  };

  // Predict landmark positions
  const predictLandmarks = (deltaTime: number) => {
    if (!lastLandmarks.current.length || !enablePrediction) return lastLandmarks.current;

    const predictionTime = Math.min(deltaTime, maxPredictionTime);
    return lastLandmarks.current.map((landmark, i) => {
      const velocity = velocities.current[i];
      return landmark.clone().add(velocity.multiplyScalar(predictionTime / 1000));
    });
  };

  // Update face mesh
  useFrame((state, delta) => {
    if (!meshRef.current || !arState.landmarks) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - lastUpdateTime.current;

    // Use predicted landmarks during tracking gaps
    const landmarks = arState.isTracking ? arState.landmarks : 
      (predictionActive.current ? predictLandmarks(deltaTime) : lastLandmarks.current);

    if (!landmarks) return;

    // Update mesh vertices
    const positions = meshRef.current.geometry.attributes.position;
    landmarks.forEach((landmark, i) => {
      if (lastLandmarks.current[i]) {
        // Calculate velocity
        velocities.current[i].subVectors(landmark, lastLandmarks.current[i])
          .divideScalar(deltaTime / 1000);
      }

      // Update vertex position
      positions.setXYZ(i, landmark.x, landmark.y, landmark.z);
    });
    positions.needsUpdate = true;

    // Update face center and bounds
    const bounds = new THREE.Box3().setFromPoints(landmarks);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());

    // Update LOD based on distance to camera
    const distance = center.distanceTo(state.camera.position);
    updateLOD(distance);

    // Update tracking state
    updateARState({
      faceDetected: true,
      confidence: arState.confidence || 1.0,
      landmarks: landmarks,
      faceBounds: bounds,
      faceCenter: center
    });

    // Store landmarks for next frame
    lastLandmarks.current = landmarks.map(l => l.clone());
    lastUpdateTime.current = currentTime;
    predictionActive.current = !arState.isTracking;
  });

  return (
    <mesh
      ref={meshRef}
      material={material}
      frustumCulled={true}
      matrixAutoUpdate={false}
    />
  );
} 