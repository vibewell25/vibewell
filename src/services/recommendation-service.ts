import { prisma } from '@/lib/database/client';
import { ProductService, Product } from './product-service';



/**
 * Weight factors for recommendation scoring
 */
const WEIGHT_FACTORS = {
  PRODUCT_TYPE: 3,   // Higher weight for matching product type
  CATEGORY: 2,       // Medium weight for matching category
  SUBCATEGORY: 2,    // Medium weight for matching subcategory
  BRAND: 1.5,        // Some weight for matching brand
  TAGS: 1,           // Weight for each matching tag
  RATING: 0.5,       // Small boost for higher rated products
  TRENDING: 0.3,     // Small boost for trending products
  FEATURED: 0.2,     // Small boost for featured products
  REVIEW_COUNT: 0.1, // Tiny boost for more reviewed products
  PURCHASED: 4,      // High weight for products user has purchased
  FEEDBACK_RATING: 2.5, // High weight for products with positive feedback
  WOULD_TRY_IRL: 3,  // High weight for products user would try in real life
  TRY_ON: 2,         // Weight for products user has tried on
};

interface RecommendationOptions {
  userId?: string;
  includeViewed?: boolean;
  includePurchased?: boolean;
  limit?: number;
  itemId?: string;
  maxRelatedItems?: number;
}

interface UserInteraction {
  productId: string;
  type: 'view' | 'purchase' | 'try_on' | 'share';
  count: number;
  lastInteracted: string;
  feedbackRating?: number; // 1-5 star rating from feedback
  wouldTryInRealLife?: boolean; // Whether user would try in real life
}

export class RecommendationService {
  private productService: ProductService;
  
  constructor() {
    this.productService = new ProductService();
  }
  
  /**
   * Get recommended products for a user
   */
  async getRecommendations(options: RecommendationOptions = {}): Promise<Product[]> {
    const {
      userId,
      includeViewed = true,
      includePurchased = false,
      limit = 6,
      itemId,
      maxRelatedItems = 3,
    } = options;
    
    try {
      // If an itemId is provided, focus on item-to-item recommendations
      if (itemId) {
        return this.getItemBasedRecommendations(itemId, maxRelatedItems);
      }
      
      // Get user's interaction history if user is logged in
      let userInteractions: UserInteraction[] = [];
      if (userId) {
        userInteractions = await this.getUserInteractions(userId);
      }
      
      // If no user id or no interactions, return trending/featured products
      if (!userId || userInteractions.length === 0) {
        return this.getFallbackRecommendations(limit);
      }
      
      // Calculate scores for all products
      const allScores = await this.calculateRecommendationScores(
        userInteractions,
        includeViewed,
        includePurchased
      );
      
      // Get the top N products
      const topProducts = await this.getTopScoredProducts(allScores, limit);
      
      return topProducts;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return this.getFallbackRecommendations(limit);
    }
  }
  
  /**
   * Get item-based recommendations (similar items)
   */
  private async getItemBasedRecommendations(itemId: string, limit: number): Promise<Product[]> {
    try {
      // Get the source product
      const sourceProduct = await this.productService.getProduct(itemId);
      
      if (!sourceProduct) {
        return this.getFallbackRecommendations(limit);
      }
      
      // Get related products
      const relatedProducts = await this.productService.getRelatedProducts(itemId, limit);
      
      return relatedProducts;
    } catch (error) {
      console.error('Error getting item-based recommendations:', error);
      return this.getFallbackRecommendations(limit);
    }
  }
  
