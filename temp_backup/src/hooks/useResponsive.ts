import { useState, useEffect } from "react";

export type DeviceType = "mobile" | "tablet" | "desktop";

interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
const defaultBreakpoints: Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
export function useResponsive(customBreakpoints?: Partial<Breakpoints>) {
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });
      
      if (width < breakpoints.tablet) {
        setDeviceType("mobile");
else if (width < breakpoints.desktop) {
        setDeviceType("tablet");
else {
        setDeviceType("desktop");
// Set initial values
    handleResize();
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
[breakpoints]);

  // Utility functions for breakpoint checks
  const isMobile = deviceType === "mobile";
  const isTablet = deviceType === "tablet";
  const isDesktop = deviceType === "desktop";
  const isTouch = isMobile || isTablet;

  return {
    deviceType,
    windowSize,
    isMobile,
    isTablet, 
    isDesktop,
    isTouch,
    breakpoints,
