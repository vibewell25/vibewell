import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { User, Key, Globe, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ActivityEvent {
  id: string;
  type: 'login' | 'password_change' | 'profile_update' | 'security' | 'location';
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  device?: string;
  status: 'success' | 'warning' | 'error';
  icon: React.ReactNode;
}

export function AccountActivity() {
  const [events, setEvents] = useState<ActivityEvent[]>([
    {
      id: '1',
      type: 'login',
      title: 'Successful Login',
      description: 'You logged in from a new device',
      timestamp: '2024-03-20T10:00:00Z',
      location: 'New York, US',
      device: 'iPhone 13',
      status: 'success',
      icon: <User className="h-5 w-5" />,
    },
    {
      id: '2',
      type: 'password_change',
      title: 'Password Changed',
      description: 'Your password was successfully updated',
      timestamp: '2024-03-19T15:30:00Z',
      status: 'success',
      icon: <Key className="h-5 w-5" />,
    },
    {
      id: '3',
      type: 'profile_update',
      title: 'Profile Updated',
      description: 'Your profile information was modified',
      timestamp: '2024-03-18T09:15:00Z',
      status: 'success',
      icon: <User className="h-5 w-5" />,
    },
    {
      id: '4',
      type: 'security',
      title: 'Security Alert',
      description: 'Unusual login attempt detected',
      timestamp: '2024-03-17T22:45:00Z',
      location: 'London, UK',
      device: 'Unknown',
      status: 'warning',
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      id: '5',
      type: 'location',
      title: 'New Location',
      description: 'Account accessed from a new location',
      timestamp: '2024-03-16T14:20:00Z',
      location: 'Tokyo, Japan',
      device: 'MacBook Pro',
      status: 'success',
      icon: <Globe className="h-5 w-5" />,
    },
  ]);

  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredEvents = events.filter((event) => {
    const matchesFilter = filter === 'all' || event.type === filter;
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: ActivityEvent['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity..."
            />
          </div>
          <div className="w-[200px]">
            <Label htmlFor="filter">Filter</Label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activity</SelectItem>
                <SelectItem value="login">Logins</SelectItem>
                <SelectItem value="password_change">Password Changes</SelectItem>
                <SelectItem value="profile_update">Profile Updates</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="location">Location</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div key={event.id} className="flex items-start space-x-4 rounded-lg border p-4">
              <div className={`mt-1 ${getStatusColor(event.status)}`}>{event.icon}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{event.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(event.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{event.description}</p>
                {(event.location || event.device) && (
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    {event.location && (
                      <span className="flex items-center">
                        <Globe className="mr-1 h-3 w-3" />
                        {event.location}
                      </span>
                    )}
                    {event.device && (
                      <span className="flex items-center">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        {event.device}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
