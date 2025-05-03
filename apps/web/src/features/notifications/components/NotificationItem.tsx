import React from 'react';
import { getRelativeTime } from '@/utils/date-formatter';
import type { Notification } from '../types';
import { Icons } from '@/components/icons';
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}
export {};
