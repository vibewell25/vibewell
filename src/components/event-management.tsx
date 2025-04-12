import { Icons } from '@/components/icons';
import { useState } from 'react';
import { Event } from '@/types/events';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
interface EventManagementProps {
  event: Event;
  onUpdate: (updates: Partial<Event>) => void;
}
export function EventManagement({ event, onUpdate }: EventManagementProps) {
  const [activeTab, setActiveTab] = useState('recurring');
  // Handle recurring event settings
  const handleRecurringToggle = (enabled: boolean) => {
    onUpdate({
      isRecurring: enabled,
      recurrencePattern: enabled ? {
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [new Date(event.startDate).getDay()],
      } : undefined
    });
  };
  const handleRecurrenceChange = (field: string, value: any) => {
    onUpdate({
      recurrencePattern: {
        ...event.recurrencePattern,
        [field]: value
      }
    });
  };
  // Handle waitlist settings
  const handleWaitlistToggle = (enabled: boolean) => {
    onUpdate({
      waitlistEnabled: enabled,
      waitlistCapacity: enabled ? 20 : undefined,
      waitlistCount: enabled ? 0 : undefined,
      waitlistParticipants: enabled ? [] : undefined
    });
  };
  const handleWaitlistCapacityChange = (capacity: number) => {
    onUpdate({
      waitlistCapacity: capacity
    });
  };
  return (
    <Card>
      <CardHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="recurring">
              <Icons.CalendarIcon className="h-4 w-4 mr-2" />
              Recurring
            </TabsTrigger>
            <TabsTrigger value="waitlist">
              <Icons.UserGroupIcon className="h-4 w-4 mr-2" />
              Waitlist
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <TabsContent value="recurring">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Recurring Event</Label>
                <p className="text-sm text-muted-foreground">
                  Set up recurring schedule for this event
                </p>
              </div>
              <Switch
                checked={event.isRecurring}
                onCheckedChange={handleRecurringToggle}
              />
            </div>
            {event.isRecurring && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={event.recurrencePattern?.frequency}
                    onValueChange={(value) => handleRecurrenceChange('frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Interval</Label>
                  <Input
                    type="number"
                    min="1"
                    value={event.recurrencePattern?.interval || 1}
                    onChange={(e) => handleRecurrenceChange('interval', parseInt(e.target.value))}
                  />
                </div>
                {event.recurrencePattern?.frequency === 'weekly' && (
                  <div className="space-y-2">
                    <Label>Days of Week</Label>
                    <div className="flex gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                        <Button
                          key={day}
                          variant={event.recurrencePattern?.daysOfWeek?.includes(index) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const days = event.recurrencePattern?.daysOfWeek || [];
                            const newDays = days.includes(index)
                              ? days.filter(d => d !== index)
                              : [...days, index];
                            handleRecurrenceChange('daysOfWeek', newDays);
                          }}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Input
                    type="date"
                    value={event.recurrencePattern?.endDate?.split('T')[0] || ''}
                    onChange={(e) => handleRecurrenceChange('endDate', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="waitlist">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Waitlist</Label>
                <p className="text-sm text-muted-foreground">
                  Enable waitlist when event is full
                </p>
              </div>
              <Switch
                checked={event.waitlistEnabled}
                onCheckedChange={handleWaitlistToggle}
              />
            </div>
            {event.waitlistEnabled && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Waitlist Capacity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={event.waitlistCapacity || 20}
                    onChange={(e) => handleWaitlistCapacityChange(parseInt(e.target.value))}
                  />
                </div>
                {event.waitlistParticipants && event.waitlistParticipants.length > 0 && (
                  <div className="space-y-2">
                    <Label>Waitlist Participants</Label>
                    <div className="space-y-2">
                      {event.waitlistParticipants.map((participant) => (
                        <div
                          key={participant.userId}
                          className="flex items-center justify-between p-2 border rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={participant.avatar}
                              alt={participant.name}
                              className="h-8 w-8 rounded-full"
                            />
                            <div>
                              <p className="font-medium">{participant.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Joined {format(parseISO(participant.joinedAt), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              participant.status === 'confirmed'
                                ? 'default'
                                : participant.status === 'notified'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {participant.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </CardContent>
    </Card>
  );
} 