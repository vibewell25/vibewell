import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Info, Lightbulb, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Insight {
  id: string;
  type: 'security' | 'usage' | 'recommendation';
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ActivityInsights() {
  const insights: Insight[] = [
    {
      id: 'security',
      type: 'security',
      title: 'Enhanced Security Recommended',
      description:
        'Your account has shown activity from multiple locations. Consider enabling two-factor authentication for additional security.',
      icon: <Shield className="h-5 w-5" />,
      action: {
        label: 'Enable 2FA',
        onClick: () => {
          // Handle 2FA enablement
        },
      },
    },
    {
      id: 'usage',
      type: 'usage',
      title: 'High Activity Period',
      description:
        "You're most active between 9 AM and 5 PM. Consider scheduling important tasks during these hours.",
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: 'recommendation',
      type: 'recommendation',
      title: 'Activity Optimization',
      description:
        'Based on your usage patterns, we recommend reviewing your notification settings to reduce unnecessary alerts.',
      icon: <Lightbulb className="h-5 w-5" />,
      action: {
        label: 'Review Settings',
        onClick: () => {
          // Handle settings review
        },
      },
    },
  ];

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'security':
        return 'text-red-500';
      case 'usage':
        return 'text-blue-500';
      case 'recommendation':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Insights</CardTitle>
        <CardDescription>
          Personalized insights and recommendations based on your account activity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {insights.map(insight => (
          <div key={insight.id} className="flex items-start space-x-4 rounded-lg border p-4">
            <div className={`mt-1 ${getInsightColor(insight.type)}`}>{insight.icon}</div>
            <div className="flex-1 space-y-2">
              <h3 className="text-sm font-medium">{insight.title}</h3>
              <p className="text-sm text-muted-foreground">{insight.description}</p>
              {insight.action && (
                <Button variant="outline" size="sm" onClick={insight.action.onClick}>
                  {insight.action.label}
                </Button>
              )}
            </div>
          </div>
        ))}

        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4" />
            <span className="text-sm font-medium">Did You Know?</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Regular review of your account activity can help identify potential security issues and
            optimize your usage patterns.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
