import React from 'react';
import { BellIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { getRelativeTime } from '@/utils/date-formatter';
import type { Notification } from '../types';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const { id, title, message, type, isRead, createdAt } = notification;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      case 'info':
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
      default:
        return <BellIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div 
      className={`border-b border-gray-200 p-4 ${!isRead ? 'bg-blue-50' : ''}`}
      data-testid="notification-item"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${!isRead ? 'text-blue-900' : 'text-gray-900'}`}>
              {title}
            </p>
            <p className="text-xs text-gray-500">{getRelativeTime(createdAt)}</p>
          </div>
          <p className={`mt-1 text-sm ${!isRead ? 'text-blue-700' : 'text-gray-600'}`}>
            {message}
          </p>
          <div className="mt-2 flex space-x-2">
            {!isRead && (
              <button
                type="button"
                className="text-xs text-blue-600 hover:text-blue-800"
                onClick={() => onMarkAsRead(id)}
              >
                Mark as read
              </button>
            )}
            <button
              type="button"
              className="text-xs text-red-600 hover:text-red-800"
              onClick={() => onDelete(id)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 