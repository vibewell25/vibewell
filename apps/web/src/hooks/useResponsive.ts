import { useState, useEffect } from 'react';

export interface ResponsiveState {
  isMobile: boolean;      // True for mobile devices (screens < 768px)
  isTablet: boolean;      // True for tablet devices (screens 768px-1024px)
  isDesktop: boolean;     // True for desktop devices (screens > 1024px)
  isPortrait: boolean;    // True when device is in portrait orientation
  isLandscape: boolean;   // True when device is in landscape orientation
  isTouch: boolean;       // True when device has touch capability
  isOnline: boolean;      // True when the device is online
  hasSafeArea: boolean;   // True when device has notch or other safe area
  isStandalone: boolean;  // True when running as installed PWA
  viewportWidth: number;  // Current viewport width in pixels
  viewportHeight: number; // Current viewport height in pixels
/**
 * Hook for responsive web design that provides viewport information and device capabilities
 */
export function useResponsive(): ResponsiveState {
  // Default state, will be updated in useEffect
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isPortrait: true,
    isLandscape: false,
    isTouch: false,
    isOnline: true,
    hasSafeArea: false,
    isStandalone: false,
    viewportWidth: 1200, // Sensible default
    viewportHeight: 800,
useEffect(() => {
    // Function to update all responsive states
    const updateState = () => {
      // Get viewport dimensions
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Determine device type by width
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      
      // Determine orientation
      const isPortrait = height > width;
      const isLandscape = !isPortrait;
      
      // Check for touchscreen capability
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Check online status
      const isOnline = navigator.onLine;
      
      // Check for notch / safe areas
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const iphoneWithNotch = iOS && window.screen.height >= 812 && window.devicePixelRatio >= 2;
      const androidWithCutout = /Android/.test(navigator.userAgent) && (window as any).screen.orientation;
      const hasSafeArea = iphoneWithNotch || androidWithCutout;
      
      // Check if running as installed PWA
      const isInStandaloneMode = 'standalone' in window.navigator && (window.navigator as any).standalone === true;
      const isInPWA = window.matchMedia('(display-mode: standalone)').matches;
      const isStandalone = isInStandaloneMode || isInPWA;
      
      setState({
        isMobile,
        isTablet,
        isDesktop,
        isPortrait,
        isLandscape,
        isTouch,
        isOnline,
        hasSafeArea,
        isStandalone,
        viewportWidth: width,
        viewportHeight: height,
// Initial update
    updateState();
    
    // Set up event listeners
    window.addEventListener('resize', updateState);
    window.addEventListener('orientationchange', updateState);
    window.addEventListener('online', updateState);
    window.addEventListener('offline', updateState);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateState);
      window.removeEventListener('orientationchange', updateState);
      window.removeEventListener('online', updateState);
      window.removeEventListener('offline', updateState);
[]); // Empty dependency array means this effect runs once on mount

  return state;
/**
 * Get a CSS breakpoint value (in pixels)
 */
export function getBreakpoint(name: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'): number {
  const breakpoints = {
    xs: 320,   // Extra small devices
    sm: 640,   // Small devices
    md: 768,   // Medium devices (tablets)
    lg: 1024,  // Large devices (desktops)
    xl: 1280,  // Extra large devices
    '2xl': 1536 // 2X Extra large devices
return breakpoints[name];
/**
 * Check if the current viewport is at least the specified size
 */
export function useBreakpoint(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'): boolean {
  const { viewportWidth } = useResponsive();
  const breakpoint = getBreakpoint(size);
  
  return viewportWidth >= breakpoint;
