import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  LogIn,
  User,
  Shield,
  Key,
  Mail,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Globe,
from 'lucide-react';

interface Activity {
  id: string;
  type: 'login' | 'logout' | 'profile_update' | 'security_change' | 'device' | 'email';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error';
  location?: string;
  device?: string;
  icon: React.ReactNode;
export function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'login',
      title: 'Successful Login',
      description: 'Logged in from Chrome on Mac',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      status: 'success',
      location: 'New York, NY',
      device: 'Chrome on Mac',
      icon: <LogIn className="h-5 w-5" />,
{
      id: '2',
      title: 'Password Changed',
      type: 'security_change',
      description: 'Account password was updated',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      status: 'success',
      icon: <Key className="h-5 w-5" />,
{
      id: '3',
      type: 'device',
      title: 'New Device Detected',
      description: 'New login from iPhone 13',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      status: 'warning',
      location: 'Los Angeles, CA',
      device: 'iPhone 13',
      icon: <Smartphone className="h-5 w-5" />,
{
      id: '4',
      type: 'email',
      title: 'Email Verification',
      description: 'Email address was verified',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      status: 'success',
      icon: <Mail className="h-5 w-5" />,
{
      id: '5',
      type: 'profile_update',
      title: 'Profile Updated',
      description: 'Profile information was modified',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      status: 'success',
      icon: <User className="h-5 w-5" />,
{
      id: '6',
      type: 'security_change',
      title: 'Two-Factor Authentication',
      description: '2FA was enabled for your account',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
      status: 'success',
      icon: <Shield className="h-5 w-5" />,
]);

  const getStatusBadge = (status: Activity['status']) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Success
          </Badge>
case 'warning':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Warning
          </Badge>
case 'error':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Error
          </Badge>
return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Activity Log</CardTitle>
        <Button variant="outline" size="sm">
          Export Logs
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 rounded-lg border p-4">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                {activity.icon}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{activity.title}</h3>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(activity.status)}
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                {(activity.location || activity.device) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {activity.location && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {activity.location}
                      </span>
                    )}
                    {activity.device && (
                      <span className="flex items-center gap-1">
                        <Smartphone className="h-3 w-3" />
                        {activity.device}
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
