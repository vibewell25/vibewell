'use client';

import React, { useEffect } from 'react';
import { useFocusTrap, useFocusOnMount, useKeyboardInteraction } from './accessibility-utils';
import { LiveRegion } from './accessibility-utils';

interface AccessibleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  description?: string;
}

export function AccessibleDialog({
  isOpen,
  onClose,
  title,
  children,
  description,
}: AccessibleDialogProps) {
  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen);
  const titleRef = useFocusOnMount<HTMLHeadingElement>(isOpen);

  useKeyboardInteraction(undefined, onClose, undefined);

  // Prevent scrolling when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} role="presentation" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? 'dialog-description' : undefined}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 p-6 w-full max-w-md"
      >
        {/* Title */}
        <h2 id="dialog-title" ref={titleRef} className="text-xl font-semibold mb-2">
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p id="dialog-description" className="text-gray-600 mb-4">
            {description}
          </p>
        )}

        {/* Content */}
        <div className="mb-4">{children}</div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close dialog"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Announce dialog opening to screen readers */}
      <LiveRegion politeness="assertive">{isOpen && `Dialog opened: ${title}`}</LiveRegion>
    </>
  );
}
