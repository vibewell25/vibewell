import { X } from 'lucide-react';
import React from 'react';
import { BaseModal, type BaseModalProps } from '@/components/ui/base-modal';
import { cn } from '@/lib/utils';

interface ModalProps extends Omit<BaseModalProps, 'position' | 'variant'> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  ...props
}) => {
  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      position="center"
      variant="default"
      className={cn('sm:max-w-lg', className)}
      {...props}
    >
      <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
        <button
          type="button"
          className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          <X className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      {title && (
        <div className="sm:flex sm:items-start">
          <div className="mt-3 text-center sm:mt-0 sm:text-left">
            <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
              {title}
            </h3>
          </div>
        </div>
      )}
      <div className="mt-5">{children}</div>
    </BaseModal>
  );
};
