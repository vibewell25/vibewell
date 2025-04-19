/**
 * Device capability levels for performance-based adaptations
 */
export type DeviceCapabilityLevel = 'low' | 'medium' | 'high';

/**
 * Network connection types
 */
export type ConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';

/**
 * Battery status information
 */
export interface BatteryStatus {
  /** Battery level from 0 to 1 */
  level: number;
  /** Whether the device is currently charging */
  charging: boolean;
  /** Estimated time until battery is fully charged (if charging) */
  chargingTime?: number;
  /** Estimated time until battery is fully discharged (if not charging) */
  dischargingTime?: number;
}

/**
 * Comprehensive device capabilities information
 */
export interface DeviceCapabilities {
  /** Overall performance level classification */
  performanceLevel: DeviceCapabilityLevel;
  /** GPU tier from 0 (lowest) to 3 (highest) */
  gpuTier: number;
  /** Whether the device is considered low-end */
  isLowEndDevice: boolean;
  /** Whether the device is a mobile device */
  isMobileDevice: boolean;
  /** Whether the browser supports dynamic imports */
  supportsDynamicImports: boolean;
  /** Whether the browser supports WebGL 2 */
  supportsWebGL2: boolean;
  /** Whether the browser supports WebXR */
  supportsWebXR: boolean;
  /** Whether the device has limited memory */
  hasLimitedMemory: boolean;
  /** Device pixel ratio */
  pixelRatio: number;
  /** Whether the user prefers reduced motion */
  preferReducedMotion: boolean;
  /** Network connection type if available */
  connectionType?: ConnectionType;
  /** Battery status if available */
  batteryStatus?: BatteryStatus;
  /** CPU information if available */
  cpuCores?: number;
  /** Whether the device supports touch */
  supportsTouch: boolean;
  /** Available device memory in GB (if available) */
  deviceMemory?: number;
  /** Browser's maximum texture size support */
  maxTextureSize?: number;
  /** Screen size category */
  screenSizeCategory: 'small' | 'medium' | 'large';
}

/**
 * Cache the capabilities to avoid recalculating
 */
let cachedCapabilities: DeviceCapabilities | null = null;

/**
 * Detect if the current environment is a browser
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Get connection type from navigator.connection if available
 */
const getConnectionType = (): ConnectionType => {
  if (!isBrowser || !('connection' in navigator)) {
    return 'unknown';
  }
  
  const connection = (navigator as any).connection;
  if (!connection) return 'unknown';
  
  // Handle effectiveType for Network Information API
  if (connection.effectiveType) {
    switch (connection.effectiveType) {
      case 'slow-2g':
        return 'slow-2g';
      case '2g':
        return '2g';
      case '3g':
        return '3g';
      case '4g':
        return '4g';
      default:
        return 'unknown';
    }
  }
  
  // Fallback for older APIs
  if (connection.type) {
    switch (connection.type) {
      case 'cellular':
        return '3g'; // Assume 3G for any cellular connection
      case 'wifi':
      case 'ethernet':
        return '4g'; // Assume fast connection for WiFi/Ethernet
      default:
        return 'unknown';
    }
  }
  
  return 'unknown';
};

/**
 * Get the device's battery status if available
 */
const getBatteryStatus = async (): Promise<BatteryStatus | undefined> => {
  if (!isBrowser || !('getBattery' in navigator)) {
    return undefined;
  }
  
  try {
    const battery = await (navigator as any).getBattery();
    
    return {
      level: battery.level,
      charging: battery.charging,
      chargingTime: battery.chargingTime !== Infinity ? battery.chargingTime : undefined,
      dischargingTime: battery.dischargingTime !== Infinity ? battery.dischargingTime : undefined,
    };
  } catch (error) {
    console.warn('Battery API not available:', error);
    return undefined;
  }
};

/**
 * Estimate GPU tier based on available information
 */
const estimateGPUTier = (): number => {
  if (!isBrowser) return 1;
  
  // Try to get WebGL renderer info
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) return 1;
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 1;
    
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    
    // Check for known high-end GPU identifiers
    if (/nvidia|rtx|gtx|radeon|adreno( *)?([6-9]\d0)/i.test(renderer)) {
      return 3; // High-end GPU
    }
    
    // Check for known mid-range GPU identifiers
    if (/intel( *)?iris|adreno( *)?([5]\d0)|mali-g/i.test(renderer)) {
      return 2; // Mid-range GPU
    }
    
    return 1; // Assume low-end GPU otherwise
  } catch (error) {
    return 1; // Default to low-end on error
  }
};

/**
 * Get maximum texture size supported by the GPU
 */
const getMaxTextureSize = (): number => {
  if (!isBrowser) return 2048;
  
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) return 2048;
    
    return gl.getParameter(gl.MAX_TEXTURE_SIZE);
  } catch (error) {
    return 2048; // Default value
  }
};

/**
 * Check if the browser supports WebGL 2
 */
const supportsWebGL2 = (): boolean => {
  if (!isBrowser) return false;
  
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch (error) {
    return false;
  }
};

/**
 * Check if the browser supports WebXR
 */
const supportsWebXR = (): boolean => {
  if (!isBrowser) return false;
  return 'xr' in navigator;
};

/**
 * Determine device memory (if available)
 */
