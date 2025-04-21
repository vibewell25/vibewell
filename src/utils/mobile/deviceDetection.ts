/**
 * Device detection utilities for mobile optimization
 */
import { DevicePerformanceProfile } from './types';

/**
 * Check if the current device is mobile
 * @returns {boolean} - True if the device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Detect the performance profile of the current device
 * @returns {DevicePerformanceProfile} - Device performance profile
 */
export function detectDevicePerformanceProfile(): DevicePerformanceProfile {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      type: 'high',
      hasLowMemory: false,
      hasTouchScreen: false,
      hasSlowCPU: false,
      hasSlowNetwork: false,
    };
  }

  // Check hardware concurrency
  const hasSlowCPU = !navigator.hardwareConcurrency || navigator.hardwareConcurrency <= 4;

  // Detect memory constraints
  const hasLowMemory = 'deviceMemory' in navigator && (navigator as any).deviceMemory < 4;

  // Detect touch screen
  const hasTouchScreen = 'maxTouchPoints' in navigator && navigator.maxTouchPoints > 0;

  // Detect network speed (if available)
  const hasSlowNetwork =
    'connection' in navigator &&
    ((navigator as any).connection?.effectiveType === '2g' ||
      (navigator as any).connection?.effectiveType === '3g' ||
      (navigator as any).connection?.downlink < 1);

  // Check battery status if available
  let batteryStatus: DevicePerformanceProfile['batteryStatus'] = undefined;

  if ('getBattery' in navigator) {
    (navigator as any)
      .getBattery()
      .then((battery: any) => {
        batteryStatus = {
          level: battery.level,
          charging: battery.charging,
        };
      })
      .catch(() => {
        // Battery API access failed, ignore
      });
  }

  // Determine device type based on signals
  let type: 'low' | 'medium' | 'high' = 'high';

  const signals = [
    hasSlowCPU,
    hasLowMemory,
    hasSlowNetwork,
    // Legacy mobile detection
    /Android (5|6|7)\./i.test(navigator.userAgent),
    /iPhone OS ([7-9]|10)_|iPad.*OS ([7-9]|10)_/i.test(navigator.userAgent),
  ];

  const lowEndSignals = signals.filter(Boolean).length;

  if (lowEndSignals >= 3) {
    type = 'low';
  } else if (lowEndSignals >= 1) {
    type = 'medium';
  }

  return {
    type,
    hasLowMemory,
    hasTouchScreen,
    hasSlowCPU,
    hasSlowNetwork,
    batteryStatus,
  };
}

/**
 * Apply device-specific CSS classes to the document body
 */
export function applyDeviceClasses(): void {
  if (typeof document === 'undefined') return;

  const deviceProfile = detectDevicePerformanceProfile();

  // Add device profile class to body for CSS optimizations
  document.body.classList.add(`device-${deviceProfile.type}`);
  if (deviceProfile.hasTouchScreen) {
    document.body.classList.add('touch-device');
  }
  if (isMobileDevice()) {
    document.body.classList.add('mobile-device');
  }
}
