import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BellOff, Mail, Smartphone, Globe, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface AlertSetting {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  channels: {
    id: string;
    name: string;
    icon: React.ReactNode;
    enabled: boolean;
  }[];
}

export function ActivityAlerts() {
  const [settings, setSettings] = useState<AlertSetting[]>([
    {
      id: "login",
      title: "Login Alerts",
      description: "Get notified when someone logs into your account",
      icon: <Globe className="h-5 w-5" />,
      enabled: true,
      channels: [
        {
          id: "email_login",
          name: "Email",
          icon: <Mail className="h-4 w-4" />,
          enabled: true,
        },
        {
          id: "push_login",
          name: "Push",
          icon: <Bell className="h-4 w-4" />,
          enabled: true,
        },
      ],
    },
    {
      id: "security",
      title: "Security Alerts",
      description: "Get notified about security-related events",
      icon: <AlertTriangle className="h-5 w-5" />,
      enabled: true,
      channels: [
        {
          id: "email_security",
          name: "Email",
          icon: <Mail className="h-4 w-4" />,
          enabled: true,
        },
        {
          id: "push_security",
          name: "Push",
          icon: <Bell className="h-4 w-4" />,
          enabled: true,
        },
        {
          id: "sms_security",
          name: "SMS",
          icon: <Smartphone className="h-4 w-4" />,
          enabled: false,
        },
      ],
    },
  ]);

  const handleToggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((setting) => {
        if (setting.id === id) {
          return { ...setting, enabled: !setting.enabled };
        }
        return setting;
      })
    );
  };

  const handleToggleChannel = (settingId: string, channelId: string) => {
    setSettings((prev) =>
      prev.map((setting) => {
        if (setting.id === settingId) {
          return {
            ...setting,
            channels: setting.channels.map((channel) => {
              if (channel.id === channelId) {
                return { ...channel, enabled: !channel.enabled };
              }
              return channel;
            }),
          };
        }
        return setting;
      })
    );
  };

  const handleSave = async () => {
    try {
      // Simulate save process
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Updated",
        description: "Your alert preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update alert preferences.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Alerts</CardTitle>
        <CardDescription>
          Configure how you want to be notified about account activity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {settings.map((setting) => (
          <div key={setting.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="rounded-lg bg-muted p-2">
                  {setting.icon}
                </div>
                <div>
                  <h3 className="text-sm font-medium">{setting.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
              </div>
              <Switch
                checked={setting.enabled}
                onCheckedChange={() => handleToggleSetting(setting.id)}
              />
            </div>

            {setting.enabled && (
              <div className="ml-8 space-y-4">
                {setting.channels.map((channel) => (
                  <div
                    key={channel.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      {channel.icon}
                      <Label htmlFor={channel.id}>{channel.name}</Label>
                    </div>
                    <Switch
                      id={channel.id}
                      checked={channel.enabled}
                      onCheckedChange={() =>
                        handleToggleChannel(setting.id, channel.id)
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <Button className="w-full" onClick={handleSave}>
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
} 