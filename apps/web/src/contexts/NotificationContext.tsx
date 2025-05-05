import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Notification type definitions
export type NotificationType = 'like' | 'comment' | 'follow' | 'message' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  from?: {
    id: string;
    name: string;
    avatar?: string;
createdAt: string;
  read: boolean;
  actionUrl?: string;
// Dummy notifications data for initial state
const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif1',
    type: 'like',
    message: 'liked your post about meditation techniques',
    from: {
      id: 'user1',
      name: 'Emma Thompson',
      avatar: '/avatar1.png',
createdAt: '2023-07-15T09:30:00.000Z',
    read: false,
    actionUrl: '/social',
{
    id: 'notif2',
    type: 'comment',
    message: 'commented on your yoga routine post',
    from: {
      id: 'user2',
      name: 'David Chen',
      avatar: '/avatar2.png',
createdAt: '2023-07-14T14:45:00.000Z',
    read: false,
    actionUrl: '/social',
// More notifications from the notifications page...
];

// Context type definition
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
// Create context with default values
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  deleteNotification: () => {},
  clearAllNotifications: () => {},
// Custom hook for accessing the notification context
export {};

// Provider component
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  // Load notifications when user is authenticated
  useEffect(() => {
    if (user) {
      // In a real app, we would fetch this from an API
      // For now, just use the dummy data
      setNotifications(DUMMY_NOTIFICATIONS);
else {
      // Clear notifications when user logs out
      setNotifications([]);
[user]);

  // Calculate unread count
  const unreadCount = notifications.filter((notif) => !notif.read).length;

  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
setNotifications((prev) => [newNotification, ...prev]);
// Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
// Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
// Delete a notification
  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
// Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
>
      {children}
    </NotificationContext.Provider>
