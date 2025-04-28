import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { toast } from 'sonner';
import { Shield, Key, Lock, Bell, Smartphone, Mail } from 'lucide-react';

interface SecuritySetting {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'switch' | 'button' | 'input';
  value?: boolean | string;
  action?: () => Promise<void>;
}

export function SecuritySettings() {
  const [settings, setSettings] = useState<SecuritySetting[]>([
    {
      id: 'two-factor',
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      icon: <Shield className="h-5 w-5" />,
      type: 'switch',
      value: false,
      action: async () => {
        try {
          // Simulate API call to enable/disable 2FA
          await new Promise((resolve) => setTimeout(resolve, 1000));
          toast.success('Two-factor authentication updated successfully!');
        } catch (error) {
          console.error('Error updating 2FA:', error);
          toast.error('Failed to update two-factor authentication');
        }
      },
    },
    {
      id: 'password',
      title: 'Change Password',
      description: 'Update your account password',
      icon: <Key className="h-5 w-5" />,
      type: 'button',
      action: async () => {
        try {
          // Simulate API call to change password
          await new Promise((resolve) => setTimeout(resolve, 1000));
          toast.success('Password changed successfully!');
        } catch (error) {
          console.error('Error changing password:', error);
          toast.error('Failed to change password');
        }
      },
    },
    {
      id: 'login-alerts',
      title: 'Login Alerts',
      description: 'Get notified when someone logs into your account',
      icon: <Bell className="h-5 w-5" />,
      type: 'switch',
      value: true,
      action: async () => {
        try {
          // Simulate API call to update login alerts
          await new Promise((resolve) => setTimeout(resolve, 1000));
          toast.success('Login alerts updated successfully!');
        } catch (error) {
          console.error('Error updating login alerts:', error);
          toast.error('Failed to update login alerts');
        }
      },
    },
    {
      id: 'device-management',
      title: 'Device Management',
      description: 'View and manage your connected devices',
      icon: <Smartphone className="h-5 w-5" />,
      type: 'button',
      action: async () => {
        try {
          // Simulate API call to manage devices
          await new Promise((resolve) => setTimeout(resolve, 1000));
          toast.success('Device management updated successfully!');
        } catch (error) {
          console.error('Error managing devices:', error);
          toast.error('Failed to manage devices');
        }
      },
    },
    {
      id: 'security-questions',
      title: 'Security Questions',
      description: 'Set up security questions for account recovery',
      icon: <Lock className="h-5 w-5" />,
      type: 'button',
      action: async () => {
        try {
          // Simulate API call to set up security questions
          await new Promise((resolve) => setTimeout(resolve, 1000));
          toast.success('Security questions updated successfully!');
        } catch (error) {
          console.error('Error setting up security questions:', error);
          toast.error('Failed to set up security questions');
        }
      },
    },
    {
      id: 'email-verification',
      title: 'Email Verification',
      description: 'Verify your email address for security',
      icon: <Mail className="h-5 w-5" />,
      type: 'button',
      action: async () => {
        try {
          // Simulate API call to verify email
          await new Promise((resolve) => setTimeout(resolve, 1000));
          toast.success('Verification email sent!');
        } catch (error) {
          console.error('Error sending verification email:', error);
          toast.error('Failed to send verification email');
        }
      },
    },
  ]);

  const handleSettingChange = async (id: string, newValue?: boolean | string) => {
    try {
      const setting = settings.find((s) => s.id === id);
      if (setting?.action) {
        await setting.action();
        if (newValue !== undefined) {
          setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, value: newValue } : s)));
        }
      }
    } catch (error) {
      console.error('Error updating security setting:', error);
      toast.error('Failed to update security setting');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {settings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-start justify-between rounded-lg border p-4"
            >
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                  {setting.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">{setting.title}</h3>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {setting.type === 'switch' && (
                  <Switch
                    checked={setting.value as boolean}
                    onCheckedChange={(checked: boolean) => handleSettingChange(setting.id, checked)}
                  />
                )}
                {setting.type === 'button' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSettingChange(setting.id)}
                  >
                    Manage
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
