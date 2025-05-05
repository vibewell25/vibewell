import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';
import { Bell, Mail, Palette, Clock, Calendar, Languages, Moon } from 'lucide-react';

interface Preference {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'switch' | 'select';
  value: boolean | string;
  options?: { value: string; label: string }[];
export function ProfilePreferences() {
  const [preferences, setPreferences] = useState<Preference[]>([
    {
      id: 'email-notifications',
      title: 'Email Notifications',
      description: 'Receive email notifications for important updates',
      icon: <Mail className="h-5 w-5" />,
      type: 'switch',
      value: true,
{
      id: 'push-notifications',
      title: 'Push Notifications',
      description: 'Receive push notifications on your device',
      icon: <Bell className="h-5 w-5" />,
      type: 'switch',
      value: true,
{
      id: 'language',
      title: 'Language',
      description: 'Select your preferred language',
      icon: <Languages className="h-5 w-5" />,
      type: 'select',
      value: 'en',
      options: [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'de', label: 'German' },
      ],
{
      id: 'timezone',
      title: 'Timezone',
      description: 'Set your local timezone',
      icon: <Clock className="h-5 w-5" />,
      type: 'select',
      value: 'UTC',
      options: [
        { value: 'UTC', label: 'UTC' },
        { value: 'EST', label: 'Eastern Time' },
        { value: 'PST', label: 'Pacific Time' },
        { value: 'GMT', label: 'Greenwich Mean Time' },
      ],
{
      id: 'date-format',
      title: 'Date Format',
      description: 'Choose your preferred date format',
      icon: <Calendar className="h-5 w-5" />,
      type: 'select',
      value: 'MM/DD/YYYY',
      options: [
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
      ],
{
      id: 'theme',
      title: 'Theme',
      description: 'Choose your preferred theme',
      icon: <Palette className="h-5 w-5" />,
      type: 'select',
      value: 'system',
      options: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'system', label: 'System' },
      ],
{
      id: 'dark-mode',
      title: 'Dark Mode',
      description: 'Enable dark mode for better night viewing',
      icon: <Moon className="h-5 w-5" />,
      type: 'switch',
      value: false,
]);

  const handlePreferenceChange = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');id: string, newValue: boolean | string) => {
    try {
      // Simulate API call to update preference
      await new Promise((resolve) => setTimeout(resolve, 500));

      setPreferences((prev) =>
        prev.map((preference) =>
          preference.id === id ? { ...preference, value: newValue } : preference,
        ),
toast.success('Preference updated successfully!');
catch (error) {
      console.error('Error updating preference:', error);
      toast.error('Failed to update preference');
return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {preferences.map((preference) => (
            <div
              key={preference.id}
              className="flex items-start justify-between rounded-lg border p-4"
            >
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                  {preference.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">{preference.title}</h3>
                  <p className="text-sm text-muted-foreground">{preference.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {preference.type === 'switch' ? (
                  <Switch
                    checked={preference.value as boolean}
                    onCheckedChange={(checked: boolean) =>
                      handlePreferenceChange(preference.id, checked)
/>
                ) : (
                  <Select
                    value={preference.value as string}
                    onValueChange={(value) => handlePreferenceChange(preference.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {preference.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