const getDeviceMemory = (): number | undefined => {
  if (!isBrowser || !('deviceMemory' in navigator)) {
    return undefined;
  }
  
  return (navigator as any).deviceMemory;
};

/**
 * Determine screen size category
 */
const getScreenSizeCategory = (): 'small' | 'medium' | 'large' => {
  if (!isBrowser) return 'medium';
  
  const width = window.innerWidth;
  
  if (width < 768) return 'small';
  if (width < 1280) return 'medium';
  return 'large';
};

/**
 * Check if dynamic imports are supported
 */
const supportsDynamicImports = (): boolean => {
  try {
    // This is a simple check for basic syntax support
    // It doesn't actually execute an import
    new Function('return import("./test.js")');
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Check if the connection is slow based on type
 */
const isSlowConnection = (connectionType: ConnectionType): boolean => {
  return connectionType === 'slow-2g' || connectionType === '2g';
};

/**
 * Check if the connection is fast
 */
const isFastConnection = (connectionType: ConnectionType): boolean => {
  return connectionType === '4g';
};

/**
 * Detect device capabilities
 * 
 * This function assesses the current device capabilities to determine
 * appropriate performance settings for adaptive rendering.
 */
export async function detectDeviceCapabilities(): Promise<DeviceCapabilities> {
  // Return cached result if available
  if (cachedCapabilities) return cachedCapabilities;
  
  // Default capabilities for server-side rendering
  if (!isBrowser) {
    return {
      performanceLevel: 'medium',
      gpuTier: 1,
      isLowEndDevice: false,
      isMobileDevice: false,
      supportsDynamicImports: false,
      supportsWebGL2: false,
      supportsWebXR: false,
      hasLimitedMemory: false,
      pixelRatio: 1,
      preferReducedMotion: false,
      supportsTouch: false,
      screenSizeCategory: 'medium',
    };
  }
  
  // Device type detection
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  // Get battery status
  const batteryStatus = await getBatteryStatus();
  
  // Get GPU tier
  const gpuTier = estimateGPUTier();
  
  // Check for dynamic imports support
  const dynamicImportsSupport = supportsDynamicImports();
  
  // Check for WebGL 2 support
  const webGL2Support = supportsWebGL2();
  
  // Check for WebXR support
  const webXRSupport = supportsWebXR();
  
  // Get device pixel ratio
  const pixelRatio = window.devicePixelRatio || 1;
  
  // Check for reduced motion preference
  const preferReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Get connection type
  const connectionType = getConnectionType();
  
  // Get device memory
  const deviceMemory = getDeviceMemory();
  
  // Check for touch support
  const supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Get max texture size
  const maxTextureSize = getMaxTextureSize();
  
  // CPU core count (if available)
  const cpuCores = navigator.hardwareConcurrency;
  
  // Get screen size category
  const screenSizeCategory = getScreenSizeCategory();
  
  // Determine if this is a low-end device
  const isLowEndDevice = 
    (isMobileDevice && gpuTier === 1) || 
    (deviceMemory !== undefined && deviceMemory < 4) ||
    isSlowConnection(connectionType) ||
    (batteryStatus && !batteryStatus.charging && batteryStatus.level < 0.2) ||
    pixelRatio < 2;
  
  // Determine if the device has limited memory
  const hasLimitedMemory = 
    (deviceMemory !== undefined && deviceMemory < 2) ||
    isLowEndDevice;
  
  // Determine overall performance level
  let performanceLevel: DeviceCapabilityLevel = 'medium';
  
  if (isLowEndDevice || 
      isSlowConnection(connectionType) ||
      (maxTextureSize && maxTextureSize <= 2048) ||
      (deviceMemory !== undefined && deviceMemory < 2)) {
    performanceLevel = 'low';
  } else if (gpuTier === 3 && 
            webGL2Support && 
            !isMobileDevice && 
            (isFastConnection(connectionType) || connectionType === 'unknown') &&
            (deviceMemory === undefined || deviceMemory >= 8)) {
    performanceLevel = 'high';
  }
  
  // Create device capabilities object
  const capabilities: DeviceCapabilities = {
    performanceLevel,
    gpuTier,
    isLowEndDevice,
    isMobileDevice,
    supportsDynamicImports: dynamicImportsSupport,
    supportsWebGL2: webGL2Support,
    supportsWebXR: webXRSupport,
    hasLimitedMemory,
    pixelRatio,
    preferReducedMotion,
    connectionType,
    batteryStatus,
    cpuCores,
    supportsTouch,
    deviceMemory,
    maxTextureSize,
    screenSizeCategory,
  };
  
  // Cache the capabilities
  cachedCapabilities = capabilities;
  
  return capabilities;
}

/**
 * Get default capabilities (for use in server-side rendering)
 */
export function getDefaultCapabilities(): DeviceCapabilities {
  return {
    performanceLevel: 'medium',
    gpuTier: 1,
    isLowEndDevice: false,
    isMobileDevice: false,
    supportsDynamicImports: false,
    supportsWebGL2: false,
    supportsWebXR: false,
    hasLimitedMemory: false,
    pixelRatio: 1,
    preferReducedMotion: false,
    supportsTouch: false,
    screenSizeCategory: 'medium',
  };
} 