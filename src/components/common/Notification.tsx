import { Icons } from '@/components/icons';
import React from 'react';
interface NotificationProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}
export {};
