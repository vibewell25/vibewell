import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useAdaptiveQuality } from '@/hooks/useDeviceCapabilities';
import { OptimizedModelLoader } from '@/components/ar/OptimizedModelLoader';
import { ARResourceMonitor } from '@/components/ar/ARResourceMonitor';
import { Environment, OrbitControls } from '@react-three/drei';

interface AdaptiveARViewerProps {
  /** ID of the model to display */
  modelId: string;
  /** Optional className for the container */
  className?: string;
  /** Whether to prioritize battery over quality on mobile */
  prioritizeBattery?: boolean;
  /** Whether to enable progressive loading */
  enableProgressiveLoading?: boolean;
  /** Whether to show performance monitoring */
  showPerformanceStats?: boolean;
  /** Callback when the model is loaded */
  onModelLoaded?: () => void;
  /** Callback when the viewer encounters a performance issue */
  onPerformanceWarning?: (metrics: any) => void;
  /** Canvas height */
  height?: string | number;
  /** Canvas width */
  width?: string | number;
// Map model IDs to their file paths
const MODEL_PATHS: Record<string, string> = {
  'lipstick-red': '/models/lipstick-red.glb',
  'foundation-medium': '/models/foundation-medium.glb',
  'eyeshadow-palette': '/models/eyeshadow-palette.glb',
  'blush-pink': '/models/blush-pink.glb',
/**
 * Simple placeholder model while loading the actual model
 */
function PlaceholderModel() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#cccccc" />
    </mesh>
/**
 * AdaptiveARViewer - A performance-optimized 3D viewer component
 *
 * This component automatically adapts to the device capabilities and
 * optimizes rendering quality and performance based on device constraints.
 *
 * Features:
 * - Adaptive quality based on device capabilities
 * - Progressive loading of models
 * - Power-aware rendering for mobile devices
 * - Performance monitoring and automatic optimization
 *
 * @example
 * ```tsx
 * <AdaptiveARViewer
 *   modelId="lipstick-red"
 *   prioritizeBattery={true}
 *   enableProgressiveLoading={true}
 * />
 * ```
 */
export function AdaptiveARViewer({
  modelId,
  className = '',
  prioritizeBattery = true,
  enableProgressiveLoading = true,
  showPerformanceStats = false,
  onModelLoaded,
  onPerformanceWarning,
  height = '400px',
  width = '100%',
: AdaptiveARViewerProps) {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [progressiveQuality, setProgressiveQuality] = useState<'low' | 'medium' | 'high'>('low');
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // Get adaptive quality settings based on device capabilities
  const {
    quality: recommendedQuality,
    isMobile,
    isLowBattery,
    capabilities,
= useAdaptiveQuality({
    preferBattery: prioritizeBattery,
    batteryThreshold: 0.2,
// Determine the model path
  const modelPath = MODEL_PATHS[modelId] || '';

  // Handle initial model load
  const handleInitialLoad = () => {
    setIsModelLoaded(true);
    setIsInitialLoad(false);
    onModelLoaded.();

    // If progressive loading is enabled and device can handle it,
    // upgrade to higher quality after initial render
    if (enableProgressiveLoading && recommendedQuality !== 'low') {
      // Use requestIdleCallback for better performance
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(
          () => {
            setProgressiveQuality('medium');
{ timeout: 2000 },
else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          setProgressiveQuality('medium');
2000);
// Handle medium quality load completion
  const handleMediumQualityLoad = () => {
    // If device can handle high quality, upgrade after a delay
    if (recommendedQuality === 'high') {
      // Use requestIdleCallback for better performance
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(
          () => {
            setProgressiveQuality('high');
{ timeout: 5000 },
else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          setProgressiveQuality('high');
5000);
// Handle performance warning
  const handlePerformanceWarning = (metrics: any) => {
    // Downgrade quality if performance issues are detected
    if (progressiveQuality !== 'low') {
      setProgressiveQuality('low');
// Call the provided callback if available
    onPerformanceWarning.(metrics);
// Determine the final quality level to use
  const finalQuality = enableProgressiveLoading ? progressiveQuality : recommendedQuality;

  return (
    <div className={`adaptive-ar-viewer relative ${className}`} style={{ height, width }}>
      {/* Loading Indicator */}
      {!isModelLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="text-center">
            <div className="border-primary mb-2 inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"></div>
            <p>
              Loading{' '}
              {finalQuality === 'low'
                ? 'Preview'
                : finalQuality === 'medium'
                  ? 'Model'
                  : 'High Quality'}
            </p>
          </div>
        </div>
      )}

      {/* AR Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4], fov: isMobile ? 60 : 50 }}
        dpr={[1, capabilities.pixelRatio > 2 ? 2 : capabilities.pixelRatio]}
      >
        {/* Basic Scene Setup */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />

        {/* Resource Monitor for performance optimization */}
        <ARResourceMonitor
          enableAdaptiveQuality={true}
          performanceThreshold={isMobile ? 24 : 30}
          devModeOnly={!showPerformanceStats}
          enableErrorTracking={true}
          enablePerformanceLogging={showPerformanceStats}
          optimizations={{
            reduceTextureQuality: true,
            disableShadows: isMobile || isLowBattery,
            reduceDrawDistance: isMobile || finalQuality === 'low',
            enableFrustumCulling: true,
            reduceLightCount: isMobile || finalQuality === 'low',
onPerformanceWarning={handlePerformanceWarning}
        />

        <Suspense fallback={<PlaceholderModel />}>
          {/* Show appropriate quality model based on progressive loading state */}
          {modelPath && (
            <OptimizedModelLoader
              modelPath={modelPath}
              quality={finalQuality}
              onLoaded={
                isInitialLoad
                  ? handleInitialLoad
                  : finalQuality === 'medium'
                    ? handleMediumQualityLoad
                    : undefined
autoRotate={true}
              rotationSpeed={0.01}
              scale={1.5}
            />
          )}

          {/* Environment and controls */}
          <Environment preset={finalQuality === 'low' ? 'apartment' : 'city'} />
          <OrbitControls
            enablePan={false}
            enableZoom={!isMobile}
            rotateSpeed={isMobile ? 0.5 : 1}
            minDistance={2}
            maxDistance={10}
          />
        </Suspense>
      </Canvas>

      {/* Performance Stats (if enabled) */}
      {showPerformanceStats && (
        <div className="absolute bottom-2 left-2 rounded bg-black/50 p-1 text-xs text-white">
          <div>Quality: {finalQuality}</div>
          <div>Device: {isMobile ? 'Mobile' : 'Desktop'}</div>
          <div>Battery: {isLowBattery ? 'Low' : 'Normal'}</div>
          <div>GPU Tier: {capabilities.gpuTier}</div>
        </div>
      )}
    </div>
