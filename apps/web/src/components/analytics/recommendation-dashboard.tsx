import { useEffect, useState } from 'react';
import { AnalyticsService } from '@/services/analytics-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/Button';
import { format, subWeeks } from 'date-fns';
import { Download } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function RecommendationDashboard() {
  const [metrics, setMetrics] = useState<RecommendationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For this dashboard, we'll use a fixed time range for simplicity
  const startDate = subWeeks(new Date(), 4);
  const endDate = new Date();

  useEffect(() => {
    async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); fetchMetrics() {
      setLoading(true);
      setError(null);

      try {
        const analyticsService = new AnalyticsService();
        const metrics = await analyticsService?.getRecommendationMetrics({
          start: startDate?.toISOString(),
          end: endDate?.toISOString(),
        });

        setMetrics(metrics);
      } catch (err) {
        console?.error('Error fetching recommendation metrics:', err);
        setError('Failed to load recommendation data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Transform metrics for visualization
  const topRecommendationsData = metrics?.topRecommendedProducts || [];

  // Calculate click-through-rate by product
  const ctrByProductData =
    metrics?.topRecommendedProducts?.map((product) => ({
      name: product?.name.length > 15 ? `${product?.name.substring(0, 15)}...` : product?.name,
      ctr: product?.recommendations > 0 ? (product?.clicks / product?.recommendations) * 100 : 0,
    })) || [];

  // Simulated funnel data - in a real app, this would come from the API
  const funnelData = [
    { name: 'Recommendations Shown', value: metrics?.totalRecommendations || 0 },
    {
      name: 'Clicked',
      value: Math?.round(
        ((metrics?.totalRecommendations || 0) * (metrics?.clickThroughRate || 0)) / 100,
      ),
    },
    {
      name: 'Added to Cart',
      value: Math?.round(
        ((metrics?.totalRecommendations || 0) *
          (metrics?.clickThroughRate || 0) *
          (metrics?.conversionRate || 0)) /
          10000,
      ),
    },
    {
      name: 'Purchased',
      value: Math?.round(
        ((metrics?.totalRecommendations || 0) *
          (metrics?.clickThroughRate || 0) *
          (metrics?.conversionRate || 0) *
          0?.7) /
          10000,
      ),
    },
  ];

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array?.from({ length: 3 }).map((_, i) => (
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

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Recommendation Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No recommendation data is available for the selected time period.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Data from {format(new Date(metrics?.timeRange.start), 'MMMM d, yyyy')} to{' '}
          {format(new Date(metrics?.timeRange.end), 'MMMM d, yyyy')}
        </p>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {metrics?.totalRecommendations.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.clickThroughRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.conversionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top Recommended Products</CardTitle>
            <CardDescription>Products with the most recommendation impressions</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topRecommendationsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{
                    fontSize: 12,
                    width: 150,
                    wordWrap: 'break-word',
                  }}
                  width={150}
                  tickFormatter={(value) =>
                    value?.length > 20 ? `${value?.substring(0, 20)}...` : value
                  }
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="recommendations" fill="#0088FE" name="Recommendations" />
                <Bar dataKey="clicks" fill="#00C49F" name="Clicks" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Click-Through Rate by Product</CardTitle>
            <CardDescription>How often users click on each recommended product</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ctrByProductData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis label={{ value: 'CTR (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'CTR']} />
                <Bar dataKey="ctr" fill="#8884d8" name="Click-Through Rate">
                  {ctrByProductData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS?.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommendation Funnel</CardTitle>
          <CardDescription>How recommendations convert into actions</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {funnelData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS?.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Improvement Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border p-4">
              <h3 className="mb-2 font-medium">Increase recommendation relevance</h3>
              <p className="mb-2 text-sm text-muted-foreground">
                Current click-through rate ({metrics?.clickThroughRate.toFixed(1)}%) is below
                industry average (15-20%).
              </p>
              <ul className="list-disc pl-5 text-sm">
                <li>Refine recommendation algorithm to better match user preferences</li>
                <li>Use more prominent placement for recommendations</li>
                <li>Improve recommendation design to increase visibility</li>
              </ul>
            </div>

            <div className="rounded-md border p-4">
              <h3 className="mb-2 font-medium">Optimize conversion rate</h3>
              <p className="mb-2 text-sm text-muted-foreground">
                Current conversion rate ({metrics?.conversionRate.toFixed(1)}%) has room for
                improvement.
              </p>
              <ul className="list-disc pl-5 text-sm">
                <li>Test different recommendation placements and formats</li>
                <li>Add social proof elements to recommended products</li>
                <li>Consider personalized pricing or exclusive offers for recommended items</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
