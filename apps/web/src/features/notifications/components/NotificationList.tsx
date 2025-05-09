import React from 'react';
import { NotificationItem } from './notification-item';
import type { Notification } from '../types';

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
export {};
