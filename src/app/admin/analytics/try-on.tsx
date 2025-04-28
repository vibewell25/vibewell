'use client';;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { TryOnService } from '@/services/try-on-service';
import { ProductService } from '@/services/product-service';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, subDays } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Loader, CalendarIcon, Download } from 'lucide-react';

// Color palette for charts
const COLORS = [
  '#4f46e5', // indigo-600
  '#2563eb', // blue-600
  '#7c3aed', // violet-600
  '#c026d3', // fuchsia-600
  '#ec4899', // pink-600
  '#10b981', // emerald-600
  '#0284c7', // sky-600
];

interface ProductInfo {
  id: string;
  name: string;
  category: string;
}

interface FeedbackStats {
  averageRating: number;
  wouldTryRealLifePercentage: number;
  feedbackCount: number;
  commentCount: number;
  ratingDistribution: { rating: number; count: number }[];
}

type DateRangeType = '7d' | '30d' | '90d' | '365d' | 'custom';

export default function TryOnAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('30d');
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [totalSessions, setTotalSessions] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [averageDuration, setAverageDuration] = useState(0);
  const [productBreakdown, setProductBreakdown] = useState<any[]>([]);
  const [productInfo, setProductInfo] = useState<Record<string, ProductInfo>>({});
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>({
    averageRating: 0,
    wouldTryRealLifePercentage: 0,
    feedbackCount: 0,
    commentCount: 0,
    ratingDistribution: [],
  });

  const tryOnService = new TryOnService();
  const productService = new ProductService();

  useEffect(() => {
    fetchData();
  }, [dateRangeType, customDateRange]);

  const getDateRange = (): { start: Date; end: Date } => {
    const end = new Date();
    let start = new Date();

    if (dateRangeType === 'custom' && customDateRange.from && customDateRange.to) {
      return {
        start: customDateRange.from,
        end: customDateRange.to,
      };
    }

    switch (dateRangeType) {
      case '7d':
        start = subDays(end, 7);
        break;
      case '30d':
        start = subDays(end, 30);
        break;
      case '90d':
        start = subDays(end, 90);
        break;
      case '365d':
        start = subDays(end, 365);
        break;
      default:
        start = subDays(end, 30);
    }

    return { start, end };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange();

      // Fetch analytics data
      const analytics = await tryOnService.getAnalytics(start, end);

      setTotalSessions(analytics.totalSessions);
      setCompletedSessions(analytics.completedSessions);
      setAverageDuration(analytics.averageDuration);

      // Process product breakdown
      const productIds = Object.keys(analytics.productBreakdown);

      // Fetch product info
      const productsInfo: Record<string, ProductInfo> = {};
      for (const id of productIds) {
        try {
          const product = await productService.getProduct(id);
          if (product) {
            productsInfo[id] = {
              id: product.id,
              name: product.name,
              category: product.category,
            };
          }
        } catch (err) {
          console.error(`Error fetching product ${id}:`, err);
        }
      }

      setProductInfo(productsInfo);

      // Create data for charts
      const breakdown = productIds.map((id) => ({
        id,
        name: productsInfo[id]?.name || `Product ${id.substring(0, 8)}`,
        category: productsInfo[id]?.category || 'Unknown',
        value: analytics.productBreakdown[id],
      }));

      setProductBreakdown(breakdown);

      // Get all sessions to analyze feedback
      const sessions = await tryOnService.getAllSessions(start, end);

      // Process feedback data
      processFeedbackData(sessions);
    } catch (err) {
      console.error('Error fetching try-on analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processFeedbackData = (sessions: any[]) => {
    // Filter sessions with feedback
    const sessionsWithFeedback = sessions.filter((s) => s.feedback);

    if (sessionsWithFeedback.length === 0) {
      setFeedbackStats({
        averageRating: 0,
        wouldTryRealLifePercentage: 0,
        feedbackCount: 0,
        commentCount: 0,
        ratingDistribution: [],
      });
      return;
    }

    // Calculate average rating
    const totalRating = sessionsWithFeedback.reduce((sum, session) => {
      return sum + (session.feedback.rating || 0);
    }, 0);

    // Count would try in real life responses
    const wouldTryRealLife = sessionsWithFeedback.filter(
      (session) => session.feedback.would_try_in_real_life,
    ).length;

    // Count sessions with comments
    const withComments = sessionsWithFeedback.filter(
      (session) => session.feedback.comment && session.feedback.comment.trim() !== '',
    ).length;

    // Calculate rating distribution
    const ratingCounts = [0, 0, 0, 0, 0]; // For ratings 1-5

    sessionsWithFeedback.forEach((session) => {
      const rating = session.feedback.rating;
      if (rating >= 1 && rating <= 5) {
        ratingCounts[rating - 1]++;
      }
    });

    const ratingDistribution = ratingCounts.map((count, i) => ({
      rating: i + 1,
      count,
    }));

    setFeedbackStats({
      averageRating: totalRating / sessionsWithFeedback.length,
      wouldTryRealLifePercentage: (wouldTryRealLife / sessionsWithFeedback.length) * 100,
      feedbackCount: sessionsWithFeedback.length,
      commentCount: withComments,
      ratingDistribution,
    });
  };

  const exportToCsv = () => {
    if (!productBreakdown.length) return;

    // Prepare CSV data
    const headers = ['Product ID', 'Product Name', 'Category', 'Try-On Sessions'];
    const rows = productBreakdown.map((product) => [
      product.id,
      product.name,
      product.category,
      product.value,
    ]);

    // Create CSV content
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const { start, end } = getDateRange();
    const fileName = `try-on-analytics-${format(start, 'yyyy-MM-dd')}-to-${format(end, 'yyyy-MM-dd')}.csv`;

    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg bg-destructive/10 p-4 text-destructive">{error}</div>;
  }

  // Format duration in minutes and seconds
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Calculate completion rate
  const completionRate = totalSessions ? (completedSessions / totalSessions) * 100 : 0;

  const { start, end } = getDateRange();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h2 className="text-3xl font-bold tracking-tight">Try-On Analytics</h2>

        <div className="flex flex-wrap gap-2">
          <Tabs
            value={dateRangeType}
            onValueChange={(value) => setDateRangeType(value as DateRangeType)}
            className="mr-2"
          >
            <TabsList>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
              <TabsTrigger value="365d">Year</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
          </Tabs>

          {dateRangeType === 'custom' && (
            <div className="flex items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !customDateRange.from && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateRange.from ? (
                      customDateRange.to ? (
                        <>
                          {format(customDateRange.from, 'MMM d')} -{' '}
                          {format(customDateRange.to, 'MMM d, yyyy')}
                        </>
                      ) : (
                        format(customDateRange.from, 'MMM d, yyyy')
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={customDateRange.from}
                    selected={{
                      from: customDateRange.from,
                      to: customDateRange.to,
                    }}
                    onSelect={(range) => {
                      setCustomDateRange({
                        from: range?.from,
                        to: range?.to,
                      });
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <Button
            onClick={exportToCsv}
            variant="outline"
            size="icon"
            disabled={!productBreakdown.length}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing data from {format(start, 'PPP')} to {format(end, 'PPP')}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions}</div>
            <Progress value={completionRate} className="mt-2 h-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              {completionRate.toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(averageDuration)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Feedback Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackStats.feedbackCount}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {feedbackStats.feedbackCount > 0
                ? `${((feedbackStats.feedbackCount / completedSessions) * 100).toFixed(1)}% of completed sessions`
                : 'No feedback collected yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="product-breakdown" className="space-y-4">
        <TabsList>
          <TabsTrigger value="product-breakdown">Product Breakdown</TabsTrigger>
          <TabsTrigger value="feedback-analysis">Feedback Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="product-breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Try-On Sessions by Product</CardTitle>
              <CardDescription>Distribution of try-on sessions across products</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {productBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {productBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} sessions`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No product data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Try-On Products</CardTitle>
              <CardDescription>Products with the most try-on sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {productBreakdown
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 5)
                  .map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="flex h-6 w-6 items-center justify-center rounded-full"
                        >
                          {index + 1}
                        </Badge>
                        <span className="truncate font-medium">{product.name}</span>
                      </div>
                      <span className="font-medium">{product.value}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback-analysis" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Average Rating</CardTitle>
                <CardDescription>Overall rating from try-on feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-6">
                  <div className="text-center">
                    <div className="mb-2 text-5xl font-bold">
                      {feedbackStats.averageRating.toFixed(1)}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill={
                            star <= Math.round(feedbackStats.averageRating) ? '#FFB800' : '#E2E8F0'
                          }
                          className="h-4 w-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Based on {feedbackStats.feedbackCount} ratings
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Would Try in Real Life</CardTitle>
                <CardDescription>
                  Percentage of users who would try the product in real life
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-40 items-center justify-center">
                  <div className="text-center">
                    <div className="mb-2 text-5xl font-bold">
                      {feedbackStats.wouldTryRealLifePercentage.toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {feedbackStats.wouldTryRealLifePercentage > 75
                        ? 'Excellent conversion potential!'
                        : feedbackStats.wouldTryRealLifePercentage > 50
                          ? 'Good conversion potential'
                          : 'Room for improvement'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>Breakdown of ratings from customer feedback</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {feedbackStats.ratingDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={feedbackStats.ratingDistribution}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rating" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} ratings`, 'Count']} />
                      <Legend />
                      <Bar
                        dataKey="count"
                        name="Number of Ratings"
                        fill="#4f46e5"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No rating data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Feedback Summary</CardTitle>
              <CardDescription>Key metrics from user feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Total feedback received</span>
                  <span className="text-2xl font-bold">{feedbackStats.feedbackCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Comments received</span>
                  <span className="text-2xl font-bold">{feedbackStats.commentCount}</span>
                  <span className="text-xs text-muted-foreground">
                    {feedbackStats.feedbackCount
                      ? `${((feedbackStats.commentCount / feedbackStats.feedbackCount) * 100).toFixed(1)}% provided comments`
                      : 'No comments yet'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
