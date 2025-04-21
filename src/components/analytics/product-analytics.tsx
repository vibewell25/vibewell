import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductService } from '@/services/product-service';
import { FeedbackService } from '@/services/feedback-service';
import { LineChart, BarChart, PieChart } from '@/components/ui/charts';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  ShoppingCartIcon,
  StarIcon,
  HeartIcon,
} from 'lucide-react';

/**
 * Props for the ProductAnalytics component
 */
interface ProductAnalyticsProps {
  /** ID of the product to display analytics for */
  productId: string;
  /** Time range for analytics data (e.g., '7d', '30d', '90d', '1y') */
  timeRange: string;
}

/**
 * Product details interface
 */
interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  brand?: string;
  description?: string;
}

/**
 * Metrics for product performance
 */
interface ProductMetrics {
  views: number;
  viewsTrend: number;
  conversions: number;
  conversionsTrend: number;
  averageRating: number;
  ratingTrend: number;
  saveRate: number;
  saveRateTrend: number;
}

/**
 * Time series data for charts
 */
interface TimeSeriesData {
  dates: string[];
  views: number[];
  conversions: number[];
  ratings: number[];
  saves: number[];
}

/**
 * Device distribution data for pie chart
 */
interface DeviceDistribution {
  labels: string[];
  values: number[];
}

/**
 * ProductAnalytics component displays performance metrics and charts for a product
 */