  /**
   * Get user's interaction history with products
   */
  private async getUserInteractions(userId: string): Promise<UserInteraction[]> {
    try {
      // Fetch product views
      const { data: viewData, error: viewError } = await supabase
        .from('product_views')
        .select('product_id, count, last_viewed')
        .eq('user_id', userId);
      
      if (viewError) throw viewError;
      
      // Fetch product purchases
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('orders')
        .select('products')
        .eq('user_id', userId);
      
      if (purchaseError) throw purchaseError;
      
      // Process views into interactions
      const viewInteractions = (viewData || []).map(view => ({
        productId: view.product_id,
        type: 'view' as const,
        count: view.count,
        lastInteracted: view.last_viewed,
      }));
      
      // Process purchases into interactions
      const purchaseInteractions: UserInteraction[] = [];
      (purchaseData || []).forEach((order: { products: any[], created_at?: string }) => {
        if (order && order.products && Array.isArray(order.products)) {
          order.products.forEach((product: any) => {
            const existingInteraction = purchaseInteractions.find(
              interaction => interaction.productId === product.id
            );
            
            if (existingInteraction) {
              existingInteraction.count += 1;
            } else {
              purchaseInteractions.push({
                productId: product.id,
                type: 'purchase' as const,
                count: 1,
                lastInteracted: order.created_at || new Date().toISOString(),
              });
            }
          });
        }
      });
      
      // Fetch try-on sessions with feedback
      const { data: tryOnData, error: tryOnError } = await supabase
        .from('try_on_sessions')
        .select('product_id, created_at, feedback, completed')
        .eq('user_id', userId);
      
      if (tryOnError) throw tryOnError;
      
      // Process try-ons into interactions
      const tryOnMap = new Map<string, { 
        count: number, 
        lastInteracted: string,
        feedbackRating?: number,
        wouldTryInRealLife?: boolean
      }>();
      
      (tryOnData || []).forEach(session => {
        if (!session.product_id) return;
        
        const existing = tryOnMap.get(session.product_id);
        
        // Extract feedback data if available
        let feedbackRating: number | undefined = undefined;
        let wouldTryInRealLife: boolean | undefined = undefined;
        
        if (session.feedback && typeof session.feedback === 'object') {
          feedbackRating = session.feedback.rating;
          wouldTryInRealLife = session.feedback.would_try_in_real_life;
        }
        
        if (existing) {
          existing.count += 1;
          existing.lastInteracted = session.created_at;
          
          // Update feedback data if this session has feedback and previous one doesn't
          // or if this feedback is more recent
          if (feedbackRating !== undefined && (existing.feedbackRating === undefined || 
              new Date(session.created_at) > new Date(existing.lastInteracted))) {
            existing.feedbackRating = feedbackRating;
            existing.wouldTryInRealLife = wouldTryInRealLife;
          }
        } else {
          tryOnMap.set(session.product_id, {
            count: 1,
            lastInteracted: session.created_at,
            feedbackRating,
            wouldTryInRealLife
          });
        }
      });
      
      const tryOnInteractions = Array.from(tryOnMap.entries()).map(([productId, data]) => ({
        productId,
        type: 'try_on' as const,
        count: data.count,
        lastInteracted: data.lastInteracted,
        feedbackRating: data.feedbackRating,
        wouldTryInRealLife: data.wouldTryInRealLife
      }));
      
      // Combine all interactions
      return [...viewInteractions, ...purchaseInteractions, ...tryOnInteractions];
    } catch (error) {
      console.error('Error getting user interactions:', error);
      return [];
    }
  }
  
