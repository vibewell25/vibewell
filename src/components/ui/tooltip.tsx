'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({
  children,
  content,
  position = 'top',
  delay = 300
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const childRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!childRef.current || !tooltipRef.current) return;

    const childRect = childRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    // Calculate position based on direction
    let top = 0;
    let left = 0;
    
    switch (position) {
      case 'top':
        top = childRect.top - tooltipRect.height - 8;
        left = childRect.left + (childRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = childRect.bottom + 8;
        left = childRect.left + (childRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = childRect.top + (childRect.height / 2) - (tooltipRect.height / 2);
        left = childRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = childRect.top + (childRect.height / 2) - (tooltipRect.height / 2);
        left = childRect.right + 8;
        break;
    }
    
    // Adjust for scroll position
    top += window.scrollY;
    left += window.scrollX;
    
    // Set coordinates
    setCoords({ top, left });
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={childRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            zIndex: 50,
          }}
          className="px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded pointer-events-none transition-opacity"
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45 ${
              position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
              position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
              position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
              'left-[-4px] top-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </>
  );
} 