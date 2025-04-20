import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';
import axios from 'axios';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const supplierConfigSchema = z.object({
  apiKey: z.string(),
  apiEndpoint: z.string().url(),
  webhookUrl: z.string().url().optional(),
  supplierType: z.enum(['DIRECT', 'MARKETPLACE', 'DISTRIBUTOR']),
  integrationSettings: z.record(z.any()).optional()
});

const orderRequestSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
  requestedDeliveryDate: z.date().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  notes: z.string().optional()
});

interface SupplierConfig {
  apiKey: string;
  apiEndpoint: string;
  webhookUrl?: string;
  supplierType: 'DIRECT' | 'MARKETPLACE' | 'DISTRIBUTOR';
  integrationSettings?: Record<string, any>;
}

interface OrderRequest {
  productId: string;
  quantity: number;
  requestedDeliveryDate?: Date;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  notes?: string;
}

interface OrderResponse {
  orderId: string;
  status: 'CONFIRMED' | 'PENDING' | 'REJECTED';
  estimatedDeliveryDate?: Date;
  pricing: {
    unitPrice: number;
    totalPrice: number;
    currency: string;
  };
  message?: string;
}

export class SupplierIntegrationService {
  private supplierConfigs: Map<string, SupplierConfig> = new Map();

  constructor() {
    this.initializeSupplierConfigs();
  }

  /**
   * Initialize supplier configurations from database
   */
  private async initializeSupplierConfigs(): Promise<void> {
    try {
      const suppliers = await prisma.supplier.findMany({
        where: {
          isActive: true,
          integrationConfig: {
            not: null
          }
        },
        include: {
          integrationConfig: true
        }
      });

      suppliers.forEach(supplier => {
        if (supplier.integrationConfig) {
          const config = supplierConfigSchema.parse(supplier.integrationConfig);
          this.supplierConfigs.set(supplier.id, config);
        }
      });

      logger.info('Supplier configurations initialized', 'SupplierIntegration', {
        supplierCount: suppliers.length
      });
    } catch (error) {
      logger.error('Failed to initialize supplier configurations', 'SupplierIntegration', { error });
      throw error;
    }
  }

  /**
   * Place an order with a supplier through their API
   */
  async placeOrder(
    supplierId: string,
    orderRequest: OrderRequest
  ): Promise<OrderResponse> {
    try {
      // Validate request
      const validatedRequest = orderRequestSchema.parse(orderRequest);
      const supplierConfig = this.getSupplierConfig(supplierId);

      // Prepare order payload based on supplier type
      const payload = this.prepareOrderPayload(supplierConfig.supplierType, validatedRequest);

      // Send order to supplier API
      const response = await axios.post(
        `${supplierConfig.apiEndpoint}/orders`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${supplierConfig.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Store order in database
      await this.storeOrder(supplierId, validatedRequest, response.data);

      return this.normalizeOrderResponse(response.data);
    } catch (error) {
      logger.error('Failed to place order with supplier', 'SupplierIntegration', {
        supplierId,
        error
      });
      throw error;
    }
  }

  /**
   * Check order status with supplier
   */
  async checkOrderStatus(supplierId: string, orderId: string): Promise<Record<string, any>> {
    try {
      const supplierConfig = this.getSupplierConfig(supplierId);

      const response = await axios.get(
        `${supplierConfig.apiEndpoint}/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${supplierConfig.apiKey}`
          }
        }
      );

      await this.updateOrderStatus(orderId, response.data);

      return response.data;
    } catch (error) {
      logger.error('Failed to check order status', 'SupplierIntegration', {
        supplierId,
        orderId,
        error
      });
      throw error;
    }
  }

  /**
   * Set up webhook for order status updates
   */
  async configureWebhook(supplierId: string, webhookUrl: string): Promise<void> {
    try {
      const supplierConfig = this.getSupplierConfig(supplierId);

      await axios.post(
        `${supplierConfig.apiEndpoint}/webhooks`,
        {
          url: webhookUrl,
          events: ['order.status_update', 'order.shipped', 'order.delivered']
        },
        {
          headers: {
            'Authorization': `Bearer ${supplierConfig.apiKey}`
          }
        }
      );

      // Update supplier config
      await prisma.supplier.update({
        where: { id: supplierId },
        data: {
          integrationConfig: {
            ...supplierConfig,
            webhookUrl
          }
        }
      });

      this.supplierConfigs.set(supplierId, {
        ...supplierConfig,
        webhookUrl
      });

      logger.info('Webhook configured successfully', 'SupplierIntegration', {
        supplierId,
        webhookUrl
      });
    } catch (error) {
      logger.error('Failed to configure webhook', 'SupplierIntegration', {
        supplierId,
        error
      });
      throw error;
    }
  }

