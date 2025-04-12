import { Icons } from '@/components/icons';
import React, { useState, useEffect } from 'react';
interface NotificationButtonProps {
  onOpen: () => void;
}
export const NotificationButton: React.FC<NotificationButtonProps> = ({ onOpen }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications/unread-count');
        if (!response.ok) {
          throw new Error('Failed to fetch unread count');
        }
        const data = await response.json();
        setUnreadCount(data.count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
    fetchUnreadCount();
    // Set up polling for real-time updates
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);
  return (
    <button
      onClick={onOpen}
      className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      aria-label="Notifications"
    >
      <Icons.BellIcon className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
          {unreadCount}
        </span>
      )}
    </button>
  );
}; 