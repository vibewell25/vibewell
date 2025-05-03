import { useState, useEffect } from 'react';
import { DayOfWeek } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Switch } from '@/components/ui/switch';
import { TimeInput } from '@/components/ui/time-input';
import { toast } from '@/components/ui/toast';

interface BusinessHoursProps {
  businessId: string;
}

interface BusinessHour {
  id?: string;
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

const DAYS_OF_WEEK = [
  DayOfWeek?.MONDAY,
  DayOfWeek?.TUESDAY,
  DayOfWeek?.WEDNESDAY,
  DayOfWeek?.THURSDAY,
  DayOfWeek?.FRIDAY,
  DayOfWeek?.SATURDAY,
  DayOfWeek?.SUNDAY,
];

export function BusinessHours({ businessId }: BusinessHoursProps) {
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessHours();
  }, [businessId]);

  const fetchBusinessHours = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const response = await fetch(`/api/business/hours?businessId=${businessId}`);
      if (!response?.ok) throw new Error('Failed to fetch business hours');
      const data = await response?.json();
      setHours(data);
    } catch (error) {
      console?.error('Error fetching business hours:', error);
      toast({
        title: 'Error',
        description: 'Failed to load business hours',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const response = await fetch('/api/business/hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON?.stringify({ businessId, hours }),
      });

      if (!response?.ok) throw new Error('Failed to save business hours');

      toast({
        title: 'Success',
        description: 'Business hours updated successfully',
      });
    } catch (error) {
      console?.error('Error saving business hours:', error);
      toast({
        title: 'Error',
        description: 'Failed to save business hours',
        variant: 'destructive',
      });
    }
  };

  const handleHourChange = (day: DayOfWeek, field: keyof BusinessHour, value: any) => {
    setHours((prev) =>
      prev?.map((hour) => (hour?.dayOfWeek === day ? { ...hour, [field]: value } : hour)),
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {DAYS_OF_WEEK?.map((day) => (
            <div key={day} className="flex items-center space-x-4">
              <div className="w-32">{day}</div>
              <Switch
                checked={!hours?.find((h) => h?.dayOfWeek === day)?.isClosed}
                onCheckedChange={(checked) => handleHourChange(day, 'isClosed', !checked)}
              />
              {!hours?.find((h) => h?.dayOfWeek === day)?.isClosed && (
                <>
                  <TimeInput
                    value={hours?.find((h) => h?.dayOfWeek === day)?.openTime || '09:00'}
                    onChange={(value) => handleHourChange(day, 'openTime', value)}
                  />
                  <span>to</span>
                  <TimeInput
                    value={hours?.find((h) => h?.dayOfWeek === day)?.closeTime || '17:00'}
                    onChange={(value) => handleHourChange(day, 'closeTime', value)}
                  />
                </>
              )}
            </div>
          ))}
          <Button onClick={handleSave} className="mt-4">
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
