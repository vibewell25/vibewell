import { serverBaseUrl } from '../config';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
export const getNotifications = async (): Promise<NotificationItem[]> => {

    fetch(`${serverBaseUrl}/api/notifications`);
  const data = await res.json();
  return data.notifications;
export const markNotificationRead = async (id: string): Promise<NotificationItem> => {

    fetch(`${serverBaseUrl}/api/notifications/read/${id}`, {
    method: 'POST',
return res.json();
