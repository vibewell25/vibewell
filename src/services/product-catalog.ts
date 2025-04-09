import { supabase } from '@/lib/supabase/config';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  model_url: string;
  type: 'makeup' | 'hairstyle' | 'accessory';
  category: string;
  brand: string;
  rating: number;
  review_count: number;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  type?: 'makeup' | 'hairstyle' | 'accessory';
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}

export class ProductCatalogService {
  static async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.brand) {
      query = query.eq('brand', filters.brand);
    }

    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters.inStock !== undefined) {
      query = query.eq('in_stock', filters.inStock);
    }

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return data as Product[];
  }

  static async getProductById(id: string): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    if (!data) {
      throw new Error('Product not found');
    }

    return data as Product;
  }

  static async getRelatedProducts(productId: string): Promise<Product[]> {
    const product = await this.getProductById(productId);

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('type', product.type)
      .neq('id', productId)
      .limit(4);

    if (error) {
      throw new Error(`Failed to fetch related products: ${error.message}`);
    }

    return data as Product[];
  }

  static async getPopularProducts(limit = 10): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch popular products: ${error.message}`);
    }

    return data as Product[];
  }

  static async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .distinct();

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data.map((item) => item.category);
  }

  static async getBrands(): Promise<string[]> {
    const { data, error } = await supabase
      .from('products')
      .select('brand')
      .distinct();

    if (error) {
      throw new Error(`Failed to fetch brands: ${error.message}`);
    }

    return data.map((item) => item.brand);
  }
} 