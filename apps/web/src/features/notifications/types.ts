export type NotificationType = 'success' | 'error' | 'info' | 'default';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  link?: string;
  userId: string;
export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
export interface NotificationAction {
  type: string;
  payload?: any;
