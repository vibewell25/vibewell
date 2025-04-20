import { PrismaClient, Prisma, Product, ProductUsage, ProductPerformance } from '@prisma/client';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

interface InventoryAlert {
  productId: string;
  type: 'LOW_STOCK' | 'REORDER' | 'EXPIRING' | 'HIGH_WASTE';
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface ProductAnalytics {
  salesVelocity: number;
  profitMargin: number;
  wastageRate: number;
  turnoverRate: number;
  daysUntilReorder: number;
}

type ProductWithRelations = Product & {
  usage: ProductUsage[];
  performance: ProductPerformance | null;
  supplier: { name: string; leadTime: number };
};

export class InventoryManagementService {
  /**
   * Updates product quantity and generates alerts if needed
   */
  public async updateProductQuantity(
    productId: string,
    quantity: number,
    type: 'ADD' | 'REMOVE'
  ): Promise<void> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) throw new Error('Product not found');

      const newQuantity = type === 'ADD' 
        ? product.quantity + quantity
        : product.quantity - quantity;

      await prisma.product.update({
        where: { id: productId },
        data: { quantity: newQuantity }
      });

      // Check if we need to generate alerts
      if (newQuantity <= product.minQuantity) {
        await this.generateAlert({
          productId,
          type: 'LOW_STOCK',
          message: `Product ${product.name} is running low (${newQuantity} remaining)`,
          priority: newQuantity <= product.minQuantity / 2 ? 'HIGH' : 'MEDIUM'
        });
      }

