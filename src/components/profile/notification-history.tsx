import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Mail, Smartphone, MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

interface Notification {
  id: string;
  type: 'email' | 'push' | 'sms' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: React.ReactNode;
}

export function NotificationHistory() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'email',
      title: 'Welcome to Vibewell',
      message: "Thank you for joining Vibewell! We're excited to have you on board.",
      timestamp: '2024-03-20T10:00:00Z',
      read: true,
      icon: <Mail className="h-5 w-5" />,
    },
    {
      id: '2',
      type: 'push',
      title: 'New Message',
      message: 'You have a new message from John Doe',
      timestamp: '2024-03-19T15:30:00Z',
      read: false,
      icon: <Bell className="h-5 w-5" />,
    },
    {
      id: '3',
      type: 'sms',
      title: 'Security Alert',
      message: 'A new device has logged into your account',
      timestamp: '2024-03-18T09:15:00Z',
      read: true,
      icon: <Smartphone className="h-5 w-5" />,
    },
    {
      id: '4',
      type: 'system',
      title: 'System Update',
      message: 'New features are available in your account',
      timestamp: '2024-03-17T22:45:00Z',
      read: false,
      icon: <MessageSquare className="h-5 w-5" />,
    },
  ]);

  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || notification.type === filter;
    const matchesSearch =
      notification.title.toLowerCase().includes(search.toLowerCase()) ||
      notification.message.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification => {
        if (notification.id === id) {
          return { ...notification, read: true };
        }
        return notification;
      })
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notifications..."
            />
          </div>
          <div className="w-[200px]">
            <Label htmlFor="filter">Filter</Label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="push">Push</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`flex items-start space-x-4 rounded-lg border p-4 ${
                !notification.read ? 'bg-muted' : ''
              }`}
            >
              <div className="mt-1">{notification.icon}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{notification.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
              </div>
              <div className="flex space-x-2">
                {!notification.read && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => handleDelete(notification.id)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
