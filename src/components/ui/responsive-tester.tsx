import React, { useState, useEffect } from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';

interface ResponsiveTesterProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showDeviceInfo?: boolean;
  showBreakpoints?: boolean;
  showDimensions?: boolean;
  showTouchInfo?: boolean;
  onlyInDevelopment?: boolean;
  className?: string;
}

/**
 * ResponsiveTester - A development tool to help visualize responsive design
 * 
 * This component provides a floating panel with useful information about
 * the current viewport, device type, and responsive breakpoints.
 * 
 * It should be used only during development and disabled in production.
 */
export function ResponsiveTester({
  enabled = true,
  position = 'bottom-right',
  showDeviceInfo = true,
  showBreakpoints = true,
  showDimensions = true,
  showTouchInfo = true,
  onlyInDevelopment = true,
  className
}: ResponsiveTesterProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [touchEvents, setTouchEvents] = useState<string[]>([]);
  const { 
    deviceType, 
    dimensions, 
    isTouch, 
    isMobile, 
    isTablet, 
    isDesktop, 
    breakpoints 
  } = useResponsive();

  // Check if we should show based on environment
  useEffect(() => {
    if (onlyInDevelopment) {
      // Only show in development, not in production
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (!isDevelopment) {
        return;
      }
    }
    
    setIsVisible(enabled);
  }, [enabled, onlyInDevelopment]);

  // Don't render anything if not visible
  if (!isVisible) {
    return null;
  }

  // Position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  // Add touch event listener
  useEffect(() => {
    if (!showTouchInfo || !isVisible) return;

    const handleTouchEvent = (e: TouchEvent) => {
      const newEvent = `${e.type}: ${e.touches.length} touch(es)`;
      setTouchEvents(prev => {
        const updated = [newEvent, ...prev];
        // Keep only the last 5 events
        return updated.slice(0, 5);
      });
    };

    document.addEventListener('touchstart', handleTouchEvent);
    document.addEventListener('touchmove', handleTouchEvent);
    document.addEventListener('touchend', handleTouchEvent);

    return () => {
      document.removeEventListener('touchstart', handleTouchEvent);
      document.removeEventListener('touchmove', handleTouchEvent);
      document.removeEventListener('touchend', handleTouchEvent);
    };
  }, [showTouchInfo, isVisible]);

  // Find active breakpoint
  const getActiveBreakpoint = () => {
    const width = dimensions.width;
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  };

  const activeBreakpoint = getActiveBreakpoint();

  return (
    <div 
      className={cn(
        'fixed z-[9999] bg-gray-900/90 text-white rounded-lg overflow-hidden shadow-lg',
        'backdrop-blur-lg border border-gray-700 transition-opacity duration-300',
        isPinned ? 'opacity-95' : 'opacity-70 hover:opacity-95',
        positionClasses[position],
        className
      )}
      style={{ 
        maxWidth: '300px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}
    >
      <div className="p-3 flex justify-between items-center border-b border-gray-700">
        <span className="font-bold">Responsive Tester</span>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsPinned(!isPinned)}
            className={cn(
              'p-1 rounded hover:bg-gray-700',
              isPinned ? 'text-yellow-400' : 'text-gray-400'
            )}
            title={isPinned ? 'Unpin' : 'Pin'}
          >
            {isPinned ? '📌' : '📍'}
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="p-3 space-y-3 max-h-[40vh] overflow-y-auto">
        {showDimensions && (
          <div className="space-y-1">
            <div className="font-bold border-b border-gray-700 pb-1">Dimensions</div>
            <div>Width: {dimensions.width}px</div>
            <div>Height: {dimensions.height}px</div>
          </div>
        )}
        
        {showDeviceInfo && (
          <div className="space-y-1">
            <div className="font-bold border-b border-gray-700 pb-1">Device</div>
            <div>Type: {deviceType}</div>
            <div>Touch: {isTouch ? 'Yes' : 'No'}</div>
            <div>
              <span className={isMobile ? 'text-green-400' : ''}>Mobile</span> | 
              <span className={isTablet ? 'text-green-400' : ''}> Tablet</span> | 
              <span className={isDesktop ? 'text-green-400' : ''}> Desktop</span>
            </div>
          </div>
        )}
        
        {showBreakpoints && (
          <div className="space-y-1">
            <div className="font-bold border-b border-gray-700 pb-1">Breakpoints</div>
            <div className="grid grid-cols-6 gap-1">
              {Object.entries(breakpoints).map(([key, value]) => (
                <div 
                  key={key}
                  className={cn(
                    'text-center py-1 px-2 rounded',
                    key === activeBreakpoint 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800'
                  )}
                  title={`${key}: ${value}px`}
                >
                  {key}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {showTouchInfo && isTouch && (
          <div className="space-y-1">
            <div className="font-bold border-b border-gray-700 pb-1">Touch Events</div>
            {touchEvents.length > 0 ? (
              <div className="space-y-1">
                {touchEvents.map((event, index) => (
                  <div key={index} className="text-xs">{event}</div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400">No touch events yet</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 