import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface MetricsData {
  timestamp: string;
  views: number;
  interactions: number;
  conversions: number;
  errors: number;
  conversionRate: number;
}

export function RealTimeMetrics() {
  const [metricsHistory, setMetricsHistory] = useState<MetricsData[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let ws: WebSocket;

    const connectWebSocket = () => {
      ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');

      ws.onopen = () => {
        setIsConnected(true);
        console.log('Connected to analytics websocket');
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMetricsHistory(prev => {
          const newHistory = [...prev, {
            timestamp: format(new Date(data.timestamp), 'HH:mm:ss'),
            ...data.metrics
          }].slice(-50); // Keep last 50 data points
          return newHistory;
        });
        setLastUpdated(new Date());
      };
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const exportData = () => {
    const csv = [
      ['Timestamp', 'Views', 'Interactions', 'Conversions', 'Errors', 'Conversion Rate'],
      ...metricsHistory.map(data => [
        data.timestamp,
        data.views,
        data.interactions,
        data.conversions,
        data.errors,
        `${data.conversionRate.toFixed(2)}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Real-Time Analytics</CardTitle>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {format(lastUpdated, 'HH:mm:ss')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <Button variant="outline" size="icon" onClick={exportData}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
            <TabsTrigger value="conversions">Conversions</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="h-[400px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="#2563eb" name="Views" />
                  <Line type="monotone" dataKey="interactions" stroke="#16a34a" name="Interactions" />
                  <Line type="monotone" dataKey="conversions" stroke="#9333ea" name="Conversions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="interactions">
            <div className="h-[400px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="interactions" stroke="#16a34a" name="Interactions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="conversions">
            <div className="h-[400px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="conversions" stroke="#9333ea" name="Conversions" />
                  <Line type="monotone" dataKey="conversionRate" stroke="#f59e0b" name="Conversion Rate (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="errors">
            <div className="h-[400px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="errors" stroke="#dc2626" name="Errors" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 