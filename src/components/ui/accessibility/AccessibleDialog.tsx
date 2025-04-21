import React, { useRef, useEffect, useState, forwardRef, ForwardRefRenderFunction, useCallback } from 'react';
import { createPortal } from 'react-dom';
import FocusLock from 'react-focus-lock';
import { RemoveScroll } from 'react-remove-scroll';
import { Announce } from './LiveAnnouncer';
import { cn } from '@/lib/utils';

export interface AccessibleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  initialFocusRef?: React.RefObject<HTMLElement>;
  returnFocusRef?: React.RefObject<HTMLElement>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnEsc?: boolean;
  closeOnOverlayClick?: boolean;
  preventScroll?: boolean;
  hideCloseButton?: boolean;
}

/**
 * AccessibleDialog component provides a fully accessible modal dialog
 * with proper focus management, keyboard interactions, and screenreader support.
 */
const AccessibleDialogComponent: ForwardRefRenderFunction<HTMLDivElement, AccessibleDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  contentClassName,
  initialFocusRef,
  returnFocusRef,
  size = 'md',
  closeOnEsc = true,
  closeOnOverlayClick = true,
  preventScroll = true,
  hideCloseButton = false,
}, forwardedRef) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Combine the forwarded ref with our local ref
  const combinedRef = useCallback((node: HTMLDivElement) => {
    dialogRef.current = node;
    
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  }, [forwardedRef]);
  
  // Handle ESC key press
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && closeOnEsc) {
      onClose();
    }
  }, [closeOnEsc, onClose]);
  
  // Handle overlay click
  const handleOverlayClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);
  
  // Store the previously focused element when dialog opens
  useEffect(() => {
    if (isOpen && !isMounted) {
      previousActiveElement.current = document.activeElement;
      setIsMounted(true);
    } else if (!isOpen && isMounted) {
      setIsMounted(false);
    }
  }, [isOpen, isMounted]);
  
  // Add event listener for Escape key
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);
  
  // Return focus to the element that had focus before the dialog was opened
  useEffect(() => {
    return () => {
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      } else if (returnFocusRef?.current) {
        returnFocusRef.current.focus();
      }
    };
  }, [returnFocusRef]);
  
  // Only render when dialog is open
  if (!isOpen || typeof window === 'undefined') {
    return null;
  }
  
  // Size class mapping
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };
  
  // Render the dialog using a portal
  return createPortal(
    <Announce message={`Dialog opened: ${title}`}>
      <RemoveScroll enabled={preventScroll} allowPinchZoom>
        <div
          role="presentation"
          aria-hidden="true"
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm',
            className
          )}
          onClick={handleOverlayClick}
        >
          <FocusLock returnFocus={!!returnFocusRef} autoFocus={!initialFocusRef}>
            <div
              ref={combinedRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="dialog-title"
              aria-describedby={description ? "dialog-description" : undefined}
              tabIndex={-1}
              className={cn(
                'relative w-full rounded-lg bg-background shadow-lg focus:outline-none',
                sizeClasses[size],
                contentClassName
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dialog header */}
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div>
                  <h2 id="dialog-title" className="text-lg font-medium">
                    {title}
                  </h2>
                  {description && (
                    <p id="dialog-description" className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
                
                {!hideCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="rounded-full p-2 text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      aria-hidden="true"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Dialog content */}
              <div className="px-6 py-4">
                {children}
              </div>
            </div>
          </FocusLock>
        </div>
      </RemoveScroll>
    </Announce>,
    document.body
  );
};

export const AccessibleDialog = forwardRef(AccessibleDialogComponent);

export default AccessibleDialog; 