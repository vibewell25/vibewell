import { useState, useEffect } from "react";
import Image from "next/image";
import type { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">("desktop");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType("mobile");
else if (width < 1024) {
        setDeviceType("tablet");
else {
        setDeviceType("desktop");
handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
[]);

  return deviceType;
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionSpeed, setConnectionSpeed] = useState<"slow" | "medium" | "fast">("fast");

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check connection speed
    const checkConnectionSpeed = () => {
      if ("connection" in navigator && navigator.connection) {
        const connection = navigator.connection as any;
        if (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") {
          setConnectionSpeed("slow");
else if (connection.effectiveType === "3g") {
          setConnectionSpeed("medium");
else {
          setConnectionSpeed("fast");
window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    if ("connection" in navigator) {
      const connection = navigator.connection as any;
      connection.addEventListener("change", checkConnectionSpeed);
checkConnectionSpeed();
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if ("connection" in navigator) {
        const connection = navigator.connection as any;
        connection.removeEventListener("change", checkConnectionSpeed);
[]);

  return { isOnline, connectionSpeed };
export interface ResponsiveImageProps extends Omit<ImageProps, "src"> {
  src?: string;
  mobileSrc?: string;
  tabletSrc?: string;
  desktopSrc?: string;
  lowQualitySrc?: string;
  fallbackSrc?: string;
  lazyLoad?: boolean;
  loadingPriority?: "high" | "low" | "auto";
export function ResponsiveImage({
  src,
  mobileSrc,
  tabletSrc,
  desktopSrc,
  lowQualitySrc,
  fallbackSrc = "/images/fallback.png",
  lazyLoad = true,
  loadingPriority = "auto",
  alt,
  className,
  ...props
: ResponsiveImageProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(lowQualitySrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const deviceType = useDeviceType();
  const { isOnline, connectionSpeed } = useNetworkStatus();

  // Determine loading priority
  let loading: "eager" | "lazy" = lazyLoad ? "lazy" : "eager";
  if (loadingPriority === "high") {
    loading = "eager";
else if (loadingPriority === "low") {
    loading = "lazy";
useEffect(() => {
    // If offline, use the fallback
    if (!isOnline) {
      setImgSrc(fallbackSrc);
      return;
// Select the best image source based on device and connection
    let bestSrc = src;
    
    // Device-specific sources if available
    if (deviceType === "mobile" && mobileSrc) {
      bestSrc = mobileSrc;
else if (deviceType === "tablet" && tabletSrc) {
      bestSrc = tabletSrc;
else if (deviceType === "desktop" && desktopSrc) {
      bestSrc = desktopSrc;
// If we have a low quality source and slow connection, use it
    if (connectionSpeed === "slow" && lowQualitySrc) {
      bestSrc = lowQualitySrc;
// If no source is available, use the fallback
    setImgSrc(bestSrc || fallbackSrc);
[
    src, mobileSrc, tabletSrc, desktopSrc, lowQualitySrc, fallbackSrc,
    deviceType, isOnline, connectionSpeed
  ]);

  const handleLoad = () => {
    setIsLoaded(true);
const handleError = () => {
    setHasError(true);
    setImgSrc(fallbackSrc);
return (
    <div className={cn("relative", className)}>
      {lowQualitySrc && !isLoaded && !hasError && (
        <Image
          src={lowQualitySrc}
          alt={alt}
          className="absolute inset-0 blur-sm transition-opacity"
          style={{ opacity: isLoaded ? 0 : 1 }}
          {...props}
        />
      )}
      {imgSrc && (
        <Image
          src={imgSrc}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={cn("transition-opacity", isLoaded ? "opacity-100" : "opacity-0")}
          {...props}
        />
      )}
    </div>
