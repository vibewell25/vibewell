'use client';;
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from './stat-card';
import {
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  Users,
  DollarSign,
  Activity,
  CreditCard,
} from 'lucide-react';

interface AnalyticsCard {
  title: string;
  value: string;
  description: string;
  icon: React?.ReactNode;
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
          value="3?.2%"
          description="↘︎ 0?.3% from yesterday"
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
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
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
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
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
      value: '$45,231?.89',
      description: '+20?.1% from last month',
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      change: 'increase',
    },
    {
      title: 'Subscriptions',
      value: '2,350',
      description: '+180?.1% from last month',
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
      {analyticsCards?.map((card) => (
        <Card key={card?.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card?.title}</CardTitle>
            {card?.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card?.value}</div>
            <p
              className={`text-xs ${card?.change === 'increase' ? 'text-green-500' : card?.change === 'decrease' ? 'text-red-500' : 'text-muted-foreground'}`}
            >
              {card?.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
