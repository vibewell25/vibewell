import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Laptop, Tablet, Globe, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
  icon: React.ReactNode;
}

export function SessionManagement() {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      device: 'iPhone 13',
      location: 'New York, US',
      lastActive: '2024-03-20T10:00:00Z',
      current: true,
      icon: <Smartphone className="h-5 w-5" />,
    },
    {
      id: '2',
      device: 'MacBook Pro',
      location: 'San Francisco, US',
      lastActive: '2024-03-19T15:30:00Z',
      current: false,
      icon: <Laptop className="h-5 w-5" />,
    },
    {
      id: '3',
      device: 'iPad Pro',
      location: 'London, UK',
      lastActive: '2024-03-18T09:15:00Z',
      current: false,
      icon: <Tablet className="h-5 w-5" />,
    },
    {
      id: '4',
      device: 'Unknown Device',
      location: 'Tokyo, Japan',
      lastActive: '2024-03-17T22:45:00Z',
      current: false,
      icon: <Globe className="h-5 w-5" />,
    },
  ]);

  const handleEndSession = async (id: string) => {
    try {
      // Implement session termination logic here
      setSessions(prev => prev.filter(session => session.id !== id));
      toast({
        title: 'Session Ended',
        description: 'The selected session has been terminated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to end the session.',
        variant: 'destructive',
      });
    }
  };

  const handleEndAllSessions = async () => {
    try {
      // Implement logic to end all sessions except current
      setSessions(prev => prev.filter(session => session.current));
      toast({
        title: 'Sessions Ended',
        description: 'All other sessions have been terminated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to end all sessions.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {sessions.map(session => (
            <div key={session.id} className="flex items-start space-x-4 rounded-lg border p-4">
              <div className="mt-1">{session.icon}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{session.device}</h3>
                  {session.current && (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Current Session
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{session.location}</span>
                  <span>
                    Last active{' '}
                    {formatDistanceToNow(new Date(session.lastActive), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
              {!session.current && (
                <Button variant="outline" size="sm" onClick={() => handleEndSession(session.id)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full" onClick={handleEndAllSessions}>
          End All Other Sessions
        </Button>
      </CardContent>
    </Card>
  );
}
