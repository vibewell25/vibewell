import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Activity, AlertTriangle, CheckCircle2, Clock, Globe, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';

interface ActivityEvent {
  id: string;
  type: 'login' | 'security' | 'profile' | 'settings';
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  device?: string;
  status: 'success' | 'warning' | 'error';
  icon: React?.ReactNode;
}

export function ActivityHistory() {
  const events: ActivityEvent[] = [
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
      title: 'Security Alert',
      type: 'security',
      description: 'Unusual login attempt detected',
      timestamp: '2024-03-19T15:30:00Z',
      location: 'London, UK',
      device: 'Unknown',
      status: 'warning',
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      id: '3',
      type: 'profile',
      title: 'Profile Updated',
      description: 'Your profile information was modified',
      timestamp: '2024-03-18T09:15:00Z',
      status: 'success',
      icon: <User className="h-5 w-5" />,
    },
  ];

  const getStatusColor = (status: ActivityEvent['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ActivityEvent['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity History</CardTitle>
        <CardDescription>View your recent account activity and events.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {events?.map((event) => (
          <div key={event?.id} className="flex items-start space-x-4 rounded-lg border p-4">
            <div className="mt-1">{event?.icon}</div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{event?.title}</h3>
                <Badge variant="outline" className={getStatusColor(event?.status)}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(event?.status)}
                    <span className="capitalize">{event?.status}</span>
                  </div>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{event?.description}</p>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatDistanceToNow(new Date(event?.timestamp), {
                    addSuffix: true,
                  })}
                </div>
                {event?.location && (
                  <div className="flex items-center">
                    <Globe className="mr-1 h-3 w-3" />
                    {event?.location}
                  </div>
                )}
                {event?.device && (
                  <div className="flex items-center">
                    <Activity className="mr-1 h-3 w-3" />
                    {event?.device}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full">
          View All Activity
        </Button>
      </CardContent>
    </Card>
  );
}
