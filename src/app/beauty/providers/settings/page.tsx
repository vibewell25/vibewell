'use client';
import { useState } from 'react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
import { Icons } from '@/components/icons';
  BuildingOfficeIcon,
  ClockIcon,
  CreditCardIcon,
  BellIcon,
  GlobeAltIcon,
  PhotoIcon,
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
interface BusinessHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}
const defaultBusinessHours: BusinessHours[] = [
  { day: 'Monday', open: '09:00', close: '17:00', isClosed: false },
  { day: 'Tuesday', open: '09:00', close: '17:00', isClosed: false },
  { day: 'Wednesday', open: '09:00', close: '17:00', isClosed: false },
  { day: 'Thursday', open: '09:00', close: '17:00', isClosed: false },
  { day: 'Friday', open: '09:00', close: '17:00', isClosed: false },
  { day: 'Saturday', open: '10:00', close: '15:00', isClosed: false },
  { day: 'Sunday', open: '00:00', close: '00:00', isClosed: true },
];
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business');
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>(defaultBusinessHours);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: true,
    appointmentReminders: true,
    newReviews: true,
    cancellations: true,
  });
  const handleBusinessHoursChange = (index: number, field: keyof BusinessHours, value: any) => {
    const updatedHours = [...businessHours];
    updatedHours[index] = { ...updatedHours[index], [field]: value };
    setBusinessHours(updatedHours);
  };
  const handleNotificationToggle = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof notifications]
    }));
  };
  return (
    <Layout>
      <div className="container-app py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Business Settings</h1>
          <p className="text-xl text-muted-foreground">
            Manage your business configuration and preferences
          </p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="business">
              <Icons.BuildingOfficeIcon className="h-5 w-5 mr-2" />
              Business
            </TabsTrigger>
            <TabsTrigger value="hours">
              <Icons.ClockIcon className="h-5 w-5 mr-2" />
              Hours
            </TabsTrigger>
            <TabsTrigger value="payments">
              <Icons.CreditCardIcon className="h-5 w-5 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Icons.BellIcon className="h-5 w-5 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>
          {/* Business Settings */}
          <TabsContent value="business" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Profile</CardTitle>
                  <CardDescription>
                    Update your business information and branding
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Business Name</Label>
                      <Input placeholder="Enter business name" />
                    </div>
                    <div>
                      <Label>Business Type</Label>
                      <Input placeholder="e.g., Salon, Spa, Clinic" />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input placeholder="Brief description of your business" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Phone Number</Label>
                      <Input type="tel" placeholder="+1 (555) 000-0000" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" placeholder="business@example.com" />
                    </div>
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input placeholder="Street address" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>City</Label>
                      <Input placeholder="City" />
                    </div>
                    <div>
                      <Label>Postal Code</Label>
                      <Input placeholder="Postal code" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Branding</CardTitle>
                  <CardDescription>
                    Customize your business appearance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Logo</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                        <Icons.PhotoIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <Button variant="outline">Upload Logo</Button>
                    </div>
                  </div>
                  <div>
                    <Label>Brand Colors</Label>
                    <div className="mt-2 flex gap-2">
                      <Button variant="outline" className="w-10 h-10 p-0" />
                      <Button variant="outline" className="w-10 h-10 p-0" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          {/* Business Hours */}
          <TabsContent value="hours" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
                <CardDescription>
                  Set your operating hours for each day of the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {businessHours.map((day, index) => (
                    <div key={day.day} className="flex items-center gap-4">
                      <div className="w-24">
                        <Label>{day.day}</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={day.open}
                          onChange={(e) => handleBusinessHoursChange(index, 'open', e.target.value)}
                          disabled={day.isClosed}
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={day.close}
                          onChange={(e) => handleBusinessHoursChange(index, 'close', e.target.value)}
                          disabled={day.isClosed}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!day.isClosed}
                          onCheckedChange={(checked: boolean) => handleBusinessHoursChange(index, 'isClosed', !checked)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {day.isClosed ? 'Closed' : 'Open'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Payment Settings */}
          <TabsContent value="payments" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Configure your accepted payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icons.CreditCardIcon className="h-5 w-5" />
                      <span>Credit/Debit Cards</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icons.GlobeAltIcon className="h-5 w-5" />
                      <span>Online Payment</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icons.ShieldCheckIcon className="h-5 w-5" />
                      <span>Cash</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Settings</CardTitle>
                  <CardDescription>
                    Configure your pricing and payment policies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Currency</Label>
                    <Input placeholder="USD" />
                  </div>
                  <div>
                    <Label>Tax Rate (%)</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label>Deposit Required (%)</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          {/* Notification Settings */}
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icons.BellIcon className="h-5 w-5" />
                      <span>Email Notifications</span>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={() => handleNotificationToggle('email')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icons.BellIcon className="h-5 w-5" />
                      <span>SMS Notifications</span>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={() => handleNotificationToggle('sms')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icons.BellIcon className="h-5 w-5" />
                      <span>Push Notifications</span>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={() => handleNotificationToggle('push')}
                    />
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <h3 className="font-medium">Notification Types</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icons.UserGroupIcon className="h-5 w-5" />
                      <span>Appointment Reminders</span>
                    </div>
                    <Switch
                      checked={notifications.appointmentReminders}
                      onCheckedChange={() => handleNotificationToggle('appointmentReminders')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icons.UserGroupIcon className="h-5 w-5" />
                      <span>New Reviews</span>
                    </div>
                    <Switch
                      checked={notifications.newReviews}
                      onCheckedChange={() => handleNotificationToggle('newReviews')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icons.UserGroupIcon className="h-5 w-5" />
                      <span>Appointment Cancellations</span>
                    </div>
                    <Switch
                      checked={notifications.cancellations}
                      onCheckedChange={() => handleNotificationToggle('cancellations')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="mt-6 flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>
    </Layout>
  );
} 