  /**
   * Calculate recommendation scores for all products based on user interactions
   */
  private async calculateRecommendationScores(
    userInteractions: UserInteraction[],
    includeViewed: boolean,
    includePurchased: boolean
  ): Promise<Map<string, number>> {
    try {
      // Get all products
      const { products } = await this.productService.getProducts(1, 1000);
      
      // Get user's viewed and purchased product IDs
      const viewedProductIds = new Set(
        userInteractions
          .filter(interaction => interaction.type === 'view')
          .map(interaction => interaction.productId)
      );
      
      const purchasedProductIds = new Set(
        userInteractions
          .filter(interaction => interaction.type === 'purchase')
          .map(interaction => interaction.productId)
      );
      
      // Create a map to store the scores
      const scores = new Map<string, number>();
      
      // Get all product interactions grouped by product ID
      const productInteractions = new Map<string, UserInteraction[]>();
      userInteractions.forEach(interaction => {
        if (!productInteractions.has(interaction.productId)) {
          productInteractions.set(interaction.productId, []);
        }
        productInteractions.get(interaction.productId)!.push(interaction);
      });
      
      // Process each product
      for (const product of products) {
        // Skip products the user has already viewed or purchased if not included
        if ((!includeViewed && viewedProductIds.has(product.id)) ||
            (!includePurchased && purchasedProductIds.has(product.id))) {
          continue;
        }
        
        let score = 0;
        
        // Add base score for trending and featured products
        if (product.trending) {
          score += WEIGHT_FACTORS.TRENDING;
        }
        
        if (product.featured) {
          score += WEIGHT_FACTORS.FEATURED;
        }
        
        // Add score based on rating and review count
        score += (product.rating / 5) * WEIGHT_FACTORS.RATING;
        score += Math.min(product.review_count / 100, 1) * WEIGHT_FACTORS.REVIEW_COUNT;
        
        // For each product the user has interacted with, calculate similarity and add to score
        userInteractions.forEach(interaction => {
          // Get the interacted product
          const interactedProduct = products.find(p => p.id === interaction.productId);
          if (!interactedProduct) return;
          
          let similarityScore = 0;
          
          // Add score for matching product type
          if (product.type === interactedProduct.type) {
            similarityScore += WEIGHT_FACTORS.PRODUCT_TYPE;
          }
          
          // Add score for matching category
          if (product.category === interactedProduct.category) {
            similarityScore += WEIGHT_FACTORS.CATEGORY;
          }
          
          // Add score for matching subcategory
          if (product.subcategory === interactedProduct.subcategory) {
            similarityScore += WEIGHT_FACTORS.SUBCATEGORY;
          }
          
          // Add score for matching brand
          if (product.brand === interactedProduct.brand) {
            similarityScore += WEIGHT_FACTORS.BRAND;
          }
          
          // Add score for matching tags
          if (product.tags && interactedProduct.tags) {
            const matchingTags = product.tags.filter(tag => 
              interactedProduct.tags.includes(tag)
            );
            similarityScore += matchingTags.length * WEIGHT_FACTORS.TAGS;
          }
          
          // Multiply by the interaction weight and count
          if (interaction.type === 'purchase') {
            similarityScore *= WEIGHT_FACTORS.PURCHASED * interaction.count;
          } else if (interaction.type === 'try_on') {
            // Base score for try-ons
            let tryOnMultiplier = WEIGHT_FACTORS.TRY_ON;
            
            // Boost score based on feedback if available
            if (interaction.feedbackRating !== undefined) {
              // Scale from 1-5 to 0.2-1.0 multiplier
              const ratingMultiplier = interaction.feedbackRating / 5;
              tryOnMultiplier += WEIGHT_FACTORS.FEEDBACK_RATING * ratingMultiplier;
              
              // Extra boost if user would try in real life
              if (interaction.wouldTryInRealLife === true) {
                tryOnMultiplier += WEIGHT_FACTORS.WOULD_TRY_IRL;
              }
            }
            
            similarityScore *= tryOnMultiplier * interaction.count;
          } else {
            similarityScore *= interaction.count;
          }
          
          // Add to the product's total score
          score += similarityScore;
        });
        
        // Store the final score
        scores.set(product.id, score);
      }
      
      return scores;
    } catch (error) {
      console.error('Error calculating recommendation scores:', error);
      return new Map();
    }
  }
  
  /**
   * Get the top N scored products
   */
  private async getTopScoredProducts(
    scores: Map<string, number>,
    limit: number
  ): Promise<Product[]> {
    try {
      // Sort the product IDs by score (descending)
      const sortedProductIds = Array.from(scores.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => id)
        .slice(0, limit);
      
      // Get the product details
      const products: Product[] = [];
      for (const id of sortedProductIds) {
        const product = await this.productService.getProduct(id);
        if (product) {
          products.push(product);
        }
      }
      
      return products;
    } catch (error) {
      console.error('Error getting top scored products:', error);
      return [];
    }
  }
  
