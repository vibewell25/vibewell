import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Product {
  id: string;
  name: string;
  description: string;
  type: 'makeup' | 'hairstyle' | 'accessory' | 'skincare' | 'clothing' | 'wellness';
  category: string;
  subcategory: string;
  tags: string[];
  price: number;
  discount_price?: number;
  brand: string;
  model_url: string;
  image_url: string;
  rating: number;
  review_count: number;
  featured: boolean;
  trending: boolean;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';
  ar_compatible: boolean;
  color_variants?: Record<string, any>;
  size_variants?: Record<string, any>;
  meta?: Record<string, any>;
  created_at: string;
}

export interface ProductFilter {
  types?: string[];
  categories?: string[];
  subcategories?: string[];
  brands?: string[];
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  featured?: boolean;
  trending?: boolean;
  arCompatible?: boolean;
  availability?: string[];
  searchTerm?: string;
}

export interface ProductSortOption {
  field: 'name' | 'price' | 'created_at' | 'rating' | 'review_count';
  direction: 'asc' | 'desc';
}

export class ProductService {
  /**
   * Get a product by ID
   */
  async getProduct(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Product;
    } catch (error) {
      console.error('Error getting product:', error);
      return null;
    }
  }

  /**
   * Get all products with optional pagination
   */
  async getProducts(page: number = 1, limit: number = 20): Promise<{ products: Product[], total: number }> {
    try {
      // Get total count first
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Then get paginated results
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { products: data as Product[], total: count || 0 };
    } catch (error) {
      console.error('Error getting products:', error);
      return { products: [], total: 0 };
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Product[];
    } catch (error) {
      console.error('Error getting featured products:', error);
      return [];
    }
  }

  /**
   * Get trending products
   */
  async getTrendingProducts(limit: number = 6): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('trending', true)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Product[];
    } catch (error) {
      console.error('Error getting trending products:', error);
      return [];
    }
  }

  /**
   * Get products by type
   */
  async getProductsByType(type: string, limit: number = 20): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('type', type)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Product[];
    } catch (error) {
      console.error(`Error getting ${type} products:`, error);
      return [];
    }
  }

  /**
   * Get product categories and subcategories for filtering
   */
  async getProductCategories(): Promise<{ categories: string[], subcategories: Record<string, string[]> }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category, subcategory')
        .not('category', 'is', null);

      if (error) throw error;

      // Extract unique categories
      const categories = Array.from(new Set(data.map(item => item.category))).sort();
      
      // Group subcategories by category
      const subcategories: Record<string, string[]> = {};
      
      categories.forEach(category => {
        const categorySubcategories = data
          .filter(item => item.category === category)
          .map(item => item.subcategory);
          
        subcategories[category] = Array.from(new Set(categorySubcategories)).sort();
      });

      return { categories, subcategories };
    } catch (error) {
      console.error('Error getting product categories:', error);
      return { categories: [], subcategories: {} };
    }
  }

  /**
   * Get available product brands
   */
  async getProductBrands(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('brand')
        .not('brand', 'is', null);

      if (error) throw error;
      return Array.from(new Set(data.map(item => item.brand))).sort();
    } catch (error) {
      console.error('Error getting product brands:', error);
      return [];
    }
  }

  /**
   * Get all product tags
   */
  async getProductTags(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('tags');

      if (error) throw error;
      
      // Flatten and get unique tags
      const allTags = data.flatMap(item => item.tags || []);
      return Array.from(new Set(allTags)).sort();
    } catch (error) {
      console.error('Error getting product tags:', error);
      return [];
    }
  }

  /**
   * Search and filter products
   */
  async searchProducts(
    filter: ProductFilter = {},
    sort: ProductSortOption = { field: 'rating', direction: 'desc' },
    page: number = 1,
    limit: number = 20
  ): Promise<{ products: Product[], total: number }> {
    try {
      let query = supabase.from('products').select('*', { count: 'exact' });

      // Apply filters
      if (filter.types && filter.types.length > 0) {
        query = query.in('type', filter.types);
      }

      if (filter.categories && filter.categories.length > 0) {
        query = query.in('category', filter.categories);
      }

      if (filter.subcategories && filter.subcategories.length > 0) {
        query = query.in('subcategory', filter.subcategories);
      }

      if (filter.brands && filter.brands.length > 0) {
        query = query.in('brand', filter.brands);
      }

      if (filter.minPrice !== undefined) {
        query = query.gte('price', filter.minPrice);
      }

      if (filter.maxPrice !== undefined) {
        query = query.lte('price', filter.maxPrice);
      }

      if (filter.minRating !== undefined) {
        query = query.gte('rating', filter.minRating);
      }

      if (filter.featured !== undefined) {
        query = query.eq('featured', filter.featured);
      }

      if (filter.trending !== undefined) {
        query = query.eq('trending', filter.trending);
      }

      if (filter.arCompatible !== undefined) {
        query = query.eq('ar_compatible', filter.arCompatible);
      }

      if (filter.availability && filter.availability.length > 0) {
        query = query.in('availability', filter.availability);
      }

      // For tag filtering, we'll do this after initial results are returned
      // since Supabase's handling of array operations can be tricky

      // Text search in name and description
      if (filter.searchTerm) {
        const term = filter.searchTerm.trim();
        if (term) {
          // Using ilike for basic search in name or description
          query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
        }
      }

      // Apply sorting
      query = query.order(sort.field, { ascending: sort.direction === 'asc' });

      // Get total count
      const { count } = await query.select('id', { count: 'exact', head: true });

      // Apply pagination
      query = query.range((page - 1) * limit, page * limit - 1);

      // Execute query
      const { data, error } = await query;

      if (error) throw error;

      // Post-process for tag filtering if needed
      let filteredData = data;
      if (filter.tags && filter.tags.length > 0 && filteredData) {
        filteredData = filteredData.filter(product => {
          if (!product.tags) return false;
          // Check if product has all requested tags
          return filter.tags!.every(tag => 
            product.tags.some(productTag => 
              productTag.toLowerCase().includes(tag.toLowerCase())
            )
          );
        });
      }

      return { 
        products: (filteredData as Product[]) || [], 
        total: filter.tags?.length ? filteredData.length : (count || 0) 
      };
    } catch (error) {
      console.error('Error searching products:', error);
      return { products: [], total: 0 };
    }
  }

  /**
   * Get related products
   */
  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    try {
      // First get the original product
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      // Then get related products of the same type and category
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('type', product.type)
        .eq('category', product.category)
        .neq('id', productId)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // If not enough products found, get more based on type only
      if (data.length < limit) {
        const remaining = limit - data.length;
        const { data: moreData, error: moreError } = await supabase
          .from('products')
          .select('*')
          .eq('type', product.type)
          .neq('id', productId)
          .not('id', 'in', `(${data.map(p => p.id).join(',')})`)
          .order('rating', { ascending: false })
          .limit(remaining);

        if (moreError) throw moreError;
        data.push(...moreData);
      }

      return data as Product[];
    } catch (error) {
      console.error('Error getting related products:', error);
      return [];
    }
  }
} 