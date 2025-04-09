'use client'

import { useState } from 'react'
import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeedbackDashboard } from '@/components/analytics/feedback-dashboard'
import { EngagementDashboard } from '@/components/analytics/engagement-dashboard'
import { RecommendationDashboard } from '@/components/analytics/recommendation-dashboard'
import { ProductAnalytics } from '@/components/analytics/product-analytics'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductService } from '@/services/product-service'
import { useEffect } from 'react'

export const metadata: Metadata = {
  title: 'Analytics Dashboard | VibeWell Admin',
  description: 'View product feedback and user engagement analytics',
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const productService = new ProductService()
        const { data } = await productService.getProducts({
          limit: 100,
          page: 1
        })
        setProducts(data || [])
        
        // Set first product as default if available
        if (data && data.length > 0 && !selectedProductId) {
          setSelectedProductId(data[0].id)
        }
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [selectedProductId])

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          <Select 
            value={timeRange} 
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      <Tabs defaultValue="product">
        <TabsList className="mb-6">
          <TabsTrigger value="product">Product Performance</TabsTrigger>
          <TabsTrigger value="feedback">Product Feedback</TabsTrigger>
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendation Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="product">
          {loading ? (
            <Card>
              <CardHeader>
                <CardTitle>Loading products...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-6">
                <Select 
                  value={selectedProductId || ''} 
                  onValueChange={setSelectedProductId}
                >
                  <SelectTrigger className="w-full md:w-[350px]">
                    <SelectValue placeholder="Select Product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedProductId ? (
                <ProductAnalytics 
                  productId={selectedProductId} 
                  timeRange={timeRange} 
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Product Selected</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Please select a product to view analytics</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="feedback">
          <FeedbackDashboard timeRange={timeRange} />
        </TabsContent>
        
        <TabsContent value="engagement">
          <EngagementDashboard timeRange={timeRange} />
        </TabsContent>
        
        <TabsContent value="recommendations">
          <RecommendationDashboard timeRange={timeRange} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 