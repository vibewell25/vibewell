'use client';

import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/contexts/NotificationContext';

interface NotificationBadgeProps {
  count?: number;
  maxCount?: number;
}

export function NotificationBadge({ maxCount = 99 }: Partial<NotificationBadgeProps>) {
  const { unreadCount } = useNotifications();
  const [hasAnimated, setHasAnimated] = useState(false);
  // Add animation when count changes
  useEffect(() => {
    if (unreadCount > 0 && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [unreadCount, hasAnimated]);
  // Reset animation state when count becomes 0
  useEffect(() => {
    if (unreadCount === 0) {
      setHasAnimated(false);
    }
  }, [unreadCount]);
  const displayCount = unreadCount > maxCount ? `${maxCount}+` : unreadCount;
  return (
    <Link
      href="/notifications"
      className="relative inline-flex items-center justify-center rounded-md p-1.5 transition-colors hover:bg-muted"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span
          className={`bg-secondary absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold text-white ${
            hasAnimated ? 'animate-pulse' : ''
          }`}
          aria-label={`${unreadCount} unread notifications`}
        >
          {displayCount}
        </span>
      )}
    </Link>
  );
}
