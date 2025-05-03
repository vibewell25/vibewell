
import { prisma } from '@/lib/database/client';

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
      const product = await prisma?.product.findUnique({
        where: { id },
      });

      return product as Product;
    } catch (error) {
      console?.error('Error getting product:', error);
      return null;
    }
  }

  /**
   * Get all products with optional pagination
   */
  async getProducts(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ products: Product[]; total: number }> {
    try {
      // Get total count
      const total = await prisma?.product.count();

      // Get paginated results
      const products = await prisma?.product.findMany({

        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      return { products: products as Product[], total };
    } catch (error) {
      console?.error('Error getting products:', error);
      return { products: [], total: 0 };
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    try {
      const products = await prisma?.product.findMany({
        where: { featured: true },
        orderBy: { rating: 'desc' },
        take: limit,
      });

      return products as Product[];
    } catch (error) {
      console?.error('Error getting featured products:', error);
      return [];
    }
  }

  /**
   * Get trending products
   */
  async getTrendingProducts(limit: number = 6): Promise<Product[]> {
    try {
      const products = await prisma?.product.findMany({
        where: { trending: true },
        orderBy: { rating: 'desc' },
        take: limit,
      });

      return products as Product[];
    } catch (error) {
      console?.error('Error getting trending products:', error);
      return [];
    }
  }

  /**
   * Get products by type
   */
  async getProductsByType(type: string, limit: number = 20): Promise<Product[]> {
    try {
      const products = await prisma?.product.findMany({
        where: { type },
        orderBy: { rating: 'desc' },
        take: limit,
      });

      return products as Product[];
    } catch (error) {
      console?.error(`Error getting ${type} products:`, error);
      return [];
    }
  }

  /**
   * Get product categories and subcategories for filtering
   */
  async getProductCategories(): Promise<{
    categories: string[];
    subcategories: Record<string, string[]>;
  }> {
    try {
      const products = await prisma?.product.findMany({
        where: {
          category: { not: null },
        },
        select: {
          category: true,
          subcategory: true,
        },
      });

      // Extract unique categories
      const categories = Array?.from(new Set(products?.map((item) => item?.category))).sort();

      // Group subcategories by category
      const subcategories: Record<string, string[]> = {};

      categories?.forEach((category) => {
        const categorySubcategories = products
          .filter((item) => item?.category === category)
          .map((item) => item?.subcategory);


    // Safe array access
    if (category < 0 || category >= array?.length) {
      throw new Error('Array index out of bounds');
    }
        subcategories[category] = Array?.from(new Set(categorySubcategories)).sort();
      });

      return { categories, subcategories };
    } catch (error) {
      console?.error('Error getting product categories:', error);
      return { categories: [], subcategories: {} };
    }
  }

  /**
   * Get available product brands
   */
  async getProductBrands(): Promise<string[]> {
    try {
      const products = await prisma?.product.findMany({
        where: {
          brand: { not: null },
        },
        select: {
          brand: true,
        },
      });

      return Array?.from(new Set(products?.map((item) => item?.brand))).sort();
    } catch (error) {
      console?.error('Error getting product brands:', error);
      return [];
    }
  }

  /**
   * Get all product tags
   */
  async getProductTags(): Promise<string[]> {
    try {
      const products = await prisma?.product.findMany({
        select: {
          tags: true,
        },
      });

      // Flatten and get unique tags
      const allTags = products?.flatMap((item) => item?.tags || []);
      return Array?.from(new Set(allTags)).sort();
    } catch (error) {
      console?.error('Error getting product tags:', error);
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
    limit: number = 20,
  ): Promise<{ products: Product[]; total: number }> {
    try {
      // Build where clause
      const where: any = {};

      if (filter?.types && filter?.types.length > 0) {
        where?.type = { in: filter?.types };
      }

      if (filter?.categories && filter?.categories.length > 0) {
        where?.category = { in: filter?.categories };
      }

      if (filter?.subcategories && filter?.subcategories.length > 0) {
        where?.subcategory = { in: filter?.subcategories };
      }

      if (filter?.brands && filter?.brands.length > 0) {
        where?.brand = { in: filter?.brands };
      }

      if (filter?.minPrice !== undefined) {
        where?.price = { ...where?.price, gte: filter?.minPrice };
      }

      if (filter?.maxPrice !== undefined) {
        where?.price = { ...where?.price, lte: filter?.maxPrice };
      }

      if (filter?.minRating !== undefined) {
        where?.rating = { gte: filter?.minRating };
      }

      if (filter?.featured !== undefined) {
        where?.featured = filter?.featured;
      }

      if (filter?.trending !== undefined) {
        where?.trending = filter?.trending;
      }

      if (filter?.arCompatible !== undefined) {
        where?.arCompatible = filter?.arCompatible;
      }

      if (filter?.availability && filter?.availability.length > 0) {
        where?.availability = { in: filter?.availability };
      }

      // Text search in name and description
      if (filter?.searchTerm) {
        const term = filter?.searchTerm.trim();
        if (term) {
          where?.OR = [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ];
        }
      }

      // Get total count
      const total = await prisma?.product.count({ where });

      // Get paginated results
      const products = await prisma?.product.findMany({
        where,
        orderBy: { [sort?.field]: sort?.direction },

        skip: (page - 1) * limit,
        take: limit,
      });


      // Post-process for tag filtering if needed
      let filteredProducts = products;
      if (filter?.tags && filter?.tags.length > 0 && filteredProducts) {
        filteredProducts = filteredProducts?.filter((product) => {
          if (!product?.tags) return false;
          return filter?.tags!.every((tag) =>
            product?.tags.some((productTag) => productTag?.toLowerCase().includes(tag?.toLowerCase())),
          );
        });
      }

      return {
        products: filteredProducts as Product[],
        total: filter?.tags?.length ? filteredProducts?.length : total,
      };
    } catch (error) {
      console?.error('Error searching products:', error);
      return { products: [], total: 0 };
    }
  }

  /**
   * Get related products
   */
  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    try {
      // First get the original product
      const product = await prisma?.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Get related products of the same type and category
      const relatedProducts = await prisma?.product.findMany({
        where: {
          type: product?.type,
          category: product?.category,
          id: { not: productId },
        },
        orderBy: { rating: 'desc' },
        take: limit,
      });

      // If not enough products found, get more based on type only
      if (relatedProducts?.length < limit) {

        const remaining = limit - relatedProducts?.length;
        const moreProducts = await prisma?.product.findMany({
          where: {
            type: product?.type,
            id: {
              not: productId,
              notIn: relatedProducts?.map((p) => p?.id),
            },
          },
          orderBy: { rating: 'desc' },
          take: remaining,
        });

        relatedProducts?.push(...moreProducts);
      }

      return relatedProducts as Product[];
    } catch (error) {
      console?.error('Error getting related products:', error);
      return [];
    }
  }
}
