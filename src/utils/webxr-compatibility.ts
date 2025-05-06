/**
 * WebXR Compatibility Detection Utilities
 * Helps detect AR/VR capabilities of current device and browser
 */

/**
 * Possible XR modes that can be used by the application
 */
export enum XRMode {
  AR = 'ar',
  VR = 'vr',
  FALLBACK = 'fallback'
}

/**
 * Fallback types when WebXR is not supported
 */
export enum XRFallbackType {
  AR_QUICK_LOOK = 'ar-quick-look',   // iOS Quick Look
  SCENE_VIEWER = 'scene-viewer',      // Android Scene Viewer
  MODEL_VIEWER = 'model-viewer',      // Web Component <model-viewer>
  STATIC_IMAGE = 'static-image'       // Simple static image
}

/**
 * Device detection information
 */
export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  browserType: 'chrome' | 'safari' | 'firefox' | 'edge' | 'unknown';
  hasGyroscope: boolean;
}

/**
 * XR support detection result
 */
export interface XRSupportInfo extends DeviceInfo {
  arSupported: boolean;
  vrSupported: boolean;
  recommendedMode: XRMode;
  fallbackType: XRFallbackType;
}

/**
 * Detect if the device supports WebXR AR mode
 */
export async function checkARSupport(): Promise<boolean> {
  try {
    if (!navigator.xr) {
      return false;
    }
    
    return await navigator.xr.isSessionSupported('immersive-ar');
  } catch (error) {
    console.error('Error detecting AR support:', error);
    return false;
  }
}

/**
 * Detect if the device supports WebXR VR mode
 */
export async function checkVRSupport(): Promise<boolean> {
  try {
    if (!navigator.xr) {
      return false;
    }
    
    return await navigator.xr.isSessionSupported('immersive-vr');
  } catch (error) {
    console.error('Error detecting VR support:', error);
    return false;
  }
}

/**
 * Detect device and browser information
 */
export function detectDeviceInfo(): DeviceInfo {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Detect device type
  const isMobile = /android|iphone|ipod|mobile/i.test(userAgent);
  const isTablet = /ipad|tablet/i.test(userAgent);
  
  let deviceType: DeviceInfo['deviceType'] = 'unknown';
  if (isMobile) deviceType = 'mobile';
  else if (isTablet) deviceType = 'tablet';
  else deviceType = 'desktop';
  
  // Detect browser type
  let browserType: DeviceInfo['browserType'] = 'unknown';
  if (/chrome/i.test(userAgent)) browserType = 'chrome';
  else if (/safari/i.test(userAgent)) browserType = 'safari';
  else if (/firefox/i.test(userAgent)) browserType = 'firefox';
  else if (/edge/i.test(userAgent)) browserType = 'edge';
  
  // Check for gyroscope (simplified, in real app would be more complex)
  const hasGyroscope = typeof DeviceMotionEvent !== 'undefined' || 
    typeof window.DeviceOrientationEvent !== 'undefined';
    
  return {
    deviceType,
    browserType,
    hasGyroscope
  };
}

/**
 * Determine the most appropriate fallback type based on device info
 */
export function determineFallbackType(deviceInfo: DeviceInfo): XRFallbackType {
  const { deviceType, browserType } = deviceInfo;
  
  // iOS devices can use AR Quick Look
  if (deviceType === 'mobile' && browserType === 'safari') {
    return XRFallbackType.AR_QUICK_LOOK;
  }
  
  // Android devices can use Scene Viewer
  if (deviceType === 'mobile' && browserType === 'chrome') {
    return XRFallbackType.SCENE_VIEWER;
  }
  
  // For desktop browsers, use model-viewer (if available)
  if (deviceType === 'desktop') {
    return XRFallbackType.MODEL_VIEWER;
  }
  
  // For unsupported devices, use static image
  return XRFallbackType.STATIC_IMAGE;
}

/**
 * Comprehensive WebXR support detection
 * Checks AR/VR support and recommends the best XR mode and fallback
 */
export async function detectXRSupport(): Promise<XRSupportInfo> {
  try {
    // Get device info
    const deviceInfo = detectDeviceInfo();
    
    // Check XR support
    const arSupported = await checkARSupport();
    const vrSupported = await checkVRSupport();
    
    // Determine recommended mode
    let recommendedMode = XRMode.FALLBACK;
    if (arSupported) {
      recommendedMode = XRMode.AR;
    } else if (vrSupported) {
      recommendedMode = XRMode.VR;
    }
    
    // Determine fallback type
    const fallbackType = determineFallbackType(deviceInfo);
    
    return {
      arSupported,
      vrSupported,
      recommendedMode,
      fallbackType,
      ...deviceInfo
    };
  } catch (error) {
    console.error('Error detecting XR support:', error);
    
    // Return safe default values
    return {
      arSupported: false,
      vrSupported: false,
      recommendedMode: XRMode.FALLBACK,
      fallbackType: XRFallbackType.STATIC_IMAGE,
      deviceType: 'unknown',
      browserType: 'unknown',
      hasGyroscope: false
    };
  }
} 