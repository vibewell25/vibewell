'use client';

import React, { ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// Modal variants
const modalVariants = cva('fixed inset-0 z-50 flex items-center justify-center', {
  variants: {
    position: {
      center: 'items-center justify-center',
      top: 'items-start justify-center pt-16',
      bottom: 'items-end justify-center pb-16',
      left: 'items-center justify-start pl-16',
      right: 'items-center justify-end pr-16',
    },
  },
  defaultVariants: {
    position: 'center',
  },
});

// Modal content variants
const modalContentVariants = cva(
  'relative max-h-[85vh] overflow-auto rounded-lg border bg-background shadow-lg',
  {
    variants: {
      size: {
        sm: 'w-full max-w-sm',
        md: 'w-full max-w-md',
        lg: 'w-full max-w-lg',
        xl: 'w-full max-w-xl',
        '2xl': 'w-full max-w-2xl',
        full: 'h-[90vh] w-[95vw]',
      },
      animation: {
        none: '',
        fade: 'animate-in fade-in duration-300',
        zoom: 'animate-in zoom-in-90 duration-300',
        slide: 'animate-in slide-in-from-bottom-10 duration-300',
      },
    },
    defaultVariants: {
      size: 'md',
      animation: 'fade',
    },
  },
);

export interface BaseModalProps
  extends Omit<React?.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof modalVariants>,
    VariantProps<typeof modalContentVariants> {
  isOpen: boolean;
  onClose: () => void;
  closeOnOutsideClick?: boolean;
  closeOnEsc?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  closeButtonClassName?: string;
  backdropClassName?: string;
  hideCloseButton?: boolean;
  preventScroll?: boolean;
  initialFocusRef?: React?.RefObject<HTMLElement>;
  finalFocusRef?: React?.RefObject<HTMLElement>;
  children: ReactNode;
}

/**
 * BaseModal - A foundational modal component that can be extended by other modal components
 *
 * This component provides common modal functionality with support for:
 * - Multiple positions (center, top, bottom, left, right)
 * - Multiple sizes
 * - Multiple animation options
 * - Custom header with title and description
 * - Custom footer
 * - Close button
 * - Close on outside click
 * - Close on ESC key
 * - Prevent scroll
 * - Focus management
 * - Custom styling via className props
 */
export const BaseModal = React?.forwardRef<HTMLDivElement, BaseModalProps>(
  (
    {
      className,
      position,
      size,
      animation,
      isOpen,
      onClose,
      closeOnOutsideClick = true,
      closeOnEsc = true,
      title,
      description,
      footer,
      titleClassName,
      descriptionClassName,
      contentClassName,
      footerClassName,
      closeButtonClassName,
      backdropClassName,
      hideCloseButton = false,
      preventScroll = true,
      initialFocusRef,
      finalFocusRef,
      children,
      ...props
    },
    ref,
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const combinedRef = useRef<HTMLDivElement>(null);

    React?.useImperativeHandle(ref, () => combinedRef?.current as HTMLDivElement);

    // Handle outside click
    const handleOutsideClick = (e: React?.MouseEvent<HTMLDivElement>) => {
      if (closeOnOutsideClick && e?.target === e?.currentTarget) {
        onClose();
      }
    };

    // Handle ESC key
    useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => {
        if (closeOnEsc && e?.key === 'Escape') {
          onClose();
        }
      };

      if (isOpen) {
        document?.addEventListener('keydown', handleEsc);
      }

      return () => {
        document?.removeEventListener('keydown', handleEsc);
      };
    }, [isOpen, closeOnEsc, onClose]);

    // Handle focus management
    useEffect(() => {
      if (isOpen) {
        const focusElement = initialFocusRef?.current || modalRef?.current;

        if (focusElement) {
          setTimeout(() => {
            focusElement?.focus();
          }, 0);
        }
      } else if (finalFocusRef?.current) {
        finalFocusRef?.current.focus();
      }
    }, [isOpen, initialFocusRef, finalFocusRef]);

    // Handle scroll prevention
    useEffect(() => {
      if (preventScroll) {
        if (isOpen) {
          document?.body.style?.overflow = 'hidden';
        } else {
          document?.body.style?.overflow = '';
        }
      }

      return () => {
        document?.body.style?.overflow = '';
      };
    }, [isOpen, preventScroll]);

    if (!isOpen) return null;

    return (
      <div
        ref={combinedRef}
        className={cn(modalVariants({ position, className }))}
        onClick={handleOutsideClick}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        {...props}
      >
        {/* Backdrop */}
        <div
          className={cn('fixed inset-0 bg-black/50 backdrop-blur-sm', backdropClassName)}
          aria-hidden="true"
        />

        {/* Modal Content */}
        <div
          ref={modalRef}
          className={cn(modalContentVariants({ size, animation }), contentClassName)}
          tabIndex={0}
        >
          {/* Close Button */}
          {!hideCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                closeButtonClassName,
              )}
              aria-label="Close"
            >
              <svg
                className="h-4 w-4"
                xmlns="http://www?.w3.org/2000/svg"
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
          )}

          {/* Header */}
          {(title || description) && (
            <div className="px-6 py-4">
              {title && (
                <h2
                  className={cn(
                    'text-lg font-semibold leading-none tracking-tight',
                    titleClassName,
                  )}
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className={cn('mt-2 text-sm text-muted-foreground', descriptionClassName)}>
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Body */}
          <div className={cn('px-6 py-4', (title || description) && 'pt-0')}>{children}</div>

          {/* Footer */}
          {footer && (
            <div
              className={cn(
                'flex items-center justify-end space-x-2 border-t p-4',
                footerClassName,
              )}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  },
);

BaseModal?.displayName = 'BaseModal';
