'use client';;
import ProductMetricsDashboard from '@/components/analytics/product-metrics-dashboard';
import FeedbackDashboard from '@/components/analytics/feedback-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useParams } from 'next/navigation';

export default function ProductAnalytics() {
  const params = useParams();
  const productId = params?.id as string;

  if (!productId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Product ID is required to view analytics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Product Analytics</h2>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="feedback">Customer Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance Metrics</CardTitle>
              <CardDescription>Detailed performance metrics for this product</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductMetricsDashboard productId={productId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Feedback</CardTitle>
              <CardDescription>
                Ratings and comments from customers who tried this product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeedbackDashboard productId={productId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