  /**
   * Handle incoming webhook events from suppliers
   */
  async handleWebhookEvent(supplierId: string, event: Record<string, any>): Promise<void> {
    try {
      switch (event.type) {
        case 'order.status_update':
          await this.handleOrderStatusUpdate(event.data);
          break;
        case 'order.shipped':
          await this.handleOrderShipped(event.data);
          break;
        case 'order.delivered':
          await this.handleOrderDelivered(event.data);
          break;
        default:
          logger.warn('Unhandled webhook event type', 'SupplierIntegration', {
            supplierId,
            eventType: event.type
          });
      }
    } catch (error) {
      logger.error('Failed to handle webhook event', 'SupplierIntegration', {
        supplierId,
        event,
        error
      });
      throw error;
    }
  }

  private getSupplierConfig(supplierId: string): SupplierConfig {
    const config = this.supplierConfigs.get(supplierId);
    if (!config) {
      throw new Error(`No configuration found for supplier ${supplierId}`);
    }
    return config;
  }

  private prepareOrderPayload(
    supplierType: SupplierConfig['supplierType'],
    orderRequest: OrderRequest
  ): Record<string, any> {
    // Implement different payload formats based on supplier type
    switch (supplierType) {
      case 'DIRECT':
        return {
          product_id: orderRequest.productId,
          quantity: orderRequest.quantity,
          delivery_date: orderRequest.requestedDeliveryDate?.toISOString(),
          priority: orderRequest.priority,
          notes: orderRequest.notes
        };
      case 'MARKETPLACE':
        return {
          sku: orderRequest.productId,
          qty: orderRequest.quantity,
          requested_delivery: orderRequest.requestedDeliveryDate?.toISOString(),
          urgency: orderRequest.priority,
          additional_info: orderRequest.notes
        };
      case 'DISTRIBUTOR':
        return {
          itemId: orderRequest.productId,
          orderQty: orderRequest.quantity,
          targetDelivery: orderRequest.requestedDeliveryDate?.toISOString(),
          orderPriority: orderRequest.priority,
          comments: orderRequest.notes
        };
    }
  }

  private async storeOrder(
    supplierId: string,
    request: OrderRequest,
    response: Record<string, any>
  ): Promise<void> {
    await prisma.supplierOrder.create({
      data: {
        supplierId,
        productId: request.productId,
        quantity: request.quantity,
        requestedDeliveryDate: request.requestedDeliveryDate,
        priority: request.priority,
        notes: request.notes,
        externalOrderId: response.orderId,
        status: response.status,
        estimatedDeliveryDate: response.estimatedDeliveryDate,
        unitPrice: response.pricing.unitPrice,
        totalPrice: response.pricing.totalPrice,
        currency: response.pricing.currency
      }
    });
  }

  private normalizeOrderResponse(response: Record<string, any>): OrderResponse {
    return {
      orderId: response.orderId || response.order_id || response.id,
      status: this.normalizeOrderStatus(response.status),
      estimatedDeliveryDate: response.estimatedDeliveryDate || response.estimated_delivery,
      pricing: {
        unitPrice: response.pricing.unitPrice || response.unit_price,
        totalPrice: response.pricing.totalPrice || response.total_price,
        currency: response.pricing.currency
      },
      message: response.message || response.notes
    };
  }

  private normalizeOrderStatus(status: string): OrderResponse['status'] {
    status = status.toUpperCase();
    if (status.includes('CONFIRM')) return 'CONFIRMED';
    if (status.includes('PEND')) return 'PENDING';
    if (status.includes('REJECT') || status.includes('FAIL')) return 'REJECTED';
    return 'PENDING';
  }

  private async updateOrderStatus(
    orderId: string,
    statusData: Record<string, any>
  ): Promise<void> {
    await prisma.supplierOrder.update({
      where: { externalOrderId: orderId },
      data: {
        status: this.normalizeOrderStatus(statusData.status),
        estimatedDeliveryDate: statusData.estimatedDeliveryDate,
        lastStatusUpdate: new Date()
      }
    });
  }

  private async handleOrderStatusUpdate(data: Record<string, any>): Promise<void> {
    await this.updateOrderStatus(data.orderId, data);
  }

  private async handleOrderShipped(data: Record<string, any>): Promise<void> {
    await prisma.supplierOrder.update({
      where: { externalOrderId: data.orderId },
      data: {
        status: 'SHIPPED',
        shippedAt: new Date(),
        trackingNumber: data.trackingNumber,
        carrier: data.carrier
      }
    });
  }

  private async handleOrderDelivered(data: Record<string, any>): Promise<void> {
    await prisma.supplierOrder.update({
      where: { externalOrderId: data.orderId },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date()
      }
    });

    // Update inventory
    const order = await prisma.supplierOrder.findUnique({
      where: { externalOrderId: data.orderId }
    });

    if (order) {
      await prisma.product.update({
        where: { id: order.productId },
        data: {
          stockQuantity: {
            increment: order.quantity
          }
        }
      });
    }
  }
} 