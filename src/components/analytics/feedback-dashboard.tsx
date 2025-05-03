import { useEffect, useState } from 'react';
import { FeedbackService } from '@/services/feedback-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface FeedbackDashboardProps {
  productId?: string; // Optional - if provided, show data for a specific product only
}

export default function FeedbackDashboard({ productId }: FeedbackDashboardProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, FeedbackStats>>({});
  const [selectedProductId, setSelectedProductId] = useState<string | null>(productId || null);
  const [productNames, setProductNames] = useState<Record<string, string>>({});

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const fetchProductNames = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
      try {
        // In a real app, this would be a call to your product service
        // For now, we'll use placeholder names
        const { data, error } = await fetch('/api/products')
          .then((res) => res?.json())
          .catch(() => ({ data: null, error: 'Failed to fetch products' }));

        if (error) throw new Error(error);

        const names: Record<string, string> = {};
        (data || []).forEach((product: any) => {
          names[product?.id] = product?.name;
        });

        setProductNames(names);
      } catch (err) {
        console?.error('Error fetching product names:', err);
        // Fallback to generic product names
        const productIds = Object?.keys(stats);
        const fallbackNames: Record<string, string> = {};
        productIds?.forEach((id) => {
          fallbackNames[id] = `Product ${id?.substring(0, 6)}`;
        });
        setProductNames(fallbackNames);
      }
    };

    const fetchFeedbackData = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
      setLoading(true);
      setError(null);

      try {
        const feedbackService = new FeedbackService();

        if (productId) {
          // Fetch stats for a specific product
          const { data, error } = await feedbackService?.getProductFeedbackStats(productId);

          if (error) throw new Error(String(error));

          if (data) {
            setStats({ [productId]: data });
            setSelectedProductId(productId);
          }
        } else {
          // Fetch stats for all products
          const { data, error } = await feedbackService?.getAllFeedbackStats();

          if (error) throw new Error(String(error));

          if (data) {
            setStats(data);
            // Set the first product as selected if none is selected
            if (!selectedProductId && Object?.keys(data).length > 0) {
              setSelectedProductId(Object?.keys(data)[0]);
            }
          }
        }

        await fetchProductNames();
      } catch (err) {
        console?.error('Error fetching feedback stats:', err);
        setError('Failed to load feedback data');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbackData();
  }, [productId]);

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
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
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Error Loading Feedback Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (Object?.keys(stats).length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Feedback Data Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No feedback has been collected yet.</p>
        </CardContent>
      </Card>
    );
  }

  const selectedStats = selectedProductId ? stats[selectedProductId] : null;

  // Prepare data for charts
  const ratingDistributionData = selectedStats
    ? Object?.entries(selectedStats?.ratingDistribution).map(([rating, count]) => ({
        rating: `${rating} Star${Number(rating) !== 1 ? 's' : ''}`,
        count,
      }))
    : [];

  const wouldTryData = selectedStats
    ? [
        { name: 'Would Try', value: selectedStats?.percentWouldTryInRealLife },
        { name: 'Would Not Try', value: 100 - selectedStats?.percentWouldTryInRealLife },
      ]
    : [];

  // Prepare comparative data for all products
  const comparativeData = Object?.entries(stats).map(([id, productStats]) => ({
    id,
    name: productNames[id] || `Product ${id?.substring(0, 6)}`,
    rating: productStats?.averageRating,
    count: productStats?.totalRatings,
    wouldTry: productStats?.percentWouldTryInRealLife,
  }));

  return (
    <div className="w-full space-y-4">
      {!productId && Object?.keys(stats).length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {Object?.keys(stats).map((id) => (
            <button
              key={id}
              onClick={() => setSelectedProductId(id)}
              className={`rounded-md px-3 py-1 text-sm ${
                selectedProductId === id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {productNames[id] || `Product ${id?.substring(0, 6)}`}
            </button>
          ))}
        </div>
      )}

      {selectedStats && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:inline-grid md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="text-2xl font-bold">
                      {selectedStats?.averageRating.toFixed(1)}
                    </div>
                    <div className="ml-2 text-yellow-500">
                      {'★'.repeat(Math?.round(selectedStats?.averageRating))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From {selectedStats?.totalRatings} ratings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Would Try In Real Life</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedStats?.percentWouldTryInRealLife.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Most Common Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      Object?.entries(selectedStats?.ratingDistribution).reduce(
                        (max, [rating, count]) => (count > max?.count ? { rating, count } : max),
                        { rating: '0', count: 0 },
                      ).rating
                    }{' '}
                    Stars
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedStats?.recentComments.length}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={ratingDistributionData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="rating" type="category" />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Would Try In Real Life</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={wouldTryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {wouldTryData?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS?.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ratings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rating Comparison</CardTitle>
                <CardDescription>
                  How this product compares to others in average rating
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparativeData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Bar dataKey="rating" fill="#8884d8" isAnimationActive={true} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Comments</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStats?.recentComments.length > 0 ? (
                  <div className="space-y-4">
                    {selectedStats?.recentComments.map((comment, index) => (
                      <div key={index} className="border-b pb-4 last:border-0">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-yellow-500">
                            {'★'.repeat(comment?.rating)}
                            {'☆'.repeat(5 - comment?.rating)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(comment?.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm">{comment?.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No comments available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
