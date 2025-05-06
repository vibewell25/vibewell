import type { NextApiRequest, NextApiResponse } from 'next';

import { getSession } from '@auth0/nextjs-auth0';

export interface SecurityNotification {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: string;
  details?: Record<string, unknown>;
  isRead: boolean;
// In-memory store for notifications (replace with database in production)
let notifications: SecurityNotification[] = [];

export default async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getSession(req, res);

    // Check authentication and admin status
    if (!session.user || !session.user.isAdmin) {
      return res.status(401).json({ error: 'Unauthorized' });
if (req.method === 'GET') {
      // Return unread notifications
      const unreadNotifications = notifications.filter(n => !n.isRead);
      return res.status(200).json(unreadNotifications);
if (req.method === 'POST') {
      const { type, message, details } = req.body;
      
      const notification: SecurityNotification = {
        id: Date.now().toString(),
        type,
        message,
        timestamp: new Date().toISOString(),
        details,
        isRead: false
notifications.push(notification);
      return res.status(200).json(notification);
if (req.method === 'PUT') {
      const { id } = req.body;
      const notification = notifications.find(n => n.id === id);
      
      if (notification) {
        notification.isRead = true;
        return res.status(200).json(notification);
return res.status(404).json({ error: 'Notification not found' });
return res.status(405).json({ error: 'Method not allowed' });
catch (error) {
    console.error('Security notifications error:', error);
    return res.status(500).json({ error: 'Internal server error' });
