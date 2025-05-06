import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useResponsive } from "@/hooks/useResponsive";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
export function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isShown, setIsShown] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | "unknown">("unknown");
  const { isMobile, isTablet } = useResponsive();

  // Detect platform
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform("ios");
else if (/android/.test(userAgent)) {
      setPlatform("android");
else {
      setPlatform("desktop");
[]);

  // Check if already installed and capture install prompt
  useEffect(() => {
    // Check if app is already installed
    const isAppInstalled = window.matchMedia("(display-mode: standalone)").matches || 
                          window.matchMedia("(display-mode: fullscreen)").matches ||
                          (window.navigator as any).standalone === true;
    
    if (isAppInstalled) return;
    
    // Wait for the beforeinstallprompt event to capture the prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // On some devices, wait 5 seconds before showing the prompt 
      setTimeout(() => {
        if (!isDismissed) {
          setIsShown(true);
5000);
window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
[isDismissed]);

  // For iOS Safari, which doesn't support 'beforeinstallprompt'
  useEffect(() => {
    if (platform === "ios" && (isMobile || isTablet) && !isDismissed) {
      // Only show after user has visited at least twice
      const visitCount = parseInt(localStorage.getItem("visitCount") || "0", 10);
      localStorage.setItem("visitCount", (visitCount + 1).toString());
      
      if (visitCount >= 1) {
        setTimeout(() => {
          setIsShown(true);
3000);
[platform, isMobile, isTablet, isDismissed]);

  const handleInstall = async () => {
    if (!installPrompt) return;
    
    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
else {
        console.log("User dismissed the install prompt");
// Clear the prompt variable, as it can only be used once
      setInstallPrompt(null);
      setIsShown(false);
catch (error) {
      console.error("Error during installation:", error);
const handleDismiss = () => {
    setIsShown(false);
    setIsDismissed(true);
    localStorage.setItem("installPromptDismissed", "true");
if (!isShown) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 p-4 shadow-lg z-50 rounded-t-lg animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-4">
          <h3 className="text-lg font-semibold mb-1">Add to Home Screen</h3>
          
          {platform === "ios" ? (
            <div className="text-sm mb-3">
              <p>To install this app:</p>
              <ol className="list-decimal pl-5 mt-1 space-y-1">
                <li>Tap the share icon</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
              </ol>
            </div>
          ) : platform === "android" ? (
            <p className="text-sm mb-3">Install VibeWell for a better experience and offline access.</p>
          ) : (
            <p className="text-sm mb-3">Install our app for a better experience and quick access.</p>
          )}
        </div>
        
        <button 
          onClick={handleDismiss}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Dismiss"
        >
          <X size={20} />
        </button>
      </div>
      
      {platform !== "ios" && installPrompt && (
        <button 
          onClick={handleInstall} 
          className="w-full bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 rounded-md"
        >
          Install App
        </button>
      )}
      
      {platform === "ios" && (
        <button 
          onClick={handleDismiss} 
          className="w-full border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 rounded-md mt-2"
        >
          Got it
        </button>
      )}
    </div>
