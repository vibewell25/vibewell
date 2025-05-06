import React, { useEffect, useState } from "react";
import { MainNavigation } from "@/components/navigation/MainNavigation";
import { useResponsive } from "@/hooks/useResponsive";

interface MobileLayoutProps {
  children: React.ReactNode;
  navigationOptions?: {
    hideOnScroll?: boolean;
    transparent?: boolean;
statusBarOptions?: {
    backgroundColor?: string;
    textColor?: "light" | "dark";
export function MobileLayout({
  children,
  navigationOptions = {
    hideOnScroll: false,
    transparent: false,
statusBarOptions = {
    backgroundColor: "#ffffff",
    textColor: "dark",
: MobileLayoutProps) {
  const { isMobile } = useResponsive();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isNavigationVisible, setIsNavigationVisible] = useState(true);

  // Handle scroll for hiding navigation
  useEffect(() => {
    if (!navigationOptions.hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const visible = scrollPosition > currentScrollPos || currentScrollPos < 10;
      
      setIsNavigationVisible(visible);
      setScrollPosition(currentScrollPos);
window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
[scrollPosition, navigationOptions.hideOnScroll]);

  // Set meta theme color for mobile devices
  useEffect(() => {
    if (!isMobile) return;

    // Update status bar color
    const backgroundColor = statusBarOptions.backgroundColor || "#ffffff";
    
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", backgroundColor);
else {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = backgroundColor;
      document.head.appendChild(meta);
[isMobile, statusBarOptions.backgroundColor]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div
        className={`transition-transform duration-300 ${
          !isNavigationVisible && "transform -translate-y-full"
`}
      >
        <MainNavigation />
      </div>
      
      {/* Safe area padding for notches and home indicators */}
      <main className="flex-1 pb-safe pt-safe px-safe">
        {/* Content */}
        <div className={`pt-${isNavigationVisible ? "16" : "0"} transition-padding duration-300`}>
          {children}
        </div>
      </main>
    </div>
