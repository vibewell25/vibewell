import { prisma } from '@/lib/database/client';

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
    const where: any = {};
    
    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.brand) {
      where.brand = filters.brand;
    }

    if (filters.minPrice !== undefined) {
      where.price = {
        ...(where.price || {}),
        gte: filters.minPrice
      };
    }

    if (filters.maxPrice !== undefined) {
      where.price = {
        ...(where.price || {}),
        lte: filters.maxPrice
      };
    }

    if (filters.inStock !== undefined) {
      where.in_stock = filters.inStock;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    try {
      const products = await prisma.product.findMany({
        where,
        orderBy: {
          created_at: 'desc'
        }
      });
      
      return products as unknown as Product[];
    } catch (error: any) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  static async getProductById(id: string): Promise<Product> {
    try {
      const product = await prisma.product.findUnique({
        where: { id }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      return product as unknown as Product;
    } catch (error: any) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  }

  static async getRelatedProducts(productId: string): Promise<Product[]> {
    try {
      const product = await this.getProductById(productId);

      const relatedProducts = await prisma.product.findMany({
        where: {
          type: product.type,
          id: {
            not: productId
          }
        },
        take: 4
      });

      return relatedProducts as unknown as Product[];
    } catch (error: any) {
      throw new Error(`Failed to fetch related products: ${error.message}`);
    }
  }

  static async getPopularProducts(limit = 10): Promise<Product[]> {
    try {
      const products = await prisma.product.findMany({
        orderBy: {
          rating: 'desc'
        },
        take: limit
      });

      return products as unknown as Product[];
    } catch (error: any) {
      throw new Error(`Failed to fetch popular products: ${error.message}`);
    }
  }

  static async getCategories(): Promise<string[]> {
    try {
      const distinctCategories = await prisma.product.findMany({
        select: {
          category: true
        },
        distinct: ['category']
      });

      return distinctCategories.map((item: { category: string }) => item.category);
    } catch (error: any) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  static async getBrands(): Promise<string[]> {
    try {
      const distinctBrands = await prisma.product.findMany({
        select: {
          brand: true
        },
        distinct: ['brand']
      });

      return distinctBrands.map((item: { brand: string }) => item.brand);
    } catch (error: any) {
      throw new Error(`Failed to fetch brands: ${error.message}`);
    }
  }
} 