export function ProductAnalytics({ productId, timeRange }: ProductAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [metrics, setMetrics] = useState<ProductMetrics>({
    views: 0,
    viewsTrend: 0,
    conversions: 0,
    conversionsTrend: 0,
    averageRating: 0,
    ratingTrend: 0,
    saveRate: 0,
    saveRateTrend: 0,
  });
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData>({
    dates: [],
    views: [],
    conversions: [],
    ratings: [],
    saves: [],
  });
  const [ratingDistribution, setRatingDistribution] = useState<number[]>([0, 0, 0, 0, 0]);
  const [deviceDistribution, setDeviceDistribution] = useState<DeviceDistribution>({
    labels: [],
    values: [],
  });

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) return;

      setLoading(true);
      try {
        // Fetch product details
        const productService = new ProductService();
        const { data } = await productService.getProductById(productId);
        setProduct(data);

        // Fetch product analytics data
        // This would be a real API call in production
        const days = timeRangeToDays(timeRange);
        const metricsData = await fetchProductMetrics(productId, days);
        setMetrics(metricsData);

        // Fetch time series data
        const timeData = await fetchTimeSeriesData(productId, days);
        setTimeSeriesData(timeData);

        // Fetch rating distribution
        const feedbackService = new FeedbackService();
        const stats = await feedbackService.getProductFeedbackStats(productId);
        if (stats && stats.ratingDistribution) {
          setRatingDistribution([
            stats.ratingDistribution['1'] || 0,
            stats.ratingDistribution['2'] || 0,
            stats.ratingDistribution['3'] || 0,
            stats.ratingDistribution['4'] || 0,
            stats.ratingDistribution['5'] || 0,
          ]);
        }

        // Fetch device distribution (mock data for now)
        setDeviceDistribution({
          labels: ['Mobile', 'Desktop', 'Tablet', 'AR Headset', 'VR Headset'],
          values: [45, 30, 15, 7, 3],
        });
      } catch (error) {
        console.error('Error fetching product analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId, timeRange]);

  // Helper function to convert timeRange to days
  const timeRangeToDays = (range: string): number => {
    switch (range) {
      case '7d':
        return 7;
      case '90d':
        return 90;
      case '1y':
        return 365;
      case '30d':
      default:
        return 30;
    }
  };

  // Mock function to fetch product metrics
  // In production, this would be an API call
  const fetchProductMetrics = async (id: string, days: number): Promise<ProductMetrics> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock data for demonstration
    return {
      views: Math.floor(Math.random() * 10000) + 1000,
      viewsTrend: Math.random() * 30 - 15,
      conversions: Math.floor(Math.random() * 1000) + 100,
      conversionsTrend: Math.random() * 20 - 5,
      averageRating: 3.5 + Math.random() * 1.5,
      ratingTrend: Math.random() * 10 - 3,
      saveRate: Math.random() * 30 + 10,
      saveRateTrend: Math.random() * 15 - 7,
    };
  };

  // Mock function to fetch time series data
  const fetchTimeSeriesData = async (id: string, days: number): Promise<TimeSeriesData> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));

    const dates: string[] = [];
    const views: number[] = [];
    const conversions: number[] = [];
    const ratings: number[] = [];
    const saves: number[] = [];

    // Generate dates and random data for the time period
    const today = new Date();
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

      views.push(Math.floor(Math.random() * 500) + 50);
      conversions.push(Math.floor(Math.random() * 50) + 5);
      ratings.push(Math.floor(Math.random() * 20) + 1);
      saves.push(Math.floor(Math.random() * 30) + 3);
    }

    return { dates, views, conversions, ratings, saves };
  };

  // Helper function to format metric trend as a percentage
  const formatTrend = (value: number): string => {
    return value >= 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
  };

  // Helper function to determine trend color
  const getTrendColor = (value: number, inverse: boolean = false): string => {
    if (value === 0) return 'text-gray-500';
    return inverse
      ? value < 0
        ? 'text-green-500'
        : 'text-red-500'
      : value > 0
        ? 'text-green-500'
        : 'text-red-500';
  };

  // Helper function to render trend indicator
  const renderTrendIndicator = (value: number, inverse: boolean = false) => {
    if (value === 0) return null;

    const isPositive = inverse ? value < 0 : value > 0;
    const Icon = isPositive ? ArrowUpIcon : ArrowDownIcon;
    const color = getTrendColor(value, inverse);

    return (
      <div className={`flex items-center ${color}`}>
        <Icon className="h-4 w-4 mr-1" />
        <span>{formatTrend(Math.abs(value))}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Loading Product Analytics...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Product Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The selected product could not be found or has no analytics data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Product header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">{product.category}</Badge>
            {product.subcategory && <Badge variant="outline">{product.subcategory}</Badge>}
            {product.brand && <Badge variant="outline">{product.brand}</Badge>}
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center">
                <EyeIcon className="h-4 w-4 mr-2" />
                Views
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.views.toLocaleString()}</div>
            {renderTrendIndicator(metrics.viewsTrend)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center">
                <ShoppingCartIcon className="h-4 w-4 mr-2" />
                Conversions
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversions.toLocaleString()}</div>
            {renderTrendIndicator(metrics.conversionsTrend)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center">
                <StarIcon className="h-4 w-4 mr-2" />
                Rating
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageRating.toFixed(1)}</div>
            {renderTrendIndicator(metrics.ratingTrend)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <div className="flex items-center">
                <HeartIcon className="h-4 w-4 mr-2" />
                Save Rate
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.saveRate.toFixed(1)}%</div>
            {renderTrendIndicator(metrics.saveRateTrend)}
          </CardContent>
        </Card>
      </div>

      {/* Performance over time */}
      <Card className="col-span-1 xl:col-span-2">
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
          <CardDescription>Track key metrics over the selected time period</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="views" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="views">Views</TabsTrigger>
              <TabsTrigger value="conversions">Conversions</TabsTrigger>
              <TabsTrigger value="ratings">Ratings</TabsTrigger>
              <TabsTrigger value="saves">Saves</TabsTrigger>
            </TabsList>

            <TabsContent value="views" className="pt-2">
              <div className="h-[350px]">
                <LineChart
                  categories={timeSeriesData.dates}
                  data={[
                    {
                      name: 'Views',
                      data: timeSeriesData.views,
                    },
                  ]}
                  colors={['#14b8a6']}
                  valueFormatter={value => `${value.toLocaleString()} views`}
                />
              </div>
            </TabsContent>

            <TabsContent value="conversions" className="pt-2">
              <div className="h-[350px]">
                <LineChart
                  categories={timeSeriesData.dates}
                  data={[
                    {
                      name: 'Conversions',
                      data: timeSeriesData.conversions,
                    },
                  ]}
                  colors={['#6366f1']}
                  valueFormatter={value => `${value.toLocaleString()} orders`}
                />
              </div>
            </TabsContent>

            <TabsContent value="ratings" className="pt-2">
              <div className="h-[350px]">
                <LineChart
                  categories={timeSeriesData.dates}
                  data={[
                    {
                      name: 'Ratings',
                      data: timeSeriesData.ratings,
                    },
                  ]}
                  colors={['#f97316']}
                  valueFormatter={value => `${value.toLocaleString()} ratings`}
                />
              </div>
            </TabsContent>

            <TabsContent value="saves" className="pt-2">
              <div className="h-[350px]">
                <LineChart
                  categories={timeSeriesData.dates}
                  data={[
                    {
                      name: 'Saves',
                      data: timeSeriesData.saves,
                    },
                  ]}
                  colors={['#ec4899']}
                  valueFormatter={value => `${value.toLocaleString()} saves`}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>Breakdown of ratings by star count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <BarChart
                categories={['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars']}
                data={[
                  {
                    name: 'Ratings',
                    data: ratingDistribution,
                  },
                ]}
                colors={['#f97316']}
                valueFormatter={value => `${value.toLocaleString()} ratings`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
            <CardDescription>Views by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <PieChart
                data={deviceDistribution.values.map((value, index) => ({
                  name: deviceDistribution.labels[index],
                  value,
                }))}
                colors={['#14b8a6', '#6366f1', '#f97316', '#ec4899', '#8b5cf6']}
                valueFormatter={value => `${value}%`}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
