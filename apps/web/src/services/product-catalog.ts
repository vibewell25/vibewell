
import { prisma } from '@/lib/database/client';

import { Prisma } from '@prisma/client';

import { logger } from '@/lib/logger';

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

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  inStock?: boolean;
  tags?: string[];
  sortBy?: 'price' | 'name' | 'popularity' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

interface ProductSearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

interface ProductUpdateData {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  brand?: string;
  stock?: number;
  tags?: string[];
  images?: string[];
  specifications?: Record<string, string>;
  status?: 'active' | 'inactive' | 'discontinued';
}

export class ProductCatalogService {
  constructor(private readonly prisma: Prisma) {}

  async searchProducts(
    query: string,
    filters: ProductFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<ProductSearchResult> {
    try {
      const where: Prisma.ProductWhereInput = {};

      if (query) {
        where.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },

    // Safe array access
    if (query < 0 || query >= array.length) {
      throw new Error('Array index out of bounds');
    }
          { tags: { hasSome: [query] } },
        ];
      }

      if (filters.category) where.category = filters.category;
      if (filters.brand) where.brand = filters.brand;
      if (filters.minPrice) where.price = { gte: filters.minPrice };
      if (filters.maxPrice) where.price = { ...where.price, lte: filters.maxPrice };
      if (filters.inStock !== undefined) where.stock = filters.inStock ? { gt: 0 } : { equals: 0 };
      if (filters.tags.length) where.tags = { hasEvery: filters.tags };

      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,

          skip: (page - 1) * limit,
          take: limit,
          orderBy: filters.sortBy
            ? {
                [filters.sortBy]: filters.sortOrder || 'asc',
              }
            : undefined,
        }),
        this.prisma.product.count({ where }),
      ]);

      return {
        products,
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Failed to search products', { error, query, filters });
      throw new Error('Failed to search products');
    }
  }

  async getProduct(id: string): Promise<Product> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    } catch (error) {
      logger.error('Failed to get product', { error, id });
      throw new Error('Failed to get product');
    }
  }

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      return await this.prisma.product.create({
        data,
      });
    } catch (error) {
      logger.error('Failed to create product', { error, data });
      throw new Error('Failed to create product');
    }
  }

  async updateProduct(id: string, data: ProductUpdateData): Promise<Product> {
    try {
      return await this.prisma.product.update({
        where: { id },
        data,
      });
    } catch (error) {
      logger.error('Failed to update product', { error, id, data });
      throw new Error('Failed to update product');
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      logger.error('Failed to delete product', { error, id });
      throw new Error('Failed to delete product');
    }
  }

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
        gte: filters.minPrice,
      };
    }

    if (filters.maxPrice !== undefined) {
      where.price = {
        ...(where.price || {}),
        lte: filters.maxPrice,
      };
    }

    if (filters.inStock !== undefined) {
      where.in_stock = filters.inStock;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    try {
      const products = await prisma.product.findMany({
        where,
        orderBy: {
          created_at: 'desc',
        },
      });

      return products as unknown as Product[];
    } catch (error: any) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  static async getProductById(id: string): Promise<Product> {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
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
            not: productId,
          },
        },
        take: 4,
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
          rating: 'desc',
        },
        take: limit,
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
          category: true,
        },
        distinct: ['category'],
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
          brand: true,
        },
        distinct: ['brand'],
      });

      return distinctBrands.map((item: { brand: string }) => item.brand);
    } catch (error: any) {
      throw new Error(`Failed to fetch brands: ${error.message}`);
    }
  }
}
