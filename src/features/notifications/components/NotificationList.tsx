import React from 'react';
import { NotificationItem } from './NotificationItem';
import type { Notification } from '../types';

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isLoading,
  error,
  onMarkAsRead,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 px-6 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600 text-sm">{error}</p>
        <button 
          className="mt-2 text-xs text-red-800 underline"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center border-2 border-dashed border-gray-200 rounded-md">
        <div className="text-center p-4">
          <p className="text-gray-500">No notifications yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Notifications for messages, bookings, and updates will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}; 