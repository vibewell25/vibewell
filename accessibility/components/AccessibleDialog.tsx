'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface AccessibleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  initialFocusRef?: React.RefObject<HTMLElement>;
}

export const AccessibleDialog: React.FC<AccessibleDialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  initialFocusRef
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the last focused element
      lastFocusedElement.current = document.activeElement as HTMLElement;
      
      // Focus the dialog
      if (initialFocusRef.current) {
        initialFocusRef.current.focus();
      } else if (dialogRef.current) {
        dialogRef.current.focus();
      }

      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    } else if (lastFocusedElement.current) {
      // Restore focus to the last focused element
      lastFocusedElement.current.focus();
    }
  }, [isOpen, onClose, initialFocusRef]);

  useEffect(() => {
    if (isOpen) {
      // Trap focus within the dialog
      const handleFocus = (e: FocusEvent) => {
        if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
          e.preventDefault();
          if (initialFocusRef.current) {
            initialFocusRef.current.focus();
          } else if (dialogRef.current) {
            dialogRef.current.focus();
          }
        }
      };

      document.addEventListener('focus', handleFocus, true);
      return () => document.removeEventListener('focus', handleFocus, true);
    }
  }, [isOpen, initialFocusRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
          <h2 id="dialog-title" className="text-xl font-semibold mb-4">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AccessibleDialog;
