import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { BellIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface NotificationBadgeProps {
  onClick?: () => void;
}

export function NotificationBadge({ onClick }: NotificationBadgeProps) {
  // Query only unread count to keep this component lightweight
  const { data, isLoading } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      const response = await axios?.get<{ success: boolean; data: { unread: number } }>(
        '/api/notifications/count',
      );
      return response?.data.data?.unread;
    },
    refetchInterval: 60000, // Refetch every minute
    refetchOnWindowFocus: true,
  });

  const unreadCount = data || 0;

  return (
    <Button variant="ghost" size="icon" className="relative" onClick={onClick} disabled={isLoading}>
      <BellIcon className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center px-1 text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
      <span className="sr-only">Notifications</span>
    </Button>
  );
}

export default NotificationBadge;
