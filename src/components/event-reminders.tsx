import { Icons } from '@/components/icons';
import { useState, useEffect } from 'react';
import { Event } from '@/types/events';
import { format, parseISO, addHours } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
interface EventRemindersProps {
  event: Event;
  onReminderChange?: (enabled: boolean, reminderTime: number) => void;
}
export function EventReminders({ event, onReminderChange }: EventRemindersProps) {
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(24); // Default to 24 hours before
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>('default');
  useEffect(() => {
    // Check notification permission status
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    }
    return false;
  };
  const handleReminderToggle = async (enabled: boolean) => {
    if (enabled && notificationPermission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) {
        return;
      }
    }
    setReminderEnabled(enabled);
    onReminderChange?.(enabled, reminderTime);
    if (enabled) {
      scheduleReminder(event, reminderTime);
    }
  };
  const scheduleReminder = (event: Event, hoursBefore: number) => {
    const eventDate = parseISO(event.startDate);
    const reminderDate = addHours(eventDate, -hoursBefore);
    // In a real app, this would use a proper scheduling system
    // For now, we'll just log it
    console.log(`Reminder scheduled for ${format(reminderDate, 'PPpp')}`);
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Icons.BellIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Event Reminders</h3>
        </div>
        <Switch checked={reminderEnabled} onCheckedChange={handleReminderToggle} />
      </CardHeader>
      <CardContent>
        {reminderEnabled ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Icons.ClockIcon className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="reminder-time">Remind me</Label>
              <Select
                value={reminderTime.toString()}
                onValueChange={value => {
                  const time = parseInt(value);
                  setReminderTime(time);
                  onReminderChange?.(true, time);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour before</SelectItem>
                  <SelectItem value="24">24 hours before</SelectItem>
                  <SelectItem value="48">2 days before</SelectItem>
                  <SelectItem value="168">1 week before</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              You'll receive a notification {reminderTime} hours before the event starts.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icons.BellOffIcon className="h-4 w-4" />
            <p className="text-sm">Reminders are currently disabled</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
