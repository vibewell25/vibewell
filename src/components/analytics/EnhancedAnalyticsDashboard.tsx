import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

type DataPoint = {
  name: string;
  value: number;
};

type TimeSeriesPoint = {
  date: string;
  value: number;
};

type CategoryData = {
  category: string;
  value: number;
  subCategories?: { name: string; value: number }[];
};

type AnalyticsData = {
  userEngagement: TimeSeriesPoint[];
  conversionRates: TimeSeriesPoint[];
  userRetention: TimeSeriesPoint[];
  userActivity: {
    daily: DataPoint[];
    weekly: DataPoint[];
    monthly: DataPoint[];
  };
  demographics: CategoryData[];
  contentPerformance: CategoryData[];
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#ffc658'];

const EnhancedAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() });
  const [timeFrame, setTimeFrame] = useState('daily');
  const [dataSegment, setDataSegment] = useState('all');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real implementation, this would call your API with the selected filters
        // const response = await fetch(`/api/analytics?from=${dateRange.from}&to=${dateRange.to}&timeFrame=${timeFrame}&segment=${dataSegment}`);
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockData: AnalyticsData = {
          userEngagement: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            value: Math.floor(Math.random() * 100) + 50,
          })),
          conversionRates: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            value: Math.random() * 0.2 + 0.05,
          })),
          userRetention: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            value: Math.random() * 0.4 + 0.4,
          })),
          userActivity: {
            daily: [
              { name: 'Posts', value: Math.floor(Math.random() * 200) + 100 },
              { name: 'Comments', value: Math.floor(Math.random() * 500) + 200 },
              { name: 'Likes', value: Math.floor(Math.random() * 1000) + 500 },
              { name: 'Shares', value: Math.floor(Math.random() * 100) + 50 },
            ],
            weekly: [
              { name: 'Posts', value: Math.floor(Math.random() * 1000) + 500 },
              { name: 'Comments', value: Math.floor(Math.random() * 2500) + 1000 },
              { name: 'Likes', value: Math.floor(Math.random() * 5000) + 2500 },
              { name: 'Shares', value: Math.floor(Math.random() * 500) + 250 },
            ],
            monthly: [
              { name: 'Posts', value: Math.floor(Math.random() * 4000) + 2000 },
              { name: 'Comments', value: Math.floor(Math.random() * 10000) + 5000 },
              { name: 'Likes', value: Math.floor(Math.random() * 20000) + 10000 },
              { name: 'Shares', value: Math.floor(Math.random() * 2000) + 1000 },
            ],
          },
          demographics: [
            { category: '18-24', value: 25, subCategories: [{ name: 'Male', value: 12 }, { name: 'Female', value: 13 }] },
            { category: '25-34', value: 35, subCategories: [{ name: 'Male', value: 17 }, { name: 'Female', value: 18 }] },
            { category: '35-44', value: 20, subCategories: [{ name: 'Male', value: 10 }, { name: 'Female', value: 10 }] },
            { category: '45-54', value: 10, subCategories: [{ name: 'Male', value: 5 }, { name: 'Female', value: 5 }] },
            { category: '55+', value: 10, subCategories: [{ name: 'Male', value: 4 }, { name: 'Female', value: 6 }] },
          ],
          contentPerformance: [
            { category: 'Health', value: 30 },
            { category: 'Fitness', value: 25 },
            { category: 'Nutrition', value: 20 },
            { category: 'Meditation', value: 15 },
            { category: 'Yoga', value: 10 },
          ],
        };
        
        setAnalyticsData(mockData);
      } catch (err) {
        setError('Failed to load analytics data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [dateRange, timeFrame, dataSegment]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading analytics data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analyticsData) {
    return (
      <Alert>
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>No analytics data is currently available.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Enhanced Analytics Dashboard</h1>
        <div className="flex space-x-2">
          <DateRangePicker date={dateRange} setDate={setDateRange} />
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dataSegment} onValueChange={setDataSegment}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Data Segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="new">New Users</SelectItem>
              <SelectItem value="returning">Returning Users</SelectItem>
              <SelectItem value="premium">Premium Users</SelectItem>
            </SelectContent>
          </Select>
          <Button>Export</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.userActivity.daily.reduce((acc, item) => acc + item.value, 0)}</div>
                <p className="text-xs text-muted-foreground">+2.5% from last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(analyticsData.conversionRates[analyticsData.conversionRates.length - 1]?.value * 100).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">+0.8% from last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(analyticsData.userRetention[analyticsData.userRetention.length - 1]?.value * 100).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">-1.2% from last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData.userActivity.daily.reduce((acc, item) => acc + item.value, 0)}
                </div>
                <p className="text-xs text-muted-foreground">+5.3% from last period</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement Trend</CardTitle>
                <CardDescription>Daily active users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={analyticsData.userEngagement}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>User Interactions</CardTitle>
                <CardDescription>Breakdown of user activity types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.userActivity[timeFrame]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily User Engagement</CardTitle>
              <CardDescription>Trend of user engagement metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analyticsData.userEngagement}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} name="User Count" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
                <CardDescription>User retention rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analyticsData.userRetention}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`} />
                      <Line type="monotone" dataKey="value" stroke="#82ca9d" name="Retention Rate" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>User Activity Breakdown</CardTitle>
                <CardDescription>Types of user interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.userActivity[timeFrame]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {analyticsData.userActivity[timeFrame].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Demographics</CardTitle>
              <CardDescription>Age distribution of users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.demographics}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gender Distribution</CardTitle>
              <CardDescription>Gender breakdown by age group</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.demographics}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="subCategories[0].value" stackId="a" fill="#8884d8" name="Male" />
                    <Bar dataKey="subCategories[1].value" stackId="a" fill="#82ca9d" name="Female" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>Engagement by content category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.contentPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.contentPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Engagement Metrics</CardTitle>
              <CardDescription>Detailed breakdown by content type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.contentPerformance}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Engagement Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Rate Trend</CardTitle>
              <CardDescription>Conversion rate over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analyticsData.conversionRates}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 0.3]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#ff7300" name="Conversion Rate" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(analyticsData.conversionRates.reduce((acc, item) => acc + item.value, 0) / analyticsData.conversionRates.length * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">+0.5% from last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Best Conversion Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData.conversionRates.reduce((best, current) => current.value > best.value ? current : best, { date: '', value: 0 }).date}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(analyticsData.conversionRates.reduce((best, current) => current.value > best.value ? current : best, { date: '', value: 0 }).value * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Conversion Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(
                    (analyticsData.conversionRates[analyticsData.conversionRates.length - 1]?.value / 
                    analyticsData.conversionRates[0]?.value - 1) * 100
                  ).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Month-over-month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAnalyticsDashboard; 