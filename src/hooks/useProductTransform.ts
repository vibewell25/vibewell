import { useCallback } from 'react';
import * as THREE from 'three';
import { ProductType } from '@/types/product';

interface TransformOptions {
  productType: ProductType;
  intensity: number;
}

interface Landmark {
  x: number;
  y: number;
  z: number;
}

export const useProductTransform = () => {
  const transformProduct = useCallback(
    (
      model: THREE.Object3D,
      landmarks: Landmark[],
      options: TransformOptions
    ) => {
      if (!landmarks.length) return;

      const { productType, intensity } = options;

      // Calculate face center and dimensions
      const faceBounds = calculateFaceBounds(landmarks);
      const faceCenter = calculateFaceCenter(landmarks);
      
      // Apply base transformations
      model.position.set(faceCenter.x, faceCenter.y, faceCenter.z);
      
      // Apply product-specific transformations
      switch (productType) {
        case 'makeup':
          transformMakeup(model, landmarks, faceBounds, intensity);
          break;
        case 'accessory':
          transformAccessory(model, landmarks, faceBounds);
          break;
      }
    },
    []
  );

  return { transformProduct };
};

const calculateFaceBounds = (landmarks: Landmark[]) => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  landmarks.forEach(point => {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
    minZ = Math.min(minZ, point.z);
    maxZ = Math.max(maxZ, point.z);
  });

  return {
    width: maxX - minX,
    height: maxY - minY,
    depth: maxZ - minZ,
    center: {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      z: (minZ + maxZ) / 2
    }
  };
};

const calculateFaceCenter = (landmarks: Landmark[]) => {
  const sum = landmarks.reduce(
    (acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y,
      z: acc.z + point.z
    }),
    { x: 0, y: 0, z: 0 }
  );

  const count = landmarks.length;
  return {
    x: sum.x / count,
    y: sum.y / count,
    z: sum.z / count
  };
};

const transformMakeup = (
  model: THREE.Object3D,
  landmarks: Landmark[],
  faceBounds: ReturnType<typeof calculateFaceBounds>,
  intensity: number
) => {
  // Scale based on face dimensions
  const scale = Math.min(faceBounds.width, faceBounds.height) * 0.01;
  model.scale.set(scale, scale, scale);

  // Rotate to match face orientation
  const rotation = calculateFaceRotation(landmarks);
  model.rotation.set(rotation.x, rotation.y, rotation.z);

  // Apply intensity-based transformations
  model.traverse(child => {
    if (child instanceof THREE.Mesh) {
      const material = child.material as THREE.Material;
      if (material.opacity !== undefined) {
        material.opacity = intensity;
      }
    }
  });
};

const transformAccessory = (
  model: THREE.Object3D,
  landmarks: Landmark[],
  faceBounds: ReturnType<typeof calculateFaceBounds>
) => {
  // Scale based on face dimensions with padding
  const scale = Math.min(faceBounds.width, faceBounds.height) * 0.015;
  model.scale.set(scale, scale, scale);

  // Position relative to face center
  model.position.add(new THREE.Vector3(0, faceBounds.height * 0.1, 0));

  // Rotate to match face orientation with offset
  const rotation = calculateFaceRotation(landmarks);
  model.rotation.set(
    rotation.x,
    rotation.y,
    rotation.z + Math.PI * 0.1 // Slight tilt
  );
};

const calculateFaceRotation = (landmarks: Landmark[]) => {
  // Calculate face normal using three points
  const p1 = new THREE.Vector3(
    landmarks[0].x,
    landmarks[0].y,
    landmarks[0].z
  );
  const p2 = new THREE.Vector3(
    landmarks[1].x,
    landmarks[1].y,
    landmarks[1].z
  );
  const p3 = new THREE.Vector3(
    landmarks[2].x,
    landmarks[2].y,
    landmarks[2].z
  );

  const v1 = new THREE.Vector3().subVectors(p2, p1);
  const v2 = new THREE.Vector3().subVectors(p3, p1);
  const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();

  // Convert normal to rotation
  const rotation = new THREE.Euler();
  rotation.setFromVector3(normal);

  return rotation;
}; 