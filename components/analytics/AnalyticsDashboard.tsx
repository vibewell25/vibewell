'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
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
    trend: number;
    history: Array<{ date: string; amount: number }>;
  };
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    history: Array<{ date: string; count: number }>;
  };
  clients: {
    total: number;
    new: number;
    returning: number;
    churnRate: number;
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
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date()
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [reportType, setReportType] = useState('pdf');

  // Mock data - In production, this would come from your API
  const analyticsData: AnalyticsData = {
    revenue: {
      total: 15780,
      trend: 12.5,
      history: [
        { date: '2024-01', amount: 12500 },
        { date: '2024-02', amount: 13800 },
        { date: '2024-03', amount: 15780 }
      ]
    },
    appointments: {
      total: 245,
      completed: 220,
      cancelled: 15,
      noShow: 10,
      history: [
        { date: '2024-01', count: 80 },
        { date: '2024-02', count: 85 },
        { date: '2024-03', count: 90 }
      ]
    },
    clients: {
      total: 150,
      new: 25,
      returning: 125,
      churnRate: 5.2
    },
    services: {
      popular: [
        { name: 'Haircut', bookings: 45 },
        { name: 'Manicure', bookings: 38 },
        { name: 'Facial', bookings: 32 }
      ],
      revenue: [
        { name: 'Haircut', revenue: 2250 },
        { name: 'Manicure', revenue: 1520 },
        { name: 'Facial', revenue: 1920 }
      ]
    },
    peakHours: [
      { hour: 9, bookings: 15 },
      { hour: 10, bookings: 22 },
      { hour: 11, bookings: 28 },
      { hour: 12, bookings: 20 },
      { hour: 13, bookings: 18 },
      { hour: 14, bookings: 25 },
      { hour: 15, bookings: 30 },
      { hour: 16, bookings: 24 },
      { hour: 17, bookings: 20 }
    ],
    staffPerformance: [
      { name: 'John Doe', bookings: 45, revenue: 4500, rating: 4.8 },
      { name: 'Jane Smith', bookings: 38, revenue: 3800, rating: 4.9 },
      { name: 'Mike Johnson', bookings: 42, revenue: 4200, rating: 4.7 }
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF Report</SelectItem>
              <SelectItem value="excel">Excel Export</SelectItem>
              <SelectItem value="csv">CSV Export</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export Report
          </Button>
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onChange={({ from, to }) => setDateRange({ from, to })}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="predictive">Predictive</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analyticsData.revenue.total}</div>
                <p className="text-xs text-muted-foreground">
                  +{analyticsData.revenue.trend}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.appointments.total}</div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData.appointments.completed} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.clients.total}</div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData.clients.new} new this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.clients.churnRate}%</div>
                <p className="text-xs text-muted-foreground">Monthly average</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.revenue.history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="bookings" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUpIcon, 
  UsersIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  revenue: {
    total: number;
    trend: number;
    history: Array<{ date: string; amount: number }>;
  };
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    history: Array<{ date: string; count: number }>;
  };
  clients: {
    total: number;
    new: number;
    returning: number;
    churnRate: number;
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
  }>;
}

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date()
  });
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - In production, this would come from your API
  const analyticsData: AnalyticsData = {
    revenue: {
      total: 15780,
      trend: 12.5,
      history: [
        { date: '2024-01', amount: 12500 },
        { date: '2024-02', amount: 13800 },
        { date: '2024-03', amount: 15780 }
      ]
    },
    appointments: {
      total: 245,
      completed: 220,
      cancelled: 15,
      noShow: 10,
      history: [
        { date: '2024-01', count: 80 },
        { date: '2024-02', count: 85 },
        { date: '2024-03', count: 90 }
      ]
    },
    clients: {
      total: 150,
      new: 25,
      returning: 125,
      churnRate: 5.2
    },
    services: {
      popular: [
        { name: 'Haircut', bookings: 45 },
        { name: 'Manicure', bookings: 38 },
        { name: 'Facial', bookings: 32 }
      ],
      revenue: [
        { name: 'Haircut', revenue: 2250 },
        { name: 'Manicure', revenue: 1520 },
        { name: 'Facial', revenue: 1920 }
      ]
    },
    peakHours: [
      { hour: 9, bookings: 15 },
      { hour: 10, bookings: 22 },
      { hour: 11, bookings: 28 },
      { hour: 12, bookings: 20 },
      { hour: 13, bookings: 18 },
      { hour: 14, bookings: 25 },
      { hour: 15, bookings: 30 },
      { hour: 16, bookings: 24 },
      { hour: 17, bookings: 20 }
    ],
    staffPerformance: [
      { name: 'John Doe', bookings: 45, revenue: 4500, rating: 4.8 },
      { name: 'Jane Smith', bookings: 38, revenue: 3800, rating: 4.9 },
      { name: 'Mike Johnson', bookings: 42, revenue: 4200, rating: 4.7 }
    ]
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <DateRangePicker
          from={dateRange.from}
          to={dateRange.to}
          onChange={({ from, to }) => setDateRange({ from, to })}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analyticsData.revenue.total}</div>
                <p className="text-xs text-muted-foreground">
                  +{analyticsData.revenue.trend}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.appointments.total}</div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData.appointments.completed} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.clients.total}</div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData.clients.new} new this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.clients.churnRate}%</div>
                <p className="text-xs text-muted-foreground">Monthly average</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.revenue.history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="bookings" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Staff Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Staff Member</th>
                      <th className="px-6 py-3">Bookings</th>
                      <th className="px-6 py-3">Revenue</th>
                      <th className="px-6 py-3">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.staffPerformance.map((staff) => (
                      <tr key={staff.name} className="bg-white border-b">
                        <td className="px-6 py-4">{staff.name}</td>
                        <td className="px-6 py-4">{staff.bookings}</td>
                        <td className="px-6 py-4">${staff.revenue}</td>
                        <td className="px-6 py-4">{staff.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional tab contents would go here */}
      </Tabs>
    </div>
  );
} 