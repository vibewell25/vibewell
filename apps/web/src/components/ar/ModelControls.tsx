import React, { useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { TransformControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useAnalytics } from '@/hooks/use-analytics';
import { Button } from '@/components/ui/Button';

/**
 * ModelControls component for handling 3D model transformations
 *
 * This component provides UI controls for transforming (translate, rotate, scale)
 * a 3D model in the ThreeARViewer. It also handles saving the model's position
 * to localStorage.
 *
 * @param props - Component props
 * @param props.modelRef - Reference to the THREE.Group containing the model
 * @param props.type - Type of model ('makeup', 'hairstyle', 'accessory')
 * @param props.intensity - Intensity value (1-10) affecting model appearance
 * @returns React component
 */
export function ModelControls({
  modelRef,
  type,
  intensity = 5,
: {
  modelRef: React.RefObject<THREE.Group>;
  type: string;
  intensity?: number;
) {
  const [mode, setMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [showControls, setShowControls] = useState(false);
  const { trackEvent } = useAnalytics();

  // Memoize the intensity factor to reduce recalculations
  const intensityFactor = useMemo(() => intensity / 5, [intensity]);

  // Memoize transformation parameters by type
  const transformParams = useMemo(() => {
    switch (type) {
      case 'makeup':
        return {
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          opacity: Math.min(intensityFactor, 1),
case 'hairstyle':
        return {
          position: [0, 0.5 * intensityFactor, 0],
          rotation: [0, 0, 0],
          scale: [
            1 + (intensityFactor - 1) * 0.2,
            1 + (intensityFactor - 1) * 0.2,
            1 + (intensityFactor - 1) * 0.2,
          ],
          opacity: 1,
case 'accessory':
        return {
          position: [0, 0.2 * intensityFactor, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          opacity: 1,
default:
        return {
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          opacity: 1,
[type, intensityFactor]);

  // Use useCallback for event handlers
  const handleControlChange = useCallback(
    (mode: 'translate' | 'rotate' | 'scale') => {
      setMode(mode);
      trackEvent('model_control_change', { mode, type });
[trackEvent, type],
const toggleControls = useCallback(() => {
    setShowControls((prev) => !prev);
[]);

  // Apply transformations in a more efficient way
  useFrame(() => {
    if (!modelRef.current) return;

    // Apply position without creating new vectors every frame
    modelRef.current.position.set(
      transformParams.position[0],
      transformParams.position[1],
      transformParams.position[2],
// Apply scale
    modelRef.current.scale.set(
      transformParams.scale[0],
      transformParams.scale[1],
      transformParams.scale[2],
// Apply material properties - only update when needed
    if (type === 'makeup') {
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (
                mat.opacity !== undefined &&
                Math.abs(mat.opacity - transformParams.opacity) > 0.01
              ) {
                mat.opacity = transformParams.opacity;
else if (
            child.material.opacity !== undefined &&
            Math.abs(child.material.opacity - transformParams.opacity) > 0.01
          ) {
            child.material.opacity = transformParams.opacity;
return (
    <>
      <div className="absolute right-4 top-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={toggleControls}>
          {showControls ? 'Hide Controls' : 'Show Controls'}
        </Button>
        {showControls && (
          <div className="flex gap-2">
            <Button
              variant={mode === 'translate' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleControlChange('translate')}
            >
              Move
            </Button>
            <Button
              variant={mode === 'rotate' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleControlChange('rotate')}
            >
              Rotate
            </Button>
            <Button
              variant={mode === 'scale' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleControlChange('scale')}
            >
              Scale
            </Button>
          </div>
        )}
      </div>
      {showControls && modelRef.current && (
        <TransformControls
          object={modelRef.current}
          mode={mode}
          onMouseUp={() => {
            // Save position to localStorage
            if (modelRef.current) {
              localStorage.setItem(
                `model-position-${type}`,
                JSON.stringify({
                  position: modelRef.current.position.toArray(),
                  rotation: modelRef.current.rotation.toArray(),
                  scale: modelRef.current.scale.toArray(),
),
/>
      )}
    </>
