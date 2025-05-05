import { useState, useEffect } from 'react';
import {
  DeviceCapabilities,
  detectDeviceCapabilities,
  getDefaultCapabilities,
from '@/utils/DeviceCapability';

/**
 * Hook to use device capabilities in React components
 *
 * This hook provides access to the device capabilities information for adaptive rendering
 * and optimizing user experience based on device performance.
 *
 * @returns DeviceCapabilities object with device information
 *
 * @example
 * ```tsx
 * import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
 *
 * function AdaptiveComponent() {
 *   const { performanceLevel, isMobileDevice } = useDeviceCapabilities();
 *
 *   if (performanceLevel === 'low') {
 *     return <SimplifiedVersion />;
 *   }
 *
 *   return <FullFeaturedVersion />;
 * }
 * ```
 */
export function useDeviceCapabilities(): DeviceCapabilities {
  // Start with default capabilities (these will be shown during SSR)
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(getDefaultCapabilities());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Detect capabilities asynchronously
    const detectCapabilities = async () => {
      try {
        const detectedCapabilities = await detectDeviceCapabilities();

        // Only update state if the component is still mounted
        if (isMounted) {
          setCapabilities(detectedCapabilities);
          setIsLoading(false);
catch (error) {
        console.error('Failed to detect device capabilities:', error);
        if (isMounted) {
          setIsLoading(false);
detectCapabilities();

    // Clean up
    return () => {
      isMounted = false;
[]);

  return capabilities;
/**
 * Hook to apply adaptive rendering quality based on device capabilities
 *
 * @param options Configuration options
 * @returns Quality level and device info
 *
 * @example
 * ```tsx
 * import { useAdaptiveQuality } from '@/hooks/useDeviceCapabilities';
 *
 * function AdaptiveARView() {
 *   const { quality, isMobile } = useAdaptiveQuality({
 *     preferBattery: true,
 *     minQuality: 'low'
 *   });
 *
 *   return <ARModelViewer quality={quality} />;
 * }
 * ```
 */
interface AdaptiveQualityOptions {
  /** Prefer battery life over quality on mobile devices */
  preferBattery?: boolean;
  /** Minimum quality level to use */
  minQuality?: 'low' | 'medium' | 'high';
  /** Maximum quality level to use */
  maxQuality?: 'low' | 'medium' | 'high';
  /** Reduce quality when battery is below this level (0-1) */
  batteryThreshold?: number;
interface AdaptiveQualityResult {
  /** Recommended quality level */
  quality: 'low' | 'medium' | 'high';
  /** Whether the device is mobile */
  isMobile: boolean;
  /** Whether the device is in low battery mode */
  isLowBattery: boolean;
  /** Whether the device has limited capabilities */
  isLimitedDevice: boolean;
  /** All device capabilities */
  capabilities: DeviceCapabilities;
export function useAdaptiveQuality(options: AdaptiveQualityOptions = {}): AdaptiveQualityResult {
  const capabilities = useDeviceCapabilities();

  // Default options
  const {
    preferBattery = true,
    minQuality = 'low',
    maxQuality = 'high',
    batteryThreshold = 0.3,
= options;

  // Map performance level to quality
  const qualityFromPerformance = capabilities.performanceLevel;

  // Check if battery is low - ensure all values are properly checked to avoid undefined
  const isLowBattery = Boolean(
    preferBattery &&
      capabilities.batteryStatus &&
      capabilities.batteryStatus.charging === false &&
      capabilities.batteryStatus.level < batteryThreshold,
// Determine final quality level
  let quality: 'low' | 'medium' | 'high';

  if (isLowBattery) {
    // Prioritize battery life on low battery
    quality = 'low';
else {
    // Use performance-based quality
    quality = qualityFromPerformance;

    // Enforce min/max bounds
    const qualityLevels = ['low', 'medium', 'high'] as const;
    const minIndex = qualityLevels.indexOf(minQuality);
    const maxIndex = qualityLevels.indexOf(maxQuality);
    const currentIndex = qualityLevels.indexOf(quality);

    if (currentIndex < minIndex) {
      quality = minQuality;
else if (currentIndex > maxIndex) {
      quality = maxQuality;
return {
    quality,
    isMobile: capabilities.isMobileDevice,
    isLowBattery,
    isLimitedDevice: capabilities.isLowEndDevice || capabilities.hasLimitedMemory,
    capabilities,
