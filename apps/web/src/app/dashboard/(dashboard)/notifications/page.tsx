import React, { useState } from 'react';
import { useNotifications, NotificationType, Notification } from '@/hooks/use-notifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  BellIcon,
  CheckCheckIcon,
  Loader2Icon,
  TrashIcon,
  RefreshCwIcon,
  ExternalLinkIcon,
  MailOpenIcon,
from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import PaginationArrow from '@/components/ui/pagination-arrows';
import { toast } from 'react-hot-toast';
import DashboardHeader from '@/components/DashboardHeader';

export interface NotificationTypeConfig {
  label: string;
  icon: React.ReactNode;
  bgClass: string;
  textClass: string;
const notificationTypeConfig: Record<NotificationType, NotificationTypeConfig> = {
  SYSTEM: {
    label: 'System',
    icon: <BellIcon className="h-5 w-5" />,
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-600',
BOOKING: {
    label: 'Booking',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    ),
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-600',
LOYALTY: {
    label: 'Loyalty',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    ),
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-600',
MARKETING: {
    label: 'Marketing',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21.5 12H16c-.7 0-1.4.5-1.5 1.2l-1 7.8"></path>
        <path d="M11.3 8.8L8.9 5.3C8.4 4.5 7.4 4.1 6.5 4.3L3.9 5c-1.7.4-2.7 2.3-2.3 4l3.2 12.5c.4 1.7 2.3 2.7 4 2.3l2.6-.7c.9-.2 1.6-1 1.7-1.9l.8-6.7c.1-.7-.2-1.5-.7-1.9l-1.9-1.8z"></path>
      </svg>
    ),
    bgClass: 'bg-green-100',
    textClass: 'text-green-600',
export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const pageSize = 10;
  const router = useRouter();

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
    page,
= useNotifications({
    filter: activeTab === 'all' ? 'all' : activeTab === 'unread' ? 'unread' : 'read',
    pageSize,
const handleTabChange = (value: string) => {
    setActiveTab(value);
const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
if (notification.linkUrl) {
      router.push(notification.linkUrl);
const handleMarkAllRead = () => {
    markAllAsRead();
    toast.success('All notifications marked as read');
return (
    <>
      <DashboardHeader
        heading="Notifications"
        text="Manage your notifications and stay updated with important information."
      >
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={counts.unread === 0}
          >
            <CheckCheckIcon className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
        </div>
      </DashboardHeader>

      <div className="p-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Your Notifications</CardTitle>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Unread: {counts.unread}</span>
                <Separator orientation="vertical" className="h-4" />
                <span>Total: {counts.total}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
              <div className="mb-6 border-b">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="all" className="px-4">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="px-4">
                    Unread
                  </TabsTrigger>
                  <TabsTrigger value="read" className="px-4">
                    Read
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2Icon className="text-primary h-8 w-8 animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <BellIcon className="mb-4 h-16 w-16 text-muted-foreground/30" />
                    <h3 className="text-lg font-medium">No notifications</h3>
                    <p className="mt-1 text-muted-foreground">
                      {activeTab === 'all'
                        ? "You don't have any notifications yet"
                        : activeTab === 'unread'
                          ? "You don't have any unread notifications"
                          : "You don't have any read notifications"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {notifications.map((notification: Notification) => {
                        const typeConfig = notificationTypeConfig[notification.type];

                        return (
                          <div
                            key={notification.id}
                            className={cn(
                              'flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors',
                              notification.read ? 'bg-white' : 'border-blue-100 bg-blue-50',
                            )}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div
                              className={cn(
                                'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
                                typeConfig.bgClass || 'bg-gray-100',
                                typeConfig.textClass || 'text-gray-600',
                              )}
                            >
                              {typeConfig.icon || <BellIcon className="h-5 w-5" />}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4
                                    className={cn(
                                      'text-base',
                                      notification.read ? 'font-medium' : 'font-semibold',
                                    )}
                                  >
                                    {notification.title}
                                  </h4>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {notification.message}
                                  </p>
                                </div>
                                <div className="ml-4 flex items-center gap-2">
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-blue-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notification.id);
>
                                      <MailOpenIcon className="h-4 w-4" />
                                      <span className="sr-only">Mark as read</span>
                                    </Button>
                                  )}
                                  {notification.linkUrl && (
                                    <ExternalLinkIcon className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
>
                                    <TrashIcon className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </div>

                              <div className="mt-2 flex justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                      addSuffix: true,
)}
                                  </span>
                                  <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
                                  <span className="text-xs text-muted-foreground">
                                    {typeConfig.label || 'Notification'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
)}
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between pt-6">
                        <div className="text-sm text-muted-foreground">
                          Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span>{' '}
                          to{' '}
                          <span className="font-medium">
                            {Math.min(page * pageSize, pagination.totalItems)}
                          </span>{' '}
                          of <span className="font-medium">{pagination.totalItems}</span>{' '}
                          notifications
                        </div>

                        <div className="flex items-center gap-1">
                          <PaginationArrow
                            direction="left"
                            onClick={goToPrevPage}
                            disabled={!pagination.hasPrevPage}
                          />

                          <div className="flex h-8 w-8 items-center justify-center">
                            <span className="text-sm">{page}</span>
                          </div>

                          <PaginationArrow
                            direction="right"
                            onClick={goToNextPage}
                            disabled={!pagination.hasNextPage}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
