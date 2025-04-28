'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/Button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  LineChart, BarChart, PieChart, Line, Bar, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import { 
  TrendingUpIcon, UsersIcon, CalendarIcon, 
  CurrencyDollarIcon, ChartBarIcon, ClockIcon,
  ArrowDownTrayIcon, SparklesIcon, ChartPieIcon,
  DocumentReportIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  revenue: {
    total: number;
    history: Array<{ date: string; amount: number }>;
  };
  bookings: {
    total: number;
    history: Array<{ date: string; count: number }>;
  };
  clients: {
    total: number;
    new: number;
    returning: number;
  };
  services: {
    popular: Array<{ name: string; bookings: number }>;
    revenue: Array<{ name: string; revenue: number }>;
  };
  peakHours: Array<{ hour: number; bookings: number }>;
  staffPerformance: Array<{
    name: string;
    bookings: number;
    revenue: number;
    rating: number;
    utilization: number;
  }>;
}

interface PredictiveAnalytics {
  revenueProjection: number;
  clientGrowthRate: number;
  recommendedServices: Array<{
    name: string;
    potential: number;
  }>;
  peakTimesPrediction: Array<{
    hour: number;
    predictedBookings: number;
  }>;
}

interface MarketingMetrics {
  acquisitionCost: number;
  customerLifetimeValue: number;
  marketingRoi: number;
  channelPerformance: Array<{
    channel: string;
    clients: number;
    conversion: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const [reportType, setReportType] = useState('pdf');

  // Mock data for demonstration
  const analyticsData: AnalyticsData = {
    revenue: {
      total: 15780,
      history: [
        { date: '2024-01', amount: 12500 },
        { date: '2024-02', amount: 13800 },
        { date: '2024-03', amount: 15780 }
      ]
    },
    bookings: {
      total: 245,
      history: [
        { date: '2024-01', count: 80 },
        { date: '2024-02', count: 85 },
        { date: '2024-03', count: 90 }
      ]
    },
    clients: {
      total: 150,
      new: 45,
      returning: 105
    },
    services: {
      popular: [
        { name: 'Haircut', bookings: 45 },
        { name: 'Manicure', bookings: 38 },
        { name: 'Facial', bookings: 32 }
      ],
      revenue: [
        { name: 'Haircut', revenue: 4500 },
        { name: 'Manicure', revenue: 3800 },
        { name: 'Facial', revenue: 3200 }
      ]
    },
    peakHours: [
      { hour: 9, bookings: 25 },
      { hour: 10, bookings: 35 },
      { hour: 11, bookings: 45 },
      { hour: 12, bookings: 40 },
      { hour: 13, bookings: 30 },
      { hour: 14, bookings: 35 },
      { hour: 15, bookings: 40 },
      { hour: 16, bookings: 45 },
      { hour: 17, bookings: 35 }
    ],
    staffPerformance: [
      {
        name: 'John Doe',
        bookings: 85,
        revenue: 8500,
        rating: 4.8,
        utilization: 0.85
      },
      {
        name: 'Jane Smith',
        bookings: 75,
        revenue: 7500,
        rating: 4.9,
        utilization: 0.80
      }
    ]
  };

  const predictiveData: PredictiveAnalytics = {
    revenueProjection: 18500,
    clientGrowthRate: 15.3,
    recommendedServices: [
      { name: 'Spa Package', potential: 85 },
      { name: 'Hair Treatment', potential: 78 },
      { name: 'Facial Package', potential: 72 }
    ],
    peakTimesPrediction: [
      { hour: 10, predictedBookings: 25 },
      { hour: 14, predictedBookings: 32 },
      { hour: 16, predictedBookings: 28 }
    ]
  };

  const marketingMetrics: MarketingMetrics = {
    acquisitionCost: 45.20,
    customerLifetimeValue: 850,
    marketingRoi: 285,
    channelPerformance: [
      { channel: 'Social Media', clients: 45, conversion: 3.2 },
      { channel: 'Email', clients: 32, conversion: 4.5 },
      { channel: 'Referral', clients: 28, conversion: 8.1 }
    ]
  };

  const handleExport = async () => {
    // Implementation for report export would go here
    console.log(`Exporting ${reportType} report...`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analyticsData.revenue.total}</div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Bookings</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.bookings.total}</div>
                <p className="text-xs text-muted-foreground">
                  +5.9% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>New Clients</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.clients.new}</div>
                <p className="text-xs text-muted-foreground">
                  +2.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Retention</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((analyticsData.clients.returning / analyticsData.clients.total) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  +1.2% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueChart data={analyticsData.revenue.history} />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Popular Services</CardTitle>
              </CardHeader>
              <CardContent>
                <PopularServicesChart data={analyticsData.services.popular} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 