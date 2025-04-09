'use client';

import { UseFormReturn } from 'react-hook-form';
import { BusinessProfileFormValues } from '@/components/business/business-profile-wizard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface BusinessHoursFormProps {
  form: UseFormReturn<BusinessProfileFormValues>;
}

export function BusinessHoursForm({ form }: BusinessHoursFormProps) {
  const days = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
  ];

  // Standard hours (9am-5pm, Mon-Fri)
  const setStandardHours = () => {
    const standardHours = {
      monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      saturday: { isOpen: false },
      sunday: { isOpen: false },
    };
    
    form.setValue('businessHours', standardHours, { shouldValidate: true });
  };

  // Extended hours (10am-8pm, Mon-Sat)
  const setExtendedHours = () => {
    const extendedHours = {
      monday: { isOpen: true, openTime: '10:00', closeTime: '20:00' },
      tuesday: { isOpen: true, openTime: '10:00', closeTime: '20:00' },
      wednesday: { isOpen: true, openTime: '10:00', closeTime: '20:00' },
      thursday: { isOpen: true, openTime: '10:00', closeTime: '20:00' },
      friday: { isOpen: true, openTime: '10:00', closeTime: '20:00' },
      saturday: { isOpen: true, openTime: '10:00', closeTime: '18:00' },
      sunday: { isOpen: false },
    };
    
    form.setValue('businessHours', extendedHours, { shouldValidate: true });
  };

  // Weekend hours (11am-7pm, Sat-Sun only)
  const setWeekendHours = () => {
    const weekendHours = {
      monday: { isOpen: false },
      tuesday: { isOpen: false },
      wednesday: { isOpen: false },
      thursday: { isOpen: false },
      friday: { isOpen: false },
      saturday: { isOpen: true, openTime: '11:00', closeTime: '19:00' },
      sunday: { isOpen: true, openTime: '11:00', closeTime: '19:00' },
    };
    
    form.setValue('businessHours', weekendHours, { shouldValidate: true });
  };

  // Toggle isOpen status for a day
  const toggleDay = (day: string, isOpen: boolean) => {
    const currentHours = form.watch('businessHours');
    
    // Set default open and close times if toggling to open and they're not set
    let updatedDay = { isOpen };
    if (isOpen && !currentHours[day].openTime) {
      updatedDay = {
        ...updatedDay,
        openTime: '09:00',
        closeTime: '17:00',
      };
    }
    
    form.setValue(`businessHours.${day}`, updatedDay, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Business Hours</h2>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={setStandardHours}
        >
          Standard Hours
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={setExtendedHours}
        >
          Extended Hours
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={setWeekendHours}
        >
          Weekend Only
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Set Your Hours</CardTitle>
          <CardDescription>
            Configure when your business is open for appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {days.map(day => {
              const dayData = form.watch(`businessHours.${day.id}`);
              return (
                <div key={day.id} className="grid grid-cols-6 items-center gap-4 py-2 border-b last:border-0">
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`is-open-${day.id}`}
                        checked={dayData?.isOpen}
                        onCheckedChange={(checked) => toggleDay(day.id, checked)}
                      />
                      <Label htmlFor={`is-open-${day.id}`} className="font-medium">
                        {day.label}
                      </Label>
                    </div>
                  </div>
                  
                  {dayData?.isOpen ? (
                    <>
                      <div className="col-span-2">
                        <div className="space-y-1">
                          <Label htmlFor={`open-time-${day.id}`} className="text-xs text-muted-foreground">
                            Open
                          </Label>
                          <Input
                            id={`open-time-${day.id}`}
                            type="time"
                            value={dayData.openTime || ''}
                            onChange={(e) => form.setValue(`businessHours.${day.id}.openTime`, e.target.value, { shouldValidate: true })}
                          />
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <div className="space-y-1">
                          <Label htmlFor={`close-time-${day.id}`} className="text-xs text-muted-foreground">
                            Close
                          </Label>
                          <Input
                            id={`close-time-${day.id}`}
                            type="time"
                            value={dayData.closeTime || ''}
                            onChange={(e) => form.setValue(`businessHours.${day.id}.closeTime`, e.target.value, { shouldValidate: true })}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-4 text-muted-foreground">
                      Closed
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <p className="font-medium mb-2">Note:</p>
        <p>These hours will be displayed to customers and used to determine available appointment slots.</p>
        <p className="mt-2">You'll be able to set more specific availability and exceptions in your business dashboard.</p>
      </div>
    </div>
  );
} 