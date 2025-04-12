import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";

interface ActivityPattern {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  data: {
    label: string;
    value: number;
  }[];
}

export function ActivityPatterns() {
  const patterns: ActivityPattern[] = [
    {
      id: "daily",
      title: "Daily Activity Pattern",
      description: "Your typical activity throughout the day",
      icon: <Clock className="h-5 w-5" />,
      data: [
        { label: "12 AM", value: 2 },
        { label: "3 AM", value: 0 },
        { label: "6 AM", value: 5 },
        { label: "9 AM", value: 12 },
        { label: "12 PM", value: 18 },
        { label: "3 PM", value: 15 },
        { label: "6 PM", value: 10 },
        { label: "9 PM", value: 8 },
      ],
    },
    {
      id: "weekly",
      title: "Weekly Activity Pattern",
      description: "Your activity distribution across the week",
      icon: <Calendar className="h-5 w-5" />,
      data: [
        { label: "Mon", value: 25 },
        { label: "Tue", value: 30 },
        { label: "Wed", value: 28 },
        { label: "Thu", value: 32 },
        { label: "Fri", value: 35 },
        { label: "Sat", value: 20 },
        { label: "Sun", value: 15 },
      ],
    },
  ];

  const getMaxValue = (data: ActivityPattern["data"]) => {
    return Math.max(...data.map((item) => item.value));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Patterns</CardTitle>
        <CardDescription>
          View your account activity patterns and trends over time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {patterns.map((pattern) => {
          const maxValue = getMaxValue(pattern.data);
          return (
            <div key={pattern.id} className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="rounded-lg bg-muted p-2">
                  {pattern.icon}
                </div>
                <div>
                  <h3 className="text-sm font-medium">{pattern.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {pattern.description}
                  </p>
                </div>
              </div>

              <div className="flex h-32 items-end space-x-2">
                {pattern.data.map((item) => (
                  <div
                    key={item.label}
                    className="flex-1 space-y-2 text-center"
                  >
                    <div
                      className="w-full rounded-t bg-primary/20"
                      style={{
                        height: `${(item.value / maxValue) * 100}%`,
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Trend Analysis</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Your activity shows a consistent pattern with peak usage during
            business hours (9 AM - 5 PM) and lower activity during weekends.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 