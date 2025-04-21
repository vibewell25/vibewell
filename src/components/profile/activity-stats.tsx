import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityStats {
  totalEvents: number;
  successfulEvents: number;
  warningEvents: number;
  errorEvents: number;
  lastActivity: string;
  mostActiveTime: string;
  mostCommonEvent: string;
}

export function ActivityStats() {
  const stats: ActivityStats = {
    totalEvents: 156,
    successfulEvents: 142,
    warningEvents: 10,
    errorEvents: 4,
    lastActivity: '2024-03-20T10:00:00Z',
    mostActiveTime: '10:00 AM - 12:00 PM',
    mostCommonEvent: 'login',
  };

  const getPercentage = (value: number, total: number) => {
    return ((value / total) * 100).toFixed(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Events</span>
              <span className="text-sm text-muted-foreground">{stats.totalEvents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Activity</span>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(stats.lastActivity), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Most Active Time</span>
              <span className="text-sm text-muted-foreground">{stats.mostActiveTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Most Common Event</span>
              <span className="text-sm text-muted-foreground capitalize">
                {stats.mostCommonEvent}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Successful</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {stats.successfulEvents} (
                  {getPercentage(stats.successfulEvents, stats.totalEvents)}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-green-100">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{
                    width: `${getPercentage(stats.successfulEvents, stats.totalEvents)}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Warnings</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {stats.warningEvents} ({getPercentage(stats.warningEvents, stats.totalEvents)}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-yellow-100">
                <div
                  className="h-2 rounded-full bg-yellow-500"
                  style={{
                    width: `${getPercentage(stats.warningEvents, stats.totalEvents)}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Errors</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {stats.errorEvents} ({getPercentage(stats.errorEvents, stats.totalEvents)}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-red-100">
                <div
                  className="h-2 rounded-full bg-red-500"
                  style={{
                    width: `${getPercentage(stats.errorEvents, stats.totalEvents)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