  /**
   * Get fallback recommendations (trending and featured products)
   */
  private async getFallbackRecommendations(limit: number): Promise<Product[]> {
    try {
      // Get trending and featured products
      const trendingProducts = await this.productService.getTrendingProducts(limit);
      const featuredProducts = await this.productService.getFeaturedProducts(limit);
      
      // Combine and deduplicate
      const allProducts = [...trendingProducts];
      
      // Add featured products that aren't already in the list
      for (const product of featuredProducts) {
        if (!allProducts.some(p => p.id === product.id)) {
          allProducts.push(product);
        }
      }
      
      // Return limited set
      return allProducts.slice(0, limit);
    } catch (error) {
      console.error('Error getting fallback recommendations:', error);
      return [];
    }
  }
  
  /**
   * Tracks a product view for a specific user
   * This data is used to improve personalized recommendations
   */
  async trackProductView(userId: string, productId: string): Promise<void> {
    try {
      // Check if a record already exists
      const { data: existingRecord, error: selectError } = await supabase
        .from('product_views')
        .select('view_count')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();
      
      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking existing product view:', selectError);
        return;
      }
      
      const now = new Date().toISOString();
      
      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('product_views')
          .update({
            view_count: existingRecord.view_count + 1,
            last_viewed_at: now
          })
          .eq('user_id', userId)
          .eq('product_id', productId);
          
        if (updateError) {
          console.error('Error updating product view:', updateError);
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('product_views')
          .insert({
            user_id: userId,
            product_id: productId,
            view_count: 1,
            last_viewed_at: now
          });
          
        if (insertError) {
          console.error('Error inserting product view:', insertError);
        }
      }
    } catch (err) {
      console.error('Failed to track product view:', err);
      // Don't throw the error - tracking failures shouldn't affect user experience
    }
  }

  /**
   * Get product recommendations based on try-on feedback
   */
  async getFeedbackBasedRecommendations(
    userId: string, 
    limit: number = 4
  ): Promise<Product[]> {
    try {
      // Fetch try-on sessions with positive feedback (rating >= 4 or would try in real life)
      const { data: positiveFeedbackSessions, error: feedbackError } = await supabase
        .from('try_on_sessions')
        .select('product_id, feedback')
        .eq('user_id', userId)
        .not('feedback', 'is', null);
      
      if (feedbackError) throw feedbackError;
      
      // Filter sessions with positive feedback
      const productsWithPositiveFeedback = (positiveFeedbackSessions || [])
        .filter(session => {
          if (!session.feedback) return false;
          
          // Consider positive if rating is 4+ or would try in real life
          return (
            (session.feedback.rating && session.feedback.rating >= 4) || 
            session.feedback.would_try_in_real_life === true
          );
        })
        .map(session => session.product_id);
      
      if (productsWithPositiveFeedback.length === 0) {
        // If no positive feedback, fall back to regular recommendations
        return this.getRecommendations({ userId, limit });
      }
      
      // Get products similar to those with positive feedback
      const similarProducts: Product[] = [];
      
      // Fetch a limited number of similar products for each positively rated product
      for (const productId of productsWithPositiveFeedback) {
        const related = await this.getItemBasedRecommendations(productId, 2);
        
        // Add to results, avoiding duplicates
        for (const product of related) {
          if (!similarProducts.some(p => p.id === product.id) && 
              !productsWithPositiveFeedback.includes(product.id)) {
            similarProducts.push(product);
          }
          
          // Break if we have enough products
          if (similarProducts.length >= limit) break;
        }
        
        // Break if we have enough products
        if (similarProducts.length >= limit) break;
      }
      
      // If we still don't have enough, add regular recommendations
      if (similarProducts.length < limit) {
        const regularRecs = await this.getRecommendations({ 
          userId, 
          limit: limit - similarProducts.length,
          includeViewed: false 
        });
        
        // Add to results, avoiding duplicates
        for (const product of regularRecs) {
          if (!similarProducts.some(p => p.id === product.id) && 
              !productsWithPositiveFeedback.includes(product.id)) {
            similarProducts.push(product);
          }
          
          // Break if we have enough products
          if (similarProducts.length >= limit) break;
        }
      }
      
      return similarProducts;
    } catch (error) {
      console.error('Error getting feedback-based recommendations:', error);
      return this.getFallbackRecommendations(limit);
    }
  }
} 