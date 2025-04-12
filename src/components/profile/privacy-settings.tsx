import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase/client";
import {
  Lock,
  Users,
  Globe,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";

interface PrivacySetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  visibility: "public" | "private" | "friends";
  icon: React.ReactNode;
}

interface PrivacySettingsProps {
  userId: string;
  initialSettings?: Partial<Record<string, any>>;
  onSave?: () => void;
}

export function PrivacySettings({ userId, initialSettings, onSave }: PrivacySettingsProps) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<PrivacySetting[]>([
    {
      id: "profile",
      label: "Profile Visibility",
      description: "Control who can see your profile information",
      enabled: initialSettings?.profile_enabled ?? true,
      visibility: initialSettings?.profile_visibility ?? "public",
      icon: <Globe className="h-4 w-4" />,
    },
    {
      id: "activity",
      label: "Activity Feed",
      description: "Control who can see your activity",
      enabled: initialSettings?.activity_enabled ?? true,
      visibility: initialSettings?.activity_visibility ?? "friends",
      icon: <Eye className="h-4 w-4" />,
    },
    {
      id: "connections",
      label: "Social Connections",
      description: "Control who can see your social connections",
      enabled: initialSettings?.connections_enabled ?? true,
      visibility: initialSettings?.connections_visibility ?? "friends",
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: "location",
      label: "Location Sharing",
      description: "Control who can see your location",
      enabled: initialSettings?.location_enabled ?? false,
      visibility: initialSettings?.location_visibility ?? "private",
      icon: <Globe className="h-4 w-4" />,
    },
  ]);

  const handleToggle = async (settingId: string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === settingId
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  };

  const handleVisibilityChange = async (settingId: string, value: string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === settingId
          ? { ...setting, visibility: value as "public" | "private" | "friends" }
          : setting
      )
    );
  };

  const getVisibilityIcon = (visibility: PrivacySetting["visibility"]) => {
    switch (visibility) {
      case "public":
        return <Globe className="h-4 w-4 text-green-500" />;
      case "friends":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "private":
        return <Lock className="h-4 w-4 text-red-500" />;
    }
  };

  const handleSave = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is required to save settings",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Convert settings to a format suitable for database storage
      const privacyData: Record<string, any> = {};
      
      settings.forEach(
        (setting) => {
          privacyData[`${setting.id}_enabled`] = setting.enabled;
          privacyData[`${setting.id}_visibility`] = setting.visibility;
        }
      );
      
      // Save to database
      const { error } = await supabase
        .from('profiles')
        .update(privacyData)
        .eq('id', userId);
        
      if (error) throw error;
      
      toast({
        title: "Settings Updated",
        description: "Your privacy settings have been saved.",
      });
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to update privacy settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {settings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  {setting.icon}
                </div>
                <div>
                  <h4 className="font-medium">{setting.label}</h4>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id={setting.id}
                    checked={setting.enabled}
                    onCheckedChange={() => handleToggle(setting.id)}
                  />
                  <Label htmlFor={setting.id}>
                    {setting.enabled ? "Enabled" : "Disabled"}
                  </Label>
                </div>

                {setting.enabled && (
                  <div className="flex items-center gap-2">
                    {getVisibilityIcon(setting.visibility)}
                    <Select
                      value={setting.visibility}
                      onValueChange={(value) =>
                        handleVisibilityChange(setting.id, value)
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <Button 
          className="w-full" 
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin mr-2 border-2 border-current border-t-transparent rounded-full" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 