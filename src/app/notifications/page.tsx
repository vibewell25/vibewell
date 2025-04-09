'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { 
  BellIcon, 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  UserPlusIcon, 
  CheckIcon,
  ArchiveBoxIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useNotifications, NotificationType } from '@/contexts/NotificationContext';

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications 
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<NotificationType | 'all'>('all');
  
  if (loading) {
    return (
      <Layout>
        <div className="container-app py-12 flex justify-center items-center h-[60vh]">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container-app py-12 flex flex-col justify-center items-center h-[60vh]">
          <h1 className="text-2xl font-bold mb-4">Sign in to view your notifications</h1>
          <p className="text-muted-foreground mb-6">You need to be logged in to access notifications.</p>
          <a href="/auth/signin" className="btn-primary">Sign In</a>
        </div>
      </Layout>
    );
  }

  // Filter notifications based on active filter
  const filteredNotifications = activeFilter === 'all' 
    ? notifications 
    : notifications.filter(notif => notif.type === activeFilter);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffMins < 1440) { // Less than a day
      const hours = Math.floor(diffMins / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffMins < 10080) { // Less than a week
      const days = Math.floor(diffMins / 1440);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return <HeartIcon className="h-5 w-5 text-secondary" />;
      case 'comment':
        return <ChatBubbleLeftIcon className="h-5 w-5 text-primary" />;
      case 'follow':
        return <UserPlusIcon className="h-5 w-5 text-accent" />;
      case 'message':
        return <ChatBubbleLeftIcon className="h-5 w-5 text-green-500" />;
      case 'system':
        return <BellIcon className="h-5 w-5 text-muted-foreground" />;
      default:
        return <BellIcon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Layout>
      <div className="container-app py-12">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with your activity
            </p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm ${
                unreadCount === 0 
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              <CheckIcon className="h-4 w-4" />
              <span>Mark all as read</span>
            </button>
            <button 
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm ${
                notifications.length === 0 
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
              }`}
            >
              <ArchiveBoxIcon className="h-4 w-4" />
              <span>Clear all</span>
            </button>
          </div>
        </div>

        {/* Notification filters */}
        <div className="flex flex-wrap space-x-2 mb-6">
          {['all', 'like', 'comment', 'follow', 'message', 'system'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter as NotificationType | 'all')}
              className={`px-3 py-1.5 rounded-md text-sm mb-2 ${
                activeFilter === filter 
                  ? 'bg-primary text-white' 
                  : 'bg-muted hover:bg-muted-foreground/10'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              {filter === 'all' && notifications.length > 0 && (
                <span className="ml-1.5 bg-secondary text-white text-xs rounded-full px-1.5 py-0.5">
                  {notifications.length}
                </span>
              )}
              {filter === 'all' && unreadCount > 0 && (
                <span className="ml-1.5 bg-primary-dark text-white text-xs rounded-full px-1.5 py-0.5">
                  {unreadCount} new
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        <div className="bg-card rounded-lg border border-border shadow-sm">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <BellIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No notifications</h2>
              <p className="text-muted-foreground max-w-md">
                {activeFilter === 'all' 
                  ? "You don't have any notifications yet. Check back later!" 
                  : `You don't have any ${activeFilter} notifications.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 md:p-5 flex items-start hover:bg-muted/50 transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="mr-4 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap justify-between mb-1">
                      <div className="flex items-center space-x-1">
                        {notification.from && (
                          <span className="font-medium">{notification.from.name}</span>
                        )}
                        <span className={`${notification.from ? 'text-muted-foreground' : 'font-medium'}`}>
                          {notification.message}
                        </span>
                        {!notification.read && (
                          <span className="h-2 w-2 bg-primary rounded-full"></span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-2">
                      {notification.actionUrl && (
                        <a 
                          href={notification.actionUrl} 
                          className="text-sm text-primary hover:underline"
                          onClick={() => markAsRead(notification.id)}
                        >
                          View
                        </a>
                      )}
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          Mark as read
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.id)}
                        className="text-sm text-muted-foreground hover:text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => deleteNotification(notification.id)}
                    className="text-muted-foreground hover:text-red-500 p-1"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 