import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiArrowRight, FiWifi, FiClock, FiHome } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
export const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [installationStatus, setInstallationStatus] = useState<'none' | 'pending' | 'installed' | 'dismissed'>('none');

  // Detect platform and listen for install prompt
  useEffect(() => {
    // Check if iOS device
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Detect if already installed as PWA
    const isInStandaloneMode = 'standalone' in window.navigator && (window.navigator as any).standalone === true;
    const isInPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isInStandaloneMode || isInPWA) {
      // Already installed, don't show the prompt
      return;
// Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if user has recently dismissed prompt
      const lastDismissed = localStorage.getItem('pwaPromptDismissed');
      if (lastDismissed) {
        const dismissedTime = parseInt(lastDismissed, 10);
        const now = Date.now();
        
        // Show again only after 3 days (259200000 ms)
        if (now - dismissedTime < 259200000) {
          return;
// Don't show immediately - show after 30s of user engagement
      setTimeout(() => {
        setShowPrompt(true);
30000);
window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
[]);

  // Function to install the PWA
  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
// Show the install prompt
    setInstallationStatus('pending');
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setInstallationStatus('installed');
else {
      console.log('User dismissed the install prompt');
      setInstallationStatus('dismissed');
// Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);
// Function to dismiss the prompt
  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwaPromptDismissed', Date.now().toString());
// Don't show anything if no prompt or on iOS (handled differently)
  if (!showPrompt) {
    return null;
return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe-bottom"
      >
        <div className="mx-auto max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
          {/* iOS specific install instructions */}
          {isIOS ? (
            <div className="p-5">
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-lg font-bold">Install VibeWell App</h3>
                <button 
                  onClick={handleDismiss}
                  className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
                  aria-label="Close"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <p className="mb-4 text-sm text-gray-600">
                Install VibeWell on your home screen for quick access to bookings, even when you're offline.
              </p>
              
              <div className="mb-4 rounded-lg bg-gray-100 p-4 text-sm">
                <p className="mb-2 font-medium">How to install:</p>
                <ol className="space-y-2 pl-5 text-gray-600">
                  <li>Tap the Share button <span className="rounded bg-gray-200 px-1.5 py-0.5">􀈂</span> at the bottom of your browser</li>
                  <li>Scroll down and tap <span className="font-medium">"Add to Home Screen"</span></li>
                  <li>Tap <span className="font-medium">"Add"</span> in the top right</li>
                </ol>
              </div>
              
              <Button
                variant="outline"
                size="mobile"
                onClick={handleDismiss}
                className="w-full"
              >
                I'll do it later
              </Button>
            </div>
          ) : (
            // Android and other platforms
            <div className="p-5">
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-lg font-bold">Add to Home Screen</h3>
                <button 
                  onClick={handleDismiss}
                  className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
                  aria-label="Close"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <p className="mb-4 text-sm text-gray-600">
                Install VibeWell for a better experience with fast loading and offline access to your bookings.
              </p>
              
              <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="flex flex-col items-center rounded-lg p-2">
                  <FiWifi className="mb-1 h-6 w-6 text-blue-500" />
                  <span>Works Offline</span>
                </div>
                <div className="flex flex-col items-center rounded-lg p-2">
                  <FiClock className="mb-1 h-6 w-6 text-blue-500" />
                  <span>Faster Access</span>
                </div>
                <div className="flex flex-col items-center rounded-lg p-2">
                  <FiHome className="mb-1 h-6 w-6 text-blue-500" />
                  <span>Home Screen</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="mobile"
                  onClick={handleDismiss}
                  className="flex-1"
                >
                  Not Now
                </Button>
                <Button
                  variant="primary"
                  size="mobile"
                  onClick={handleInstall}
                  className="flex-1"
                  isLoading={installationStatus === 'pending'}
                >
                  {installationStatus !== 'pending' && (
                    <>
                      <FiDownload className="mr-2 h-5 w-5" />
                      Install
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
