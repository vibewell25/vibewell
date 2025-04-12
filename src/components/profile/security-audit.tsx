import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Key, AlertTriangle, CheckCircle2, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SecurityEvent {
  id: string;
  type: "login" | "password_change" | "2fa" | "security" | "device";
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  device?: string;
  status: "success" | "warning" | "error";
}

export function SecurityAudit() {
  const securityEvents: SecurityEvent[] = [
    {
      id: "1",
      type: "login",
      title: "Successful Login",
      description: "You logged in from a new device",
      timestamp: "2024-03-20T10:00:00Z",
      location: "New York, US",
      device: "iPhone 13",
      status: "success",
    },
    {
      id: "2",
      type: "password_change",
      title: "Password Changed",
      description: "Your password was successfully updated",
      timestamp: "2024-03-19T15:30:00Z",
      status: "success",
    },
    {
      id: "3",
      type: "2fa",
      title: "Two-Factor Authentication",
      description: "2FA was enabled for your account",
      timestamp: "2024-03-18T09:15:00Z",
      status: "success",
    },
    {
      id: "4",
      type: "security",
      title: "Security Alert",
      description: "Unusual login attempt detected",
      timestamp: "2024-03-17T22:45:00Z",
      location: "London, UK",
      device: "Unknown",
      status: "warning",
    },
    {
      id: "5",
      type: "device",
      title: "New Device",
      description: "A new device was added to your account",
      timestamp: "2024-03-16T14:20:00Z",
      device: "MacBook Pro",
      status: "success",
    },
  ];

  const getEventIcon = (type: SecurityEvent["type"]) => {
    switch (type) {
      case "login":
        return <Shield className="h-5 w-5" />;
      case "password_change":
        return <Key className="h-5 w-5" />;
      case "2fa":
        return <Lock className="h-5 w-5" />;
      case "security":
        return <AlertTriangle className="h-5 w-5" />;
      case "device":
        return <CheckCircle2 className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: SecurityEvent["status"]) => {
    switch (status) {
      case "success":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Audit Log</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {securityEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-start space-x-4 rounded-lg border p-4"
          >
            <div className={`mt-1 ${getStatusColor(event.status)}`}>
              {getEventIcon(event.type)}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(event.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {event.description}
              </p>
              {(event.location || event.device) && (
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  {event.location && (
                    <span className="flex items-center">
                      <Globe className="mr-1 h-3 w-3" />
                      {event.location}
                    </span>
                  )}
                  {event.device && (
                    <span className="flex items-center">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      {event.device}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 