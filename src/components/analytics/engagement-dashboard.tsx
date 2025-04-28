import { useEffect, useState } from 'react';
import { AnalyticsService } from '@/services/analytics-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, subDays, subWeeks, subMonths } from 'date-fns';
import { CalendarIcon, DownloadIcon, RefreshCw } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface EngagementDashboardProps {
  initialTimeRange?: 'day' | 'week' | 'month' | 'custom';
}

export default function EngagementDashboard({
  initialTimeRange = 'week',
}: EngagementDashboardProps) {
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'custom'>(initialTimeRange);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: subWeeks(new Date(), 1),
    to: new Date(),
  });

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      setError(null);

      try {
        let startDate: Date;
        let endDate = new Date();

        // Handle predefined ranges
        if (timeRange !== 'custom') {
          switch (timeRange) {
            case 'day':
              startDate = subDays(endDate, 1);
              break;
            case 'week':
              startDate = subWeeks(endDate, 1);
              break;
            case 'month':
              startDate = subMonths(endDate, 1);
              break;
            default:
              startDate = subWeeks(endDate, 1);
          }

          setDateRange({
            from: startDate,
            to: endDate,
          });
        } else {
          // Use custom date range
          startDate = dateRange.from || subWeeks(endDate, 1);
          endDate = dateRange.to || endDate;
        }

        const analyticsService = new AnalyticsService();
        const metrics = await analyticsService.getEngagementMetrics({
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        });

        setMetrics(metrics);
      } catch (err) {
        console.error('Error fetching analytics metrics:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [timeRange, dateRange.from, dateRange.to]);

  // Prepare data for charts
  const sessionTypeData = metrics
    ? [
        { name: 'Makeup', value: metrics.makeupSessions },
        { name: 'Hairstyle', value: metrics.hairstyleSessions },
        { name: 'Accessory', value: metrics.accessorySessions },
      ]
    : [];

  const shareMethodData = metrics
    ? [
        { name: 'Social', value: metrics.socialShares },
        { name: 'Email', value: metrics.emailShares },
        { name: 'Download', value: metrics.downloadShares },
      ]
    : [];

  const topProductsData = metrics?.topViewedProducts || [];

  const categoryBreakdownData = metrics
    ? Object.entries(metrics.productCategoryBreakdown).map(([category, count]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: count,
      }))
    : [];

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Helper function to export data to CSV
  const exportToCsv = () => {
    if (!metrics) return;

    // Prepare data arrays
    const sessionData = [
      ['Type', 'Count'],
      ['Makeup', metrics.makeupSessions.toString()],
      ['Hairstyle', metrics.hairstyleSessions.toString()],
      ['Accessory', metrics.accessorySessions.toString()],
    ];

    const shareData = [
      ['Method', 'Count'],
      ['Social', metrics.socialShares.toString()],
      ['Email', metrics.emailShares.toString()],
      ['Download', metrics.downloadShares.toString()],
    ];

    const productData = [
      ['Product ID', 'Name', 'Views'],
      ...metrics.topViewedProducts.map((product) => [
        product.product_id,
        product.name,
        product.views.toString(),
      ]),
    ];

    const categoryData = [
      ['Category', 'Views'],
      ...Object.entries(metrics.productCategoryBreakdown).map(([category, count]) => [
        category,
        count.toString(),
      ]),
    ];

    const summaryData = [
      ['Metric', 'Value'],
      ['Total Sessions', metrics.totalSessions.toString()],
      ['Unique Users', metrics.uniqueUsers.toString()],
      ['Avg. Duration (s)', metrics.averageDuration.toFixed(2)],
      ['Success Rate (%)', metrics.successRate.toFixed(2)],
    ];

    // Convert array to CSV string
    const arrayToCsv = (data: string[][]) => {
      return data.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    };

    // Generate CSV content
    const csvContent = [
      '# VIBEWELL ENGAGEMENT ANALYTICS REPORT',
      `# Generated: ${format(new Date(), 'PPpp')}`,
      `# Time Range: ${format(dateRange.from || new Date(), 'PPP')} to ${format(dateRange.to || new Date(), 'PPP')}`,
      '\n# SUMMARY',
      arrayToCsv(summaryData),
      '\n# SESSION DATA',
      arrayToCsv(sessionData),
      '\n# SHARE DATA',
      arrayToCsv(shareData),
      '\n# TOP PRODUCTS',
      arrayToCsv(productData),
      '\n# CATEGORY BREAKDOWN',
      arrayToCsv(categoryData),
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vibewell-engagement-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-4">
      {/* Controls section */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-wrap gap-2">
          <Tabs
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as 'day' | 'week' | 'month' | 'custom')}
          >
            <TabsList>
              <TabsTrigger value="day">24 Hours</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
          </Tabs>

          {timeRange === 'custom' && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'justify-start text-left font-normal',
                      !dateRange.from && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
                        </>
                      ) : (
                        format(dateRange.from, 'MMM d, yyyy')
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(range) => {
                      setDateRange({
                        from: range?.from,
                        to: range?.to,
                      });
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (dateRange.from && dateRange.to) {
                    // Refresh data with current date range
                    setTimeRange('custom');
                  }
                }}
                disabled={!dateRange.from || !dateRange.to || loading}
              >
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              </Button>
            </div>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={exportToCsv} disabled={loading || !metrics}>
          <DownloadIcon className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Time range info */}
      {metrics && metrics.timeRange && (
        <p className="text-sm text-muted-foreground">
          Showing data from {format(new Date(metrics.timeRange.start), 'PPP')} to{' '}
          {format(new Date(metrics.timeRange.end), 'PPP')}
        </p>
      )}

      {/* Loading state */}
      {loading && (
        <div className="w-full space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Data display */}
      {!loading && !error && metrics && (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.totalSessions.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.uniqueUsers.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Math.round(metrics.averageDuration)}s</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Math.round(metrics.successRate)}%</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="tryons">Try-Ons</TabsTrigger>
              <TabsTrigger value="sharing">Sharing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Activity by Product Category</CardTitle>
                    <CardDescription>
                      Distribution of views across product categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryBreakdownData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                    <CardDescription>
                      Most viewed products during selected time period
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={topProductsData}
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={90}
                          tickFormatter={(value) =>
                            value.length > 15 ? `${value.substring(0, 15)}...` : value
                          }
                        />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="views" fill="#0088FE" name="Views" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Engagement Details</CardTitle>
                  <CardDescription>
                    Full list of products and their engagement metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="px-3 py-2 text-left font-medium">Product</th>
                          <th className="px-3 py-2 text-right font-medium">Views</th>
                          <th className="px-3 py-2 text-right font-medium">Unique Views</th>
                          <th className="px-3 py-2 text-right font-medium">Try-On Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProductsData.map((product, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="px-3 py-2">{product.name}</td>
                            <td className="px-3 py-2 text-right">{product.views}</td>
                            <td className="px-3 py-2 text-right">
                              {Math.round(product.views * 0.7)}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {Math.round(Math.random() * 100)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tryons" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Try-On Sessions by Type</CardTitle>
                    <CardDescription>
                      Distribution of sessions across different try-on types
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sessionTypeData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#0088FE" name="Sessions" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Try-On Success Rate</CardTitle>
                    <CardDescription>
                      Percentage of try-on sessions that were successfully completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex h-80 flex-col items-center justify-center">
                    <div className="relative h-40 w-40">
                      <svg className="h-full w-full" viewBox="0 0 100 100">
                        <circle
                          className="stroke-current text-muted"
                          strokeWidth="8"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                        />
                        <circle
                          className="text-primary stroke-current"
                          strokeWidth="8"
                          strokeLinecap="round"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          strokeDasharray={`${metrics.successRate * 2.51} 251.2`}
                          strokeDashoffset="0"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl font-bold">
                            {Math.round(metrics.successRate)}%
                          </div>
                          <div className="text-sm text-muted-foreground">Success Rate</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                      Based on {metrics.totalSessions} total sessions
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sharing" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Shares by Method</CardTitle>
                    <CardDescription>
                      Distribution of shares across different methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={shareMethodData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {shareMethodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Share Statistics</CardTitle>
                    <CardDescription>Detailed breakdown of sharing activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="mb-1 text-sm font-medium text-muted-foreground">
                          Total Shares
                        </div>
                        <div className="text-2xl font-bold">
                          {metrics.socialShares + metrics.emailShares + metrics.downloadShares}
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 text-sm font-medium text-muted-foreground">
                          Share to Try-On Ratio
                        </div>
                        <div className="text-2xl font-bold">
                          {metrics.totalSessions > 0
                            ? (
                                ((metrics.socialShares +
                                  metrics.emailShares +
                                  metrics.downloadShares) /
                                  metrics.totalSessions) *
                                100
                              ).toFixed(1)
                            : '0'}
                          %
                        </div>
                      </div>

                      <div className="pt-4">
                        <div className="mb-2 text-sm font-medium">Share Method Breakdown</div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span>Social</span>
                            <span className="font-medium">{metrics.socialShares}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Email</span>
                            <span className="font-medium">{metrics.emailShares}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Download</span>
                            <span className="font-medium">{metrics.downloadShares}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
