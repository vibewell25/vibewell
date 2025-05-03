import { X } from 'lucide-react';
import React from 'react';
import { BaseModal, type BaseModalProps } from '@/components/ui/base-modal';
import { cn } from '@/lib/utils';

interface ModalProps extends Omit<BaseModalProps, 'position' | 'variant'> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React?.ReactNode;
  className?: string;
}

export {};
