import { useState, useEffect } from 'react';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useErrorBoundary } from 'react-error-boundary';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const NotificationIndicator = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showBoundary } = useErrorBoundary();

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications/unread-count');
      if (!response.ok) {
        throw new Error(`Failed to fetch unread count: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      toast.error('Could not fetch notifications count');
      return 0;
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications?limit=5');
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
      // Use the error boundary for critical errors
      if (error instanceof Error && error.message.includes('500')) {
        showBoundary(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecentNotifications();
    }
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to mark notification as read: ${response.status} ${response.statusText}`
        );
      }

      setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, read: true } : n)));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Icons.BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <button
                onClick={() => router.push('/notifications')}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                View all
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No new notifications</p>
            ) : (
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg ${!notification.read ? 'bg-blue-50' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="ml-2 text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
