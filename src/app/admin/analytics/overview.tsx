'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from './stat-card';
import {
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  Users,
  DollarSign,
  Calendar,
  Activity,
  CreditCard,
} from 'lucide-react';
import { Bar, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const data = [
  { name: 'Jan', total: 1500 },
  { name: 'Feb', total: 2300 },
  { name: 'Mar', total: 3200 },
  { name: 'Apr', total: 4300 },
  { name: 'May', total: 3800 },
  { name: 'Jun', total: 5900 },
  { name: 'Jul', total: 6800 },
  { name: 'Aug', total: 6300 },
  { name: 'Sep', total: 7500 },
  { name: 'Oct', total: 8100 },
  { name: 'Nov', total: 7300 },
  { name: 'Dec', total: 9200 },
];

const revenueData = [
  { name: 'Jan', value: 2400 },
  { name: 'Feb', value: 1398 },
  { name: 'Mar', value: 9800 },
  { name: 'Apr', value: 3908 },
  { name: 'May', value: 4800 },
  { name: 'Jun', value: 3800 },
  { name: 'Jul', value: 4300 },
];

const bookingsData = [
  { name: 'Jan', value: 40 },
  { name: 'Feb', value: 30 },
  { name: 'Mar', value: 60 },
  { name: 'Apr', value: 80 },
  { name: 'May', value: 70 },
  { name: 'Jun', value: 90 },
  { name: 'Jul', value: 100 },
];

const usersData = [
  { name: 'Jan', value: 100 },
  { name: 'Feb', value: 200 },
  { name: 'Mar', value: 300 },
  { name: 'Apr', value: 400 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 600 },
  { name: 'Jul', value: 700 },
];

const overviewData = [
  {
    name: 'Jan',
    bookings: 65,
    revenue: 3200,
  },
  {
    name: 'Feb',
    bookings: 59,
    revenue: 2900,
  },
  {
    name: 'Mar',
    bookings: 80,
    revenue: 4100,
  },
  {
    name: 'Apr',
    bookings: 81,
    revenue: 4300,
  },
  {
    name: 'May',
    bookings: 75,
    revenue: 3850,
  },
  {
    name: 'Jun',
    bookings: 82,
    revenue: 4250,
  },
  {
    name: 'Jul',
    bookings: 91,
    revenue: 4800,
  },
  {
    name: 'Aug',
    bookings: 87,
    revenue: 4500,
  },
  {
    name: 'Sep',
    bookings: 94,
    revenue: 5000,
  },
  {
    name: 'Oct',
    bookings: 88,
    revenue: 4600,
  },
  {
    name: 'Nov',
    bookings: 70,
    revenue: 3600,
  },
  {
    name: 'Dec',
    bookings: 78,
    revenue: 4000,
  },
];

interface AnalyticsCard {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  change?: string;
}

export function AnalyticsOverview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value="4,231"
          description="↗︎ 12% from last month"
          icon={<BarChartIcon className="h-4 w-4 text-muted-foreground" />}
          trend="up"
        />
        <StatCard
          title="Active Sessions"
          value="2,845"
          description="↗︎ 7% from last week"
          icon={<LineChartIcon className="h-4 w-4 text-muted-foreground" />}
          trend="up"
        />
        <StatCard
          title="Conversion Rate"
          value="3.2%"
          description="↘︎ 0.3% from yesterday"
          icon={<BarChartIcon className="h-4 w-4 text-muted-foreground" />}
          trend="down"
        />
        <StatCard
          title="Avg. Session"
          value="12m 24s"
          description="↗︎ 1m 12s from last week"
          icon={<LineChartIcon className="h-4 w-4 text-muted-foreground" />}
          trend="up"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>View your top traffic acquisition channels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Traffic source chart visualization
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
            <CardDescription>Daily active users over the past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              User engagement chart visualization
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function Overview() {
  const analyticsCards: AnalyticsCard[] = [
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      description: '+20.1% from last month',
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      change: 'increase',
    },
    {
      title: 'Subscriptions',
      value: '2,350',
      description: '+180.1% from last month',
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      change: 'increase',
    },
    {
      title: 'Sales',
      value: '+12,234',
      description: '+19% from last month',
      icon: <CreditCard className="h-4 w-4 text-muted-foreground" />,
      change: 'increase',
    },
    {
      title: 'Active Now',
      value: '573',
      description: '+201 since last hour',
      icon: <Activity className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {analyticsCards.map(card => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p
              className={`text-xs ${card.change === 'increase' ? 'text-green-500' : card.change === 'decrease' ? 'text-red-500' : 'text-muted-foreground'}`}
            >
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
