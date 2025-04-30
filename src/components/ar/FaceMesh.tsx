import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { useFaceMeshGeometry } from '@/hooks/useFaceMeshGeometry';
import { useARContext } from '@/contexts/ARContext';

interface FaceMeshProps {
  wireframe?: boolean;
  opacity?: number;
}

export const FaceMesh: React.FC<FaceMeshProps> = ({
  wireframe = false,
  opacity = 1
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { faceDetection, startDetection, stopDetection } = useFaceDetection();
  const { geometry, updateGeometry } = useFaceMeshGeometry();
  const { arState, updateARState } = useARContext();

  useEffect(() => {
    startDetection();
    return () => stopDetection();
  }, [startDetection, stopDetection]);

  useEffect(() => {
    if (!meshRef.current || !geometry) return;

    meshRef.current.geometry = geometry;
  }, [geometry]);

  useFrame(() => {
    if (!meshRef.current || !faceDetection) return;

    // Update mesh geometry based on face detection
    const landmarks = faceDetection.landmarks;
    if (landmarks) {
      updateGeometry(landmarks);
      updateARState({
        faceDetected: true,
        landmarks: landmarks.positions,
        confidence: faceDetection.detection.score
      });
    }
  });

  return (
    <mesh ref={meshRef}>
      <meshStandardMaterial
        transparent
        opacity={opacity}
        wireframe={wireframe}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Custom hook for face mesh geometry generation
const useFaceMeshGeometry = () => {
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);

  const updateGeometry = (landmarks: any) => {
    if (!geometryRef.current) {
      geometryRef.current = new THREE.BufferGeometry();
    }

    // Convert landmarks to vertices
    const vertices = landmarks.positions.flatMap((p: any) => [p.x, p.y, p.z]);
    
    // Define triangulation indices for face mesh
    const indices = [
      // Forehead
      0, 1, 2,
      2, 1, 3,
      // Nose bridge
      4, 5, 6,
      6, 5, 7,
      // Left eye
      8, 9, 10,
      10, 9, 11,
      // Right eye
      12, 13, 14,
      14, 13, 15,
      // Mouth
      16, 17, 18,
      18, 17, 19,
      // Chin
      20, 21, 22,
      22, 21, 23
    ];

    // Update geometry attributes
    geometryRef.current.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    geometryRef.current.setIndex(indices);
    geometryRef.current.computeVertexNormals();
    geometryRef.current.computeBoundingSphere();
  };

  return {
    geometry: geometryRef.current,
    updateGeometry
  };
};

// Custom hook for face detection
const useFaceDetection = () => {
  const [faceDetection, setFaceDetection] = useState<any>(null);
  const detectorRef = useRef<any>(null);

  const startDetection = async () => {
    try {
      const model = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
        { maxFaces: 1 }
      );
      detectorRef.current = model;
    } catch (error) {
      console.error('Error loading face detection model:', error);
    }
  };

  const stopDetection = () => {
    if (detectorRef.current) {
      detectorRef.current.dispose();
      detectorRef.current = null;
    }
  };

  const detectFace = async (video: HTMLVideoElement) => {
    if (!detectorRef.current) return;

    try {
      const predictions = await detectorRef.current.estimateFaces(video);
      if (predictions.length > 0) {
        setFaceDetection(predictions[0]);
      }
    } catch (error) {
      console.error('Error detecting face:', error);
    }
  };

  return {
    faceDetection,
    startDetection,
    stopDetection,
    detectFace
  };
}; 