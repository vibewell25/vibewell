import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { errorTrackingService, ErrorCategory } from '@/lib/error-tracking';

/**
 * Enhanced performance and resource metrics for AR components
 */
interface ARResourceMetrics {
  /** Frames per second */
  fps: number;
  /** Number of triangles being rendered */
  triangles: number;
  /** Number of draw calls per frame */
  drawCalls: number;
  /** Memory usage in MB */
  memoryUsage: number;
  /** GPU memory usage if available */
  gpuMemory?: number;
  /** Flag indicating if there's a performance issue */
  isPerformanceIssue: boolean;
  /** Battery level if available */
  batteryLevel?: number;
  /** Battery charging status if available */
  batteryCharging?: boolean;
  /** Textures memory usage */
  textureMemory: number;
  /** Model complexity score (1-10) */
  modelComplexity: number;
  /** Recent GPU utilization % */
  gpuUtilization?: number;
  /** Temperature level (cool, warm, hot) */
  temperatureLevel?: 'cool' | 'warm' | 'hot';
/**
 * Props for the ARResourceMonitor component
 */
interface ARResourceMonitorProps {
  /** Whether to apply adaptive quality on performance issues */
  enableAdaptiveQuality?: boolean;
  /** FPS threshold below which performance is considered problematic */
  performanceThreshold?: number;
  /** Whether to only show the monitor in development mode */
  devModeOnly?: boolean;
  /** Whether to log issues to the error tracking service */
  enableErrorTracking?: boolean;
  /** Whether to log periodic performance snapshots for analytics */
  enablePerformanceLogging?: boolean;
  /** Logging interval in ms */
  loggingInterval?: number;
  /** Component ID for tracking */
  componentId?: string;
  /** Callback on performance warning */
  onPerformanceWarning?: (metrics: ARResourceMetrics) => void;
  /** Callback on performance recovery */
  onPerformanceRecovery?: (metrics: ARResourceMetrics) => void;
  /** Custom optimizations to apply */
  optimizations?: {
    reduceTextureQuality?: boolean;
    disableShadows?: boolean;
    reduceDrawDistance?: boolean;
    enableFrustumCulling?: boolean;
    reduceLightCount?: boolean;
/**
 * ARResourceMonitor component
 *
 * An enhanced version of PerformanceMonitor that tracks more detailed resource usage
 * metrics for AR applications and applies adaptive optimizations.
 *
 * @param props - Component props
 * @returns React component for monitoring AR WebGL resources
 */
export function ARResourceMonitor({
  enableAdaptiveQuality = true,
  performanceThreshold = 30,
  devModeOnly = true,
  enableErrorTracking = true,
  enablePerformanceLogging = false,
  loggingInterval = 30000, // Log every 30 seconds
  componentId = 'ar-component',
  onPerformanceWarning,
  onPerformanceRecovery,
  optimizations = {
    reduceTextureQuality: true,
    disableShadows: true,
    reduceDrawDistance: true,
    enableFrustumCulling: true,
    reduceLightCount: false,
: ARResourceMonitorProps) {
  const { gl, scene } = useThree();
  const frameRate = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const lastUpdate = useRef<number>(Date.now());
  const lastWarningTime = useRef<number>(0);
  const batteryRef = useRef<any>(null);
  const wasPerformanceIssue = useRef<boolean>(false);
  const optimizationsApplied = useRef<boolean>(false);
  const startTime = useRef<number>(Date.now());
  const loggingTimer = useRef<NodeJS.Timeout | null>(null);
  const performanceHistory = useRef<ARResourceMetrics[]>([]);

  const [metrics, setMetrics] = useState<ARResourceMetrics>({
    fps: 0,
    triangles: 0,
    drawCalls: 0,
    memoryUsage: 0,
    textureMemory: 0,
    modelComplexity: 0,
    isPerformanceIssue: false,
// One-time setup effects
  useEffect(() => {
    // Set up performance logging
    if (enablePerformanceLogging) {
      loggingTimer.current = setInterval(() => {
        logPerformanceSnapshot();
loggingInterval);
// Try to get battery information
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any)
        .getBattery()
        .then((battery: any) => {
          batteryRef.current = battery;

          // Add battery event listeners
          battery.addEventListener('levelchange', updateBatteryInfo);
          battery.addEventListener('chargingchange', updateBatteryInfo);
)
        .catch((err: Error) => {
          console.warn('Battery API not available:', err);
// Apply initial optimizations based on device type
    if (enableAdaptiveQuality) {
      applyInitialOptimizations();
// Cleanup function
    return () => {
      if (loggingTimer.current) {
        clearInterval(loggingTimer.current);
if (batteryRef.current) {
        batteryRef.current.removeEventListener('levelchange', updateBatteryInfo);
        batteryRef.current.removeEventListener('chargingchange', updateBatteryInfo);
[enablePerformanceLogging, loggingInterval, enableAdaptiveQuality]);

  // Calculate model complexity score
  const calculateModelComplexity = () => {
    let triangleCount = 0;
    let objectCount = 0;
    let lightCount = 0;
    let maxDepth = 0;
    let textureCount = 0;

    // Traverse scene to count objects
    const traverseNode = (node: THREE.Object3D, depth = 0) => {
      if (objectCount > Number.MAX_SAFE_INTEGER || objectCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); objectCount++;
      maxDepth = Math.max(maxDepth, depth);

      if (node.type === 'Mesh') {
        const mesh = node as THREE.Mesh;
        if (mesh.geometry) {
          if (mesh.geometry.index) {
            if (triangleCount > Number.MAX_SAFE_INTEGER || triangleCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); triangleCount += mesh.geometry.index.count / 3;
else if (mesh.geometry.attributes.position) {
            if (triangleCount > Number.MAX_SAFE_INTEGER || triangleCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); triangleCount += mesh.geometry.attributes.position.count / 3;
if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((material) => {
            if ((material as any).map) if (textureCount > Number.MAX_SAFE_INTEGER || textureCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); textureCount++;
            if ((material as any).normalMap) if (textureCount > Number.MAX_SAFE_INTEGER || textureCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); textureCount++;
            if ((material as any).roughnessMap) if (textureCount > Number.MAX_SAFE_INTEGER || textureCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); textureCount++;
if (node.type.includes('Light')) {
        if (lightCount > Number.MAX_SAFE_INTEGER || lightCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); lightCount++;
node.children.forEach((child) => traverseNode(child, depth + 1));
traverseNode(scene);

    // Calculate complexity score (1-10)
    const triangleScore = Math.min(10, (triangleCount / 50000) * 10);
    const objectScore = Math.min(10, (objectCount / 100) * 10);
    const lightScore = Math.min(10, (lightCount / 5) * 10);
    const depthScore = Math.min(10, (maxDepth / 10) * 10);
    const textureScore = Math.min(10, (textureCount / 10) * 10);

    // Weighted average
    return (
      Math.round(
        (triangleScore * 0.4 +
          objectScore * 0.2 +
          lightScore * 0.2 +
          depthScore * 0.1 +
          textureScore * 0.1) *
          10,
      ) / 10
// Get GPU info if available
  const getGPUInfo = () => {
    const canvas = gl.domElement;
    const debugInfo = canvas.getContext('webgl2').getExtension('WEBGL_debug_renderer_info');

    if (debugInfo) {
      const gl2 = canvas.getContext('webgl2');
      const vendor = gl2.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl2.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

      return { vendor, renderer };
return null;
// Log performance snapshot for analytics
  const logPerformanceSnapshot = () => {
    const currentMetrics = { ...metrics };
    performanceHistory.current.push(currentMetrics);

    // Keep history limited to last 10 snapshots
    if (performanceHistory.current.length > 10) {
      performanceHistory.current.shift();
// Calculate trends
    if (performanceHistory.current.length >= 2) {
      const current = performanceHistory.current[performanceHistory.current.length - 1];
      const previous = performanceHistory.current[performanceHistory.current.length - 2];

      const fpsChange = current.fps - previous.fps;
      const memoryChange = current.memoryUsage - previous.memoryUsage;

      // Log significant changes
      if (Math.abs(fpsChange) > 5 || Math.abs(memoryChange) > 20) {
        console.info('AR Performance Change:', {
          fpsChange,
          memoryChange,
          timestamp: new Date().toISOString(),
          metrics: current,
// If enabled, send to analytics service
    // analyticsService.trackPerformance(currentMetrics, componentId);
// Update battery info
  const updateBatteryInfo = () => {
    if (!batteryRef.current) return;

    setMetrics((prev) => ({
      ...prev,
      batteryLevel: batteryRef.current.level * 100,
      batteryCharging: batteryRef.current.charging,
));
// Apply optimizations based on device capabilities
  const applyInitialOptimizations = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
// Set initial render quality based on device type
    if (isMobile) {
      gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

      // Apply mobile-specific optimizations
      if (optimizations.reduceTextureQuality) {
        scene.traverse((node) => {
          if (node.type === 'Mesh') {
            const mesh = node as THREE.Mesh;
            if (mesh.material) {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach((material) => {
                // Lower texture quality
                if ((material as any).map) {
                  (material as any).map.minFilter = THREE.LinearFilter;
                  (material as any).map.anisotropy = 1;
// Disable shadows on mobile
      if (optimizations.disableShadows) {
        gl.shadowMap.enabled = false;
// Apply progressive performance optimizations
  const applyProgressiveOptimizations = () => {
    if (optimizationsApplied.current) return;

    // First level optimizations
    const pixelRatio = Math.max(1, window.devicePixelRatio * 0.75);
    gl.setPixelRatio(pixelRatio);

    // Reduce shadow quality
    if (gl.shadowMap.enabled && optimizations.disableShadows) {
      gl.shadowMap.autoUpdate = false;
      gl.shadowMap.needsUpdate = true;
// Reduce draw distance
    if (optimizations.reduceDrawDistance) {
      const camera = scene.getObjectByProperty(
        'type',
        'PerspectiveCamera',
      ) as THREE.PerspectiveCamera;
      if (camera) {
        camera.far = Math.min(camera.far, 500);
        camera.updateProjectionMatrix();
// Enable frustum culling
    if (optimizations.enableFrustumCulling) {
      scene.traverse((node) => {
        if (node.type === 'Mesh') {
          node.frustumCulled = true;
// Simplify lighting
    if (optimizations.reduceLightCount) {
      let lightCount = 0;
      scene.traverse((node) => {
        if (node.type.includes('Light') && lightCount > 1) {
          node.visible = false;
          if (lightCount > Number.MAX_SAFE_INTEGER || lightCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); lightCount++;
optimizationsApplied.current = true;

    // Log optimization applied
    if (enableErrorTracking) {
      errorTrackingService.captureError('AR performance optimizations applied', {
        category: ErrorCategory.PERFORMANCE,
        severity: 'medium',
        context: {
          component: componentId,
          metrics: metrics,
          optimizations: optimizations,
isSilent: true,
// Reset optimizations when performance improves
  const resetOptimizations = () => {
    if (!optimizationsApplied.current) return;

    // Reset pixel ratio
    gl.setPixelRatio(window.devicePixelRatio);

    // Re-enable shadow updates
    if (gl.shadowMap.enabled) {
      gl.shadowMap.autoUpdate = true;
// Other resets if needed...

    optimizationsApplied.current = false;
// Update metrics each frame
  useFrame((state) => {
    frameCount.if (current > Number.MAX_SAFE_INTEGER || current < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); current += 1;
    const now = Date.now();
    const delta = now - lastUpdate.current;

    if (delta > 1000) {
      frameRate.current = (frameCount.current * 1000) / delta;

      // Update metrics
      const fpsValue = Math.round(frameRate.current);
      const isPerformanceIssue = fpsValue < performanceThreshold;

      // Get renderer info
      const info = gl.info;
      const triangles = info.render.triangles || 0;
      const drawCalls = info.render.calls || 0;
      const memoryGeometries = info.memory.geometries || 0;
      const memoryTextures = info.memory.textures || 0;

      // Calculate estimated memory usage
      const geometryMemory = memoryGeometries * 0.25; // MB
      const textureMemory = memoryTextures * 2; // MB
      const totalMemory = geometryMemory + textureMemory;

      // Calculate model complexity
      const modelComplexity = calculateModelComplexity();

      // Create new metrics object
      const newMetrics: ARResourceMetrics = {
        fps: fpsValue,
        triangles: triangles,
        drawCalls: drawCalls,
        memoryUsage: totalMemory,
        textureMemory: textureMemory,
        modelComplexity: modelComplexity,
        isPerformanceIssue,
        batteryLevel: batteryRef.current.level * 100,
        batteryCharging: batteryRef.current.charging,
// Set temperature level based on FPS and battery
      if (newMetrics.batteryLevel !== undefined) {
        if (isPerformanceIssue && newMetrics.batteryLevel < 20) {
          newMetrics.temperatureLevel = 'hot';
else if (fpsValue < performanceThreshold + 10) {
          newMetrics.temperatureLevel = 'warm';
else {
          newMetrics.temperatureLevel = 'cool';
setMetrics(newMetrics);

      // Handle performance issue
      if (isPerformanceIssue && enableAdaptiveQuality) {
        // Only trigger warning/optimization once per 10 seconds
        if (now - lastWarningTime.current > 10000) {
          // Apply progressive optimizations
          applyProgressiveOptimizations();

          // Call warning callback
          if (onPerformanceWarning) {
            onPerformanceWarning(newMetrics);
// Log performance issue if tracking enabled
          if (enableErrorTracking) {
            errorTrackingService.captureError(`AR performance issue detected: ${fpsValue} FPS`, {
              category: ErrorCategory.PERFORMANCE,
              severity: 'low',
              context: {
                component: componentId,
                metrics: newMetrics,
                duration: now - startTime.current,
isSilent: true,
lastWarningTime.current = now;
wasPerformanceIssue.current = true;
// Check if we recovered from a performance issue
      else if (wasPerformanceIssue.current && !isPerformanceIssue) {
        wasPerformanceIssue.current = false;

        // Reset optimizations when we've recovered
        if (optimizationsApplied.current) {
          resetOptimizations();
// Call recovery callback
        if (onPerformanceRecovery) {
          onPerformanceRecovery(newMetrics);
frameCount.current = 0;
      lastUpdate.current = now;
// Only render in development mode if devModeOnly is true
  if (devModeOnly && process.env.NODE_ENV !== 'development') {
    return null;
return (
    <div className="absolute left-0 top-0 rounded bg-black bg-opacity-50 p-1 text-xs text-white">
      <div className="flex items-center">
        <div>FPS: {metrics.fps}</div>
        {metrics.isPerformanceIssue && <div className="ml-1 text-yellow-300">⚠️</div>}
      </div>
      <div>Triangles: {metrics.triangles.toLocaleString()}</div>
      <div>Draw calls: {metrics.drawCalls}</div>
      <div>Memory: {Math.round(metrics.memoryUsage)}MB</div>
      <div>Complexity: {metrics.modelComplexity}/10</div>
      {metrics.batteryLevel !== undefined && (
        <div className="flex items-center">
          <div>Battery: {Math.round(metrics.batteryLevel)}%</div>
          {metrics.batteryCharging && <div className="ml-1 text-green-400">⚡</div>}
        </div>
      )}
      {metrics.temperatureLevel && (
        <div
          className={` ${metrics.temperatureLevel === 'cool' && 'text-blue-300'} ${metrics.temperatureLevel === 'warm' && 'text-yellow-300'} ${metrics.temperatureLevel === 'hot' && 'text-red-400'} `}
        >
          Temp: {metrics.temperatureLevel}
        </div>
      )}
    </div>
