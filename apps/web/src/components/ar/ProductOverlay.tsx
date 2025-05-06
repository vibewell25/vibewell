import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useARContext } from '@/contexts/ARContext';
import { Product } from '@/types/product';
import { useProductTransform } from '@/hooks/useProductTransform';

interface ProductOverlayProps {
  product: Product;
  intensity: number;
export const ProductOverlay: React.FC<ProductOverlayProps> = ({
  product,
  intensity
) => {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const { arState } = useARContext();
  const { transformProduct } = useProductTransform();
  const [isLoading, setIsLoading] = useState(true);

  // Load 3D model
  const gltf = useLoader(GLTFLoader, product.modelUrl);

  useEffect(() => {
    if (!gltf) return;

    try {
      // Clone the model to avoid reference issues
      const model = gltf.scene.clone();
      
      // Apply initial transformations
      model.scale.set(0.1, 0.1, 0.1);
      model.rotation.set(0, 0, 0);
      
      // Setup materials
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Apply product-specific material settings
          if (child.material) {
            const material = child.material as THREE.Material;
            material.transparent = true;
            material.opacity = intensity;
            
            // Handle different product types
            if (product.type === 'makeup') {
              setupMakeupMaterial(child, product, intensity);
else if (product.type === 'accessory') {
              setupAccessoryMaterial(child, product);
// Update refs
      if (modelRef.current && groupRef.current) {
        groupRef.current.remove(modelRef.current);
modelRef.current = model;
      groupRef.current.add(model);
      
      setIsLoading(false);
catch (error) {
      console.error('Error setting up product model:', error);
      setIsLoading(false);
[gltf, product, intensity]);

  useEffect(() => {
    if (!modelRef.current || !arState.faceDetected) return;

    // Transform product based on face landmarks
    transformProduct(modelRef.current, arState.landmarks, {
      productType: product.type,
      intensity
[arState.faceDetected, arState.landmarks, product.type, intensity, transformProduct]);

  if (isLoading) {
    return null;
return <group ref={groupRef} />;
// Setup material for makeup products
const setupMakeupMaterial = (
  mesh: THREE.Mesh,
  product: Product,
  intensity: number
) => {
  const material = mesh.material as THREE.Material;
  
  if (material instanceof THREE.MeshStandardMaterial) {
    // Apply makeup-specific properties
    material.metalness = 0.1;
    material.roughness = 0.8;
    material.envMapIntensity = 1.0;
    
    // Apply color with intensity
    const color = new THREE.Color(product.color);
    material.color.lerp(color, intensity);
    
    // Handle different makeup types
    switch (product.makeupType) {
      case 'lipstick':
        material.roughness = 0.4;
        break;
      case 'eyeshadow':
        material.metalness = 0.3;
        break;
      case 'foundation':
        material.transparent = true;
        material.opacity = intensity * 0.8;
        break;
      default:
        break;
// Setup material for accessory products
const setupAccessoryMaterial = (
  mesh: THREE.Mesh,
  product: Product
) => {
  const material = mesh.material as THREE.Material;
  
  if (material instanceof THREE.MeshStandardMaterial) {
    // Apply accessory-specific properties
    material.metalness = product.metalness || 0.8;
    material.roughness = product.roughness || 0.2;
    material.envMapIntensity = 1.5;
    
    // Handle different accessory types
    switch (product.accessoryType) {
      case 'earrings':
        material.metalness = 0.9;
        material.roughness = 0.1;
        break;
      case 'necklace':
        material.metalness = 0.8;
        material.roughness = 0.2;
        break;
      case 'glasses':
        material.transparent = true;
        material.opacity = 0.9;
        break;
      default:
        break;
