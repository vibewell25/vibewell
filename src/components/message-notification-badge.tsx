import { Icons } from '@/components/icons';
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
export function MessageNotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  useEffect(() => {
    // Only fetch if user is logged in
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchUnreadCount = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/messages');
        if (!response.ok) {
          console.error('Failed to fetch messages');
          return;
        }
        const data = await response.json();
        // Calculate total unread messages across all conversations
        const totalUnread = data.conversations?.reduce((total: number, conversation: any) => {
          return total + (conversation.unreadCount || 0);
        }, 0) || 0;
        setUnreadCount(totalUnread);
      } catch (error) {
        console.error('Error fetching unread messages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUnreadCount();
    // Set up polling for unread count every 30 seconds
    const intervalId = setInterval(fetchUnreadCount, 30000);
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [user]);
  if (loading || !user) {
    return null;
  }
  return (
    <Link href="/messages" className="relative inline-block">
      <Icons.ChatBubbleLeftRightIcon className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-primary rounded-full">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
} 