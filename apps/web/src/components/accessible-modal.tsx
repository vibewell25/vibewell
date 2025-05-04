import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  closeOnOverlayClick = true,
  closeOnEsc = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the element that had focus when modal was opened
      lastFocusedElement.current = document.activeElement as HTMLElement;

      // Focus the modal when it opens
      modalRef.current.focus();

      // Add event listener for Escape key
      if (closeOnEsc) {
        const handleEsc = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            onClose();
          }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
      }
    } else if (lastFocusedElement.current) {
      // Return focus to the element that had focus before modal opened
      lastFocusedElement.current.focus();
    }
  }, [isOpen, onClose, closeOnEsc]);

  useEffect(() => {
    // Prevent scrolling of the body when modal is open
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

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="fixed inset-0 bg-black bg-opacity-50" />

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all ${className} `}
        >
          <div className="flex items-center justify-between">
            <h2 id="modal-title" className="text-lg font-medium text-gray-900">
              {title}
            </h2>
            <button
              type="button"
              className="focus:ring-primary rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2"
              onClick={onClose}
              aria-label="Close modal"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AccessibleModal;
