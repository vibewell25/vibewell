import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Mail, Smartphone, MessageSquare, Globe, User, Heart } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';

interface NotificationCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  channels: {
    id: string;
    name: string;
    icon: React.ReactNode;
    enabled: boolean;
  }[];
}

interface NotificationPreferencesProps {
  userId: string;
  initialPreferences?: Record<string, boolean>;
  onSave?: () => void;
}

export function NotificationPreferences({
  userId,
  initialPreferences,
  onSave,
}: NotificationPreferencesProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<NotificationCategory[]>([
    {
      id: 'account',
      title: 'Account Notifications',
      description: 'Updates about your account security and settings',
      icon: <Bell className="h-5 w-5" />,
      channels: [
        {
          id: 'email_account',
          name: 'Email',
          icon: <Mail className="h-4 w-4" />,
          enabled: initialPreferences?.email_account ?? true,
        },
        {
          id: 'push_account',
          name: 'Push',
          icon: <Bell className="h-4 w-4" />,
          enabled: initialPreferences?.push_account ?? true,
        },
        {
          id: 'sms_account',
          name: 'SMS',
          icon: <Smartphone className="h-4 w-4" />,
          enabled: initialPreferences?.sms_account ?? false,
        },
      ],
    },
    {
      id: 'marketing',
      title: 'Marketing Communications',
      description: 'Updates about new features, promotions, and offers',
      icon: <MessageSquare className="h-5 w-5" />,
      channels: [
        {
          id: 'email_marketing',
          name: 'Email',
          icon: <Mail className="h-4 w-4" />,
          enabled: initialPreferences?.email_marketing ?? false,
        },
        {
          id: 'push_marketing',
          name: 'Push',
          icon: <Bell className="h-4 w-4" />,
          enabled: initialPreferences?.push_marketing ?? false,
        },
        {
          id: 'sms_marketing',
          name: 'SMS',
          icon: <Smartphone className="h-4 w-4" />,
          enabled: initialPreferences?.sms_marketing ?? false,
        },
      ],
    },
    {
      id: 'messages',
      title: 'Messages and Comments',
      description: 'Notifications about new messages and comments',
      icon: <MessageSquare className="h-5 w-5" />,
      channels: [
        {
          id: 'email_messages',
          name: 'Email',
          icon: <Mail className="h-4 w-4" />,
          enabled: initialPreferences?.email_messages ?? true,
        },
        {
          id: 'push_messages',
          name: 'Push',
          icon: <Bell className="h-4 w-4" />,
          enabled: initialPreferences?.push_messages ?? true,
        },
        {
          id: 'sms_messages',
          name: 'SMS',
          icon: <Smartphone className="h-4 w-4" />,
          enabled: initialPreferences?.sms_messages ?? false,
        },
      ],
    },
    {
      id: 'activity',
      title: 'Activity Updates',
      description: 'Updates about likes, mentions, and other activity',
      icon: <Heart className="h-5 w-5" />,
      channels: [
        {
          id: 'email_activity',
          name: 'Email',
          icon: <Mail className="h-4 w-4" />,
          enabled: initialPreferences?.email_activity ?? true,
        },
        {
          id: 'push_activity',
          name: 'Push',
          icon: <Bell className="h-4 w-4" />,
          enabled: initialPreferences?.push_activity ?? true,
        },
        {
          id: 'sms_activity',
          name: 'SMS',
          icon: <Smartphone className="h-4 w-4" />,
          enabled: initialPreferences?.sms_activity ?? false,
        },
      ],
    },
  ]);

  const handleToggle = (categoryId: string, channelId: string) => {
    setCategories(prev =>
      prev.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            channels: category.channels.map(channel => {
              if (channel.id === channelId) {
                return { ...channel, enabled: !channel.enabled };
              }
              return channel;
            }),
          };
        }
        return category;
      })
    );
  };

  const handleSave = async () => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User ID is required to save preferences',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Convert the categories structure to a simple object for database storage
      const preferencesData: Record<string, boolean> = {};

      categories.forEach(category => {
        category.channels.forEach(channel => {
          preferencesData[channel.id] = channel.enabled;
        });
      });

      // Save to database
      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: preferencesData })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Preferences Updated',
        description: 'Your notification preferences have been saved.',
      });

      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose how and when you want to be notified</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map(category => (
          <div key={category.id} className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="mt-1">{category.icon}</div>
              <div className="flex-1 space-y-1">
                <h3 className="text-sm font-medium">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </div>
            <div className="space-y-2">
              {category.channels.map(channel => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center space-x-2">
                    {channel.icon}
                    <span className="text-sm">{channel.name}</span>
                  </div>
                  <Switch
                    checked={channel.enabled}
                    onCheckedChange={() => handleToggle(category.id, channel.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <Button className="w-full" onClick={handleSave} disabled={loading}>
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin mr-2 border-2 border-current border-t-transparent rounded-full" />
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
