import React, { useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';

interface AccessibleDialogProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * AccessibleDialog - A dialog component with proper focus management
 * that follows accessibility best practices:
 * - Traps focus within the dialog when open
 * - Returns focus to the triggering element when closed
 * - Properly labels content with aria-labelledby and aria-describedby
 */
export function AccessibleDialog({
  title,
  description,
  isOpen,
  onClose,
  children,
  footer,
  className,
}: AccessibleDialogProps) {
  const initialFocusRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Store the element that had focus when dialog was opened
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Set focus to dialog when opened and return focus when closed
  useEffect(() => {
    if (isOpen) {
      initialFocusRef.current?.focus();
    } else if (triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        ref={initialFocusRef}
        tabIndex={-1}
        className={className}
        aria-labelledby="dialog-title"
        aria-describedby={description ? 'dialog-description' : undefined}
      >
        <DialogHeader>
          <DialogTitle id="dialog-title">{title}</DialogTitle>
          {description && (
            <p id="dialog-description" className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </DialogHeader>

        <div className="py-4">{children}</div>

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