      // Update product performance metrics
      await this.updateProductPerformance(productId);
    } catch (error) {
      logger.error('Failed to update product quantity', 'InventoryManagement', { error, productId });
      throw error;
    }
  }

  /**
   * Processes automated reordering
   */
  public async processAutomatedReorders(): Promise<void> {
    try {
      const lowStockProducts = await prisma.product.findMany({
        where: {
          quantity: {
            lte: prisma.product.fields.minQuantity
          }
        },
        include: {
          supplier: true,
          performance: true
        }
      });

      for (const product of lowStockProducts) {
        const reorderQuantity = this.calculateReorderQuantity(product);
        
        await this.generateAlert({
          productId: product.id,
          type: 'REORDER',
          message: `Automated reorder triggered for ${product.name} (${reorderQuantity} units)`,
          priority: 'HIGH'
        });

        // Here you would integrate with your supplier's ordering system
        logger.info('Processing automated reorder', 'InventoryManagement', {
          productId: product.id,
          quantity: reorderQuantity,
          supplier: product.supplier.name
        });
      }
    } catch (error) {
      logger.error('Failed to process automated reorders', 'InventoryManagement', { error });
      throw error;
    }
  }

  /**
   * Analyzes product performance
   */
  public async analyzeProductPerformance(productId: string): Promise<ProductAnalytics> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          usage: true,
          performance: true
        }
      });

      if (!product) throw new Error('Product not found');

      const analytics: ProductAnalytics = {
        salesVelocity: this.calculateSalesVelocity(product.usage),
        profitMargin: this.calculateProfitMargin(product),
        wastageRate: product.performance?.wastageRate || 0,
        turnoverRate: this.calculateTurnoverRate(product),
        daysUntilReorder: this.calculateDaysUntilReorder(product)
      };

      return analytics;
    } catch (error) {
      logger.error('Failed to analyze product performance', 'InventoryManagement', { error, productId });
      throw error;
    }
  }

  /**
   * Generates waste reduction suggestions
   */
  public async generateWasteReductionSuggestions(productId: string): Promise<string[]> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          performance: true,
          usage: true
        }
      });

      if (!product) throw new Error('Product not found');

      const suggestions: string[] = [];

      // Analyze usage patterns
      const wastageRate = product.performance?.wastageRate || 0;
      const turnoverRate = this.calculateTurnoverRate(product);

      if (wastageRate > 0.1) { // More than 10% waste
        suggestions.push('Consider reducing order quantities to minimize waste');
        suggestions.push('Review storage conditions to extend product life');
      }

      if (turnoverRate < 1) { // Less than once per month
        suggestions.push('Product has slow turnover - consider adjusting stock levels');
        suggestions.push('Review pricing strategy to increase sales');
      }

      // Add more specific suggestions based on product type
      if (product.category === 'PERISHABLE') {
        suggestions.push('Implement FIFO (First In, First Out) inventory management');
        suggestions.push('Monitor expiration dates more frequently');
      }

      return suggestions;
    } catch (error) {
      logger.error('Failed to generate waste reduction suggestions', 'InventoryManagement', { error, productId });
      throw error;
    }
  }

  private async updateProductPerformance(productId: string): Promise<void> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        usage: true,
        performance: true
      }
    });

    if (!product) return;

    const salesVelocity = this.calculateSalesVelocity(product.usage);
    const profitMargin = this.calculateProfitMargin(product);
    const wastageRate = this.calculateWastageRate(product);

    await prisma.productPerformance.upsert({
      where: { productId },
      create: {
        productId,
        salesVelocity,
        profitMargin,
        wastageRate,
        popularity: salesVelocity * profitMargin
      },
      update: {
        salesVelocity,
        profitMargin,
        wastageRate,
        popularity: salesVelocity * profitMargin
      }
    });
  }

  private calculateSalesVelocity(usage: ProductUsage[]): number {
    if (usage.length < 2) return 0;
    
    const sortedUsage = usage
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    const daysDiff = (sortedUsage[0].createdAt.getTime() - sortedUsage[sortedUsage.length - 1].createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const totalQuantity = usage.reduce((sum, u) => sum + u.quantity, 0);
    
    return totalQuantity / daysDiff; // Units per day
  }

  private calculateProfitMargin(product: ProductWithRelations): number {
    return (product.price - product.cost) / product.price;
  }

  private calculateWastageRate(product: ProductWithRelations): number {
    const totalWaste = product.usage
      .filter(u => u.type === 'WASTE')
      .reduce((sum, u) => sum + u.quantity, 0);
    
    const totalUsage = product.usage
      .reduce((sum, u) => sum + u.quantity, 0);
    
    return totalUsage > 0 ? totalWaste / totalUsage : 0;
  }

  private calculateTurnoverRate(product: ProductWithRelations): number {
    const monthlyUsage = this.calculateSalesVelocity(product.usage) * 30;
    return product.quantity > 0 ? monthlyUsage / product.quantity : 0;
  }

  private calculateDaysUntilReorder(product: ProductWithRelations): number {
    const dailyUsage = this.calculateSalesVelocity(product.usage);
    if (dailyUsage === 0) return 365; // Default to a year if no usage
    
    const remainingQuantity = product.quantity - product.minQuantity;
    return Math.max(0, Math.floor(remainingQuantity / dailyUsage));
  }

  private calculateReorderQuantity(product: ProductWithRelations): number {
    const dailyUsage = this.calculateSalesVelocity(product.usage);
    const leadTimeDays = product.supplier.leadTime;
    const safetyStock = product.minQuantity;
    
    // Calculate reorder quantity using Economic Order Quantity (EOQ) formula
    const annualUsage = dailyUsage * 365;
    const orderCost = 20; // Fixed cost per order - this should be configurable
    const holdingCost = product.cost * 0.2; // Assume 20% holding cost
    
    const eoq = Math.sqrt((2 * annualUsage * orderCost) / holdingCost);
    
    // Add safety stock and account for lead time
    return Math.min(
      Math.ceil(eoq + safetyStock + (dailyUsage * leadTimeDays)),
      product.maxQuantity
    );
  }

  private async generateAlert(alert: InventoryAlert): Promise<void> {
    logger.info('Inventory alert generated', 'InventoryManagement', alert);
    // Here you would integrate with your notification system
  }
} 