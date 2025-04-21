import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, BarChart, PieChart } from '@/components/ui/charts';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { downloadCSV } from '@/lib/utils/export';

interface BusinessAnalytics {
  revenue: {
    total: number;
    trend: Array<{ date: string; amount: number }>;
    byService: Array<{ service: string; amount: number }>;
  };
  bookings: {
    total: number;
    trend: Array<{ date: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    satisfaction: number;
  };
}

interface Props {
  businessId: string;
}

export const BusinessAnalyticsDashboard: React.FC<Props> = ({ businessId }) => {
  const [period, setPeriod] = useState('WEEKLY');
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [businessId, period, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/business/${businessId}/analytics?period=${period}&start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}`
      );
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportAnalytics = () => {
    if (!analytics) return;

    const data = [
      ['Date', 'Revenue', 'Bookings', 'New Customers'],
      ...analytics.revenue.trend.map((item, index) => [
        item.date,
        item.amount,
        analytics.bookings.trend[index].count,
        0, // Map customer data accordingly
      ]),
    ];

    downloadCSV(data, `business-analytics-${period.toLowerCase()}`);
  };

  if (!analytics) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Business Analytics</h2>
        <div className="flex space-x-4">
          <Select
            value={period}
            onValueChange={value => setPeriod(value)}
            options={[
              { label: 'Daily', value: 'DAILY' },
              { label: 'Weekly', value: 'WEEKLY' },
              { label: 'Monthly', value: 'MONTHLY' },
              { label: 'Yearly', value: 'YEARLY' },
            ]}
          />
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button onClick={exportAnalytics}>Export Data</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Total revenue and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.revenue.total}</div>
            <LineChart data={analytics.revenue.trend} xKey="date" yKey="amount" color="green" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
            <CardDescription>Booking statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.bookings.total}</div>
            <BarChart data={analytics.bookings.trend} xKey="date" yKey="count" color="blue" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>Customer metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-xl font-bold">{analytics.customers.total}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">New</div>
                <div className="text-xl font-bold">{analytics.customers.new}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Returning</div>
                <div className="text-xl font-bold">{analytics.customers.returning}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Satisfaction</div>
                <div className="text-xl font-bold">{analytics.customers.satisfaction}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="services">Services Performance</TabsTrigger>
          <TabsTrigger value="customer">Customer Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Service</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart data={analytics.revenue.byService} nameKey="service" valueKey="amount" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Bookings by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart data={analytics.bookings.byStatus} nameKey="status" valueKey="count" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer">
          <Card>
            <CardHeader>
              <CardTitle>Customer Retention</CardTitle>
            </CardHeader>
            <CardContent>{/* Add customer retention visualization */}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
