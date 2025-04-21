import { AnalyticsService } from './analytics-service';
import { NotificationService } from './notification-service';
import { ProductService } from './product-service';
import { prisma } from '@/lib/database/client';

export interface AlertThreshold {
  id?: string;
  name: string;
  description?: string;
  is_active: boolean;
  product_id: string;
  metric: 'rating' | 'views' | 'purchases' | 'try_ons';
  condition: 'above' | 'below';
  threshold: number;
  notification_methods: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AlertNotification {
  id?: string;
  alert_id: string;
  product_id: string;
  current_value: number;
  threshold_value: number;
  is_read: boolean;
  created_at?: string;
}

export class AlertService {
  private analyticsService: AnalyticsService;
  private notificationService: NotificationService;
  private productService: ProductService;

  constructor() {
    this.analyticsService = new AnalyticsService();
    this.notificationService = new NotificationService();
    this.productService = new ProductService();
  }

  /**
   * Create a new alert threshold
   */
  async createAlert(alert: AlertThreshold): Promise<AlertThreshold> {
    try {
      const data = await prisma.alertThreshold.create({
        data: {
          name: alert.name,
          description: alert.description,
          isActive: alert.is_active,
          productId: alert.product_id,
          metric: alert.metric,
          condition: alert.condition,
          threshold: alert.threshold,
          notificationMethods: alert.notification_methods,
        },
      });

      // Track alert creation
      this.analyticsService.trackEvent('alert_created', {
        alert_id: data.id,
        product_id: data.productId,
        metric: data.metric,
      });

      // Convert Prisma model back to the interface format
      return {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        is_active: data.isActive,
        product_id: data.productId,
        metric: data.metric as any,
        condition: data.condition as any,
        threshold: data.threshold,
        notification_methods: data.notificationMethods,
        created_at: data.createdAt.toISOString(),
        updated_at: data.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  /**
   * Update an existing alert threshold
   */
  async updateAlert(id: string, alert: AlertThreshold): Promise<AlertThreshold> {
    try {
      const data = await prisma.alertThreshold.update({
        where: { id },
        data: {
          name: alert.name,
          description: alert.description,
          isActive: alert.is_active,
          productId: alert.product_id,
          metric: alert.metric,
          condition: alert.condition,
          threshold: alert.threshold,
          notificationMethods: alert.notification_methods,
        },
      });

      // Track alert update
      this.analyticsService.trackEvent('alert_updated', {
        alert_id: data.id,
        product_id: data.productId,
        metric: data.metric,
      });

      // Convert Prisma model back to the interface format
      return {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        is_active: data.isActive,
        product_id: data.productId,
        metric: data.metric as any,
        condition: data.condition as any,
        threshold: data.threshold,
        notification_methods: data.notificationMethods,
        created_at: data.createdAt.toISOString(),
        updated_at: data.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('Error updating alert:', error);
      throw error;
    }
  }

  /**
   * Delete an alert threshold
   */
  async deleteAlert(id: string): Promise<void> {
    try {
      await prisma.alertThreshold.delete({
        where: { id },
      });

      // Track alert deletion
      this.analyticsService.trackEvent('alert_deleted', { alert_id: id });
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  }

  /**
   * Get alert by ID
   */
  async getAlertById(id: string): Promise<AlertThreshold | null> {
    try {
      const data = await prisma.alertThreshold.findUnique({
        where: { id },
      });

      if (!data) return null;

      // Convert Prisma model back to the interface format
      return {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        is_active: data.isActive,
        product_id: data.productId,
        metric: data.metric as any,
        condition: data.condition as any,
        threshold: data.threshold,
        notification_methods: data.notificationMethods,
        created_at: data.createdAt.toISOString(),
        updated_at: data.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error('Error fetching alert:', error);
      throw error;
    }
  }

  /**
   * Get all alerts for a product
   */
  async getAlertsByProduct(productId: string): Promise<AlertThreshold[]> {
    try {
      const data = await prisma.alertThreshold.findMany({
        where: { productId },
      });

      // Convert Prisma models back to the interface format
      return data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || undefined,
        is_active: item.isActive,
        product_id: item.productId,
        metric: item.metric as any,
        condition: item.condition as any,
        threshold: item.threshold,
        notification_methods: item.notificationMethods,
        created_at: item.createdAt.toISOString(),
        updated_at: item.updatedAt.toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching alerts for product:', error);
      throw error;
    }
  }

  /**
   * Get all alerts
   */
  async getAllAlerts(options: { isActive?: boolean } = {}): Promise<AlertThreshold[]> {
    try {
      const data = await prisma.alertThreshold.findMany({
        where: options.isActive !== undefined ? { isActive: options.isActive } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      // Convert Prisma models back to the interface format
      return data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || undefined,
        is_active: item.isActive,
        product_id: item.productId,
        metric: item.metric as any,
        condition: item.condition as any,
        threshold: item.threshold,
        notification_methods: item.notificationMethods,
        created_at: item.createdAt.toISOString(),
        updated_at: item.updatedAt.toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching all alerts:', error);
      throw error;
    }
  }

  /**
   * Create a notification for an alert
   */
  async createAlertNotification(notification: AlertNotification): Promise<AlertNotification> {
    try {
      const data = await prisma.dashboardNotification.create({
        data: {
          type: 'alert',
          userId: null, // Will be filled in by the notification service
          content: {
            alert_id: notification.alert_id,
            product_id: notification.product_id,
            current_value: notification.current_value,
            threshold_value: notification.threshold_value,
          },
          isRead: false,
        },
      });

      // Get the alert to determine notification methods
      const alert = await this.getAlertById(notification.alert_id);

      if (alert && alert.notification_methods) {
        // Send notifications based on alert's notification_methods
        if (alert.notification_methods.includes('email')) {
          await this.notificationService.sendEmailNotification({
            type: 'alert',
            subject: `Alert: ${alert.name}`,
            message: `The ${alert.metric} for product is now ${notification.current_value}, which is ${alert.condition} the threshold of ${alert.threshold}.`,
            data: {
              alertId: alert.id,
              productId: alert.product_id,
              metric: alert.metric,
              currentValue: notification.current_value,
              threshold: alert.threshold,
            },
          });
        }

        if (alert.notification_methods.includes('sms')) {
          await this.notificationService.sendSMSNotification({
            message: `VibeWell Alert: ${alert.name} - ${alert.metric} is now ${notification.current_value} (threshold: ${alert.threshold})`,
            data: {
              alertId: alert.id,
              productId: alert.product_id,
            },
          });
        }
      }

      // Convert Prisma model back to the interface format
      const content = data.content as any;
      return {
        id: data.id,
        alert_id: content.alert_id,
        product_id: content.product_id,
        current_value: content.current_value,
        threshold_value: content.threshold_value,
        is_read: data.isRead,
        created_at: data.createdAt.toISOString(),
      };
    } catch (error) {
      console.error('Error creating alert notification:', error);
      throw error;
    }
  }

  /**
   * Get all notifications for a specific alert
   */
  async getNotificationsByAlert(alertId: string): Promise<AlertNotification[]> {
    try {
      const { data, error } = await prisma.dashboardNotification.findMany({
        where: { alert_id: alertId },
        orderBy: { createdAt: 'desc' },
      });

      if (error) throw error;
      return data.map(item => ({
        id: item.id,
        alert_id: item.alert_id,
        product_id: item.product_id,
        current_value: item.content.current_value,
        threshold_value: item.content.threshold_value,
        is_read: item.isRead,
        created_at: item.createdAt.toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching notifications for alert:', error);
      throw error;
    }
  }

  /**
   * Get all unread notifications
   */
  async getUnreadNotifications(): Promise<AlertNotification[]> {
    try {
      const { data, error } = await prisma.dashboardNotification.findMany({
        where: { isRead: false },
        orderBy: { createdAt: 'desc' },
      });

      if (error) throw error;
      return data.map(item => ({
        id: item.id,
        alert_id: item.alert_id,
        product_id: item.product_id,
        current_value: item.content.current_value,
        threshold_value: item.content.threshold_value,
        is_read: item.isRead,
        created_at: item.createdAt.toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await prisma.dashboardNotification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Check metrics against alert thresholds and create notifications if needed
   */
  async checkMetricsAgainstAlerts(
    productId: string,
    metrics: Record<string, number>
  ): Promise<void> {
    try {
      // Get active alerts for this product
      const alerts = await this.getAlertsByProduct(productId);
      const activeAlerts = alerts.filter(alert => alert.is_active);

      // Check each alert
      for (const alert of activeAlerts) {
        if (metrics[alert.metric] !== undefined) {
          const currentValue = metrics[alert.metric];
          const shouldTrigger =
            (alert.condition === 'below' && currentValue < alert.threshold) ||
            (alert.condition === 'above' && currentValue > alert.threshold);

          if (shouldTrigger) {
            // Create notification
            await this.createAlertNotification({
              alert_id: alert.id!,
              product_id: productId,
              current_value: currentValue,
              threshold_value: alert.threshold,
              is_read: false,
            });

            // Track alert triggered event
            this.analyticsService.trackEvent('alert_triggered', {
              alert_id: alert.id,
              product_id: productId,
              metric: alert.metric,
              current_value: currentValue,
              threshold: alert.threshold,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking metrics against alerts:', error);
      throw error;
    }
  }
}
