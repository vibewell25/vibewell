import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useARContext } from '@/contexts/ARContext';
import { mergeRefs } from '@/utils/refs';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface ARSceneProps {
  children: React.ReactNode;
/**
 * Enhanced AR Scene with optimized rendering and performance features
 */
export const ARScene = React.forwardRef<THREE.Scene, ARSceneProps>(({ children }, ref) => {
  const sceneRef = useRef<THREE.Scene>(null);
  const { gl, camera } = useThree();
  const { arState, updateARState } = useARContext();
  const lastFrameTime = useRef<number>(0);
  const frameSkipThreshold = 1000 / 30; // Target 30 FPS minimum
  const { updateMetrics } = usePerformanceMonitor();

  // Initialize optimized renderer settings
  useEffect(() => {
    if (!gl) return;

    // Enable optimizations
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    gl.physicallyCorrectLights = true;
    gl.outputEncoding = THREE.sRGBEncoding;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Enable WebGL optimizations
    gl.getContext().getExtension('EXT_color_buffer_float');
    gl.getContext().getExtension('OES_texture_float_linear');
    
    // Set up power preference
    if ('powerPreference' in gl) {
      (gl as any).powerPreference = 'high-performance';
// Initialize render targets with proper formats
    const depthTexture = new THREE.DepthTexture();
    depthTexture.format = THREE.DepthFormat;
    depthTexture.type = THREE.UnsignedShortType;

    const renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth * gl.getPixelRatio(),
      window.innerHeight * gl.getPixelRatio(),
      {
        depthTexture,
        depthBuffer: true,
        stencilBuffer: false,
        generateMipmaps: false,
gl.setRenderTarget(renderTarget);

    return () => {
      renderTarget.dispose();
      depthTexture.dispose();
[gl]);

  // Scene optimization setup
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;

    // Enable frustum culling
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.frustumCulled = true;
        
        // Optimize geometries
        if (object.geometry) {
          object.geometry.computeBoundingSphere();
          object.geometry.computeBoundingBox();
// Optimize materials
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(material => {
            material.precision = 'lowp'; // Use low precision on mobile
            material.dithering = false;
            
            // Optimize textures
            if ('map' in material && material.map) {
              material.map.generateMipmaps = false;
              material.map.minFilter = THREE.LinearFilter;
              material.map.magFilter = THREE.LinearFilter;
// Set up scene level optimizations
    scene.matrixAutoUpdate = false;
    scene.autoUpdate = false;
[]);

  useFrame((state, delta) => {
    if (!sceneRef.current) return;

    const currentTime = performance.now();
    const timeSinceLastFrame = currentTime - lastFrameTime.current;

    // Skip frame if we're running too fast
    if (timeSinceLastFrame < frameSkipThreshold) {
      return;
// Update scene matrices selectively
    sceneRef.current.traverse((object) => {
      if (object.matrixWorldNeedsUpdate) {
        object.updateMatrixWorld(true);
// Update performance metrics
    updateMetrics({
      fps: 1 / delta,
      triangles: gl.info.render.triangles,
      calls: gl.info.render.calls
// Update AR state
    if (arState.isTracking) {
      const worldMatrix = camera.matrixWorld.clone();
      updateARState({
        cameraPosition: camera.position.clone(),
        worldMatrix
// Render scene with optimizations
    gl.render(sceneRef.current, camera);
    lastFrameTime.current = currentTime;
return (
    <scene ref={mergeRefs([sceneRef, ref])}>
      <primitive object={camera} />
      {children}
    </scene>
ARScene.displayName = 'ARScene'; 