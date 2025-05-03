import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface WellnessMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  trend: number;
}

interface WellnessData {
  date: string;
  metrics: WellnessMetric[];
}

export function WellnessTracking() {
  const [metrics, setMetrics] = useState<WellnessMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchWellnessData = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
      try {
        const response = await fetch('/api/wellness/metrics');
        if (!response?.ok) {
          throw new Error('Failed to fetch wellness data');
        }
        const data = await response?.json();
        setMetrics(data?.metrics);
        setChartData(data?.history);
      } catch (error) {
        console?.error('Error fetching wellness data:', error);
        toast?.error('Failed to load wellness data');
      } finally {
        setLoading(false);
      }
    };

    fetchWellnessData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics?.map((metric) => (
          <Card key={metric?.id}>
            <CardHeader>
              <CardTitle className="text-lg">{metric?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {metric?.value} {metric?.unit}
                  </span>
                  <span
                    className={`text-sm ${metric?.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {metric?.trend >= 0 ? '+' : ''}
                    {metric?.trend}%
                  </span>
                </div>
                <Progress value={(metric?.value / metric?.target) * 100} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Target: {metric?.target} {metric?.unit}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM d')} />
                <YAxis />
                <Tooltip labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')} />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
