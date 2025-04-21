import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BellIcon, 
  CheckCheckIcon, 
  Loader2Icon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon
} from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate?: ((url: string) => void) | undefined;
}

const NotificationItem = ({ notification, onRead, onDelete, onNavigate }: NotificationItemProps) => {
  const router = useRouter();
  
  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
    
    if (notification.linkUrl) {
      if (onNavigate) {
        onNavigate(notification.linkUrl);
      } else {
        router.push(notification.linkUrl);
      }
    }
  };
  
  // Function to get icon based on notification type
  const getTypeIcon = () => {
    switch (notification.type) {
      case 'BOOKING':
        return (
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
        );
      case 'LOYALTY':
        return (
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
        );
      case 'MARKETING':
        return (
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 12H16c-.7 0-1.4.5-1.5 1.2l-1 7.8"></path>
              <path d="M11.3 8.8L8.9 5.3C8.4 4.5 7.4 4.1 6.5 4.3L3.9 5c-1.7.4-2.7 2.3-2.3 4l3.2 12.5c.4 1.7 2.3 2.7 4 2.3l2.6-.7c.9-.2 1.6-1 1.7-1.9l.8-6.7c.1-.7-.2-1.5-.7-1.9l-1.9-1.8z"></path>
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
        );
    }
  };

  return (
    <div 
      className={cn(
        "flex gap-3 p-3 rounded-md transition-colors cursor-pointer",
        notification.read 
          ? "bg-white hover:bg-gray-50" 
          : "bg-blue-50 hover:bg-blue-100"
      )}
      onClick={handleClick}
    >
      {getTypeIcon()}
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4 className={cn(
            "text-sm font-medium line-clamp-1",
            !notification.read && "font-semibold"
          )}>
            {notification.title}
          </h4>
          <div className="flex items-center">
            {notification.linkUrl && (
              <ExternalLinkIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mr-1" />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-red-500 focus:ring-0"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
            >
              <TrashIcon className="h-3.5 w-3.5" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {notification.message}
        </p>
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 py-0 text-xs text-gray-500 hover:text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                onRead(notification.id);
              }}
            >
              Mark as read
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

interface NotificationCenterProps {
  onNavigate?: (url: string) => void;
}

export function NotificationCenter({ onNavigate }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  const {
    notifications,
    pagination,
    counts,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    goToNextPage,
    goToPrevPage,
    refresh,
  } = useNotifications({
    filter: activeTab === "all" ? "all" : activeTab === "unread" ? "unread" : "read",
    pageSize: 5
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {counts.unread > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center px-1 text-xs"
            >
              {counts.unread > 99 ? "99+" : counts.unread}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-[360px] p-0"
        sideOffset={5}
      >
        <div className="flex justify-between items-center p-3 border-b">
          <h3 className="font-medium">Notifications</h3>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => refresh()}
              className="h-8 px-2"
            >
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="h-8 px-2"
              disabled={counts.unread === 0}
            >
              <CheckCheckIcon className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
          <div className="border-b px-1.5">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="all" className="text-xs">
                All ({counts.total})
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Unread ({counts.unread})
              </TabsTrigger>
              <TabsTrigger value="read" className="text-xs">
                Read ({counts.total - counts.unread})
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="m-0">
            <NotificationList 
              notifications={notifications}
              isLoading={isLoading}
              onRead={markAsRead}
              onDelete={deleteNotification}
              onNavigate={onNavigate}
            />
          </TabsContent>
          
          <TabsContent value="unread" className="m-0">
            <NotificationList 
              notifications={notifications}
              isLoading={isLoading}
              onRead={markAsRead}
              onDelete={deleteNotification}
              onNavigate={onNavigate}
            />
          </TabsContent>
          
          <TabsContent value="read" className="m-0">
            <NotificationList 
              notifications={notifications}
              isLoading={isLoading}
              onRead={markAsRead}
              onDelete={deleteNotification}
              onNavigate={onNavigate}
            />
          </TabsContent>
        </Tabs>
        
        {pagination && (
          <div className="flex justify-between items-center p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevPage}
              disabled={!pagination.hasPrevPage}
              className="h-8 px-2"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <span className="text-xs text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextPage}
              disabled={!pagination.hasNextPage}
              className="h-8 px-2"
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate?: ((url: string) => void) | undefined;
}

const NotificationList = ({ 
  notifications, 
  isLoading, 
  onRead, 
  onDelete,
  onNavigate
}: NotificationListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2Icon className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <BellIcon className="h-10 w-10 text-gray-300 mb-2" />
        <p className="text-gray-500 text-sm">No notifications to display</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[320px]">
      <div className="flex flex-col divide-y">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRead={onRead}
            onDelete={onDelete}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default NotificationCenter; 