'use client';

import { useState, useEffect } from 'react';
import { RecommendationService } from '@/services/recommendation-service';
import { Product } from '@/services/product-service';
import { ProductCard } from './product-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-unified-auth';

interface ProductRecommendationsProps {
  productId?: string; // Optional product ID for item-based recommendations
  title?: string;
  limit?: number;
  showTabs?: boolean;
  showFeedbackTab?: boolean; // Whether to show the "Based on Your Feedback" tab
}

export function ProductRecommendations({
  productId,
  title = 'Recommended for You',
  limit = 4,
  showTabs = true,
  showFeedbackTab = true,
}: ProductRecommendationsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [relatedItems, setRelatedItems] = useState<Product[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'for-you' | 'related' | 'feedback'>('for-you');
  const recommendationService = new RecommendationService();

  // Fetch recommendations on component mount
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);

      try {
        // If product ID is provided, fetch related items
        if (productId) {
          const relatedProducts = await recommendationService.getRecommendations({
            itemId: productId,
            limit,
          });
          setRelatedItems(relatedProducts);
          setActiveTab('related');
        }

        // Also fetch personalized recommendations if user is logged in
        if (user?.id) {
          const personalizedProducts = await recommendationService.getRecommendations({
            userId: user.id,
            limit,
          });
          setRecommendations(personalizedProducts);

          // Fetch feedback-based recommendations if user is logged in and feedback tab is shown
          if (showFeedbackTab) {
            const feedbackProducts = await recommendationService.getFeedbackBasedRecommendations(
              user.id,
              limit
            );
            setFeedbackItems(feedbackProducts);

            // If feedback-based recommendations are available, make that the default tab
            if (feedbackProducts.length > 0 && !productId) {
              setActiveTab('feedback');
            }
          }

          // If no product ID and no feedback recommendations, set active tab to 'for-you'
          if (!productId && (feedbackItems.length === 0 || !showFeedbackTab)) {
            setActiveTab('for-you');
          }
        } else {
          // For anonymous users, get trending/featured products
          const trendingProducts = await recommendationService.getRecommendations({
            limit,
          });
          setRecommendations(trendingProducts);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId, user?.id, limit, showFeedbackTab]);

  // Track product view when it's displayed in recommendations
  const handleProductClick = async (product: Product) => {
    if (user?.id) {
      try {
        await recommendationService.trackProductView(user.id, product.id);
      } catch (error) {
        console.error('Error tracking product view:', error);
      }
    }
  };

  // Function to render the product grid
  const renderProductGrid = (products: Product[]) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">No recommendations available.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <div key={product.id} onClick={() => handleProductClick(product)}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    );
  };

  // If no tabs needed (e.g., just showing recommendations)
  if (!showTabs || (!productId && recommendations.length === 0 && feedbackItems.length === 0)) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {renderProductGrid(
          activeTab === 'for-you'
            ? recommendations
            : activeTab === 'related'
              ? relatedItems
              : feedbackItems
        )}
      </div>
    );
  }

  // Helper to decide which tabs to show
  const shouldShowFeedbackTab = () => {
    return showFeedbackTab && user?.id && feedbackItems.length > 0;
  };

  // With tabs (for both related items and personalized recommendations)
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">{title}</h2>

      <Tabs value={activeTab} onValueChange={value => setActiveTab(value as any)}>
        <TabsList className="mb-4">
          {productId && <TabsTrigger value="related">Related Items</TabsTrigger>}
          {shouldShowFeedbackTab() && (
            <TabsTrigger value="feedback">Based on Your Feedback</TabsTrigger>
          )}
          <TabsTrigger value="for-you">Recommended For You</TabsTrigger>
        </TabsList>

        {productId && (
          <TabsContent value="related" className="space-y-4">
            {renderProductGrid(relatedItems)}
          </TabsContent>
        )}

        {shouldShowFeedbackTab() && (
          <TabsContent value="feedback" className="space-y-4">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Products recommended based on items you've tried on and rated positively.
              </p>
            </div>
            {renderProductGrid(feedbackItems)}
          </TabsContent>
        )}

        <TabsContent value="for-you" className="space-y-4">
          {renderProductGrid(recommendations)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
