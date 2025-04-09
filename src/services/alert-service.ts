import { createClient } from '@supabase/supabase-js';
import { AnalyticsService } from './analytics-service';
import { NotificationService } from './notification-service';
import { ProductService } from './product-service';
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

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
      const { data, error } = await supabase
        .from('alert_thresholds')
        .insert([{
          name: alert.name,
          description: alert.description,
          is_active: alert.is_active,
          product_id: alert.product_id,
          metric: alert.metric,
          condition: alert.condition,
          threshold: alert.threshold,
          notification_methods: alert.notification_methods
        }])
        .select()
        .single();

      if (error) throw error;

      // Track alert creation
      this.analyticsService.trackEvent('alert_created', {
        alert_id: data.id,
        product_id: data.product_id,
        metric: data.metric
      });

      return data;
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
      const { data, error } = await supabase
        .from('alert_thresholds')
        .update({
          name: alert.name,
          description: alert.description,
          is_active: alert.is_active,
          product_id: alert.product_id,
          metric: alert.metric,
          condition: alert.condition,
          threshold: alert.threshold,
          notification_methods: alert.notification_methods
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Track alert update
      this.analyticsService.trackEvent('alert_updated', {
        alert_id: data.id,
        product_id: data.product_id,
        metric: data.metric
      });

      return data;
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
      const { error } = await supabase
        .from('alert_thresholds')
        .delete()
        .eq('id', id);

      if (error) throw error;

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
      const { data, error } = await supabase
        .from('alert_thresholds')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('alert_thresholds')
        .select('*')
        .eq('product_id', productId);

      if (error) throw error;
      return data || [];
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
      let query = supabase
        .from('alert_thresholds')
        .select('*')
        .order('created_at', { ascending: false });

      if (options.isActive !== undefined) {
        query = query.eq('is_active', options.isActive);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
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
      const { data, error } = await supabase
        .from('dashboard_notifications')
        .insert([{
          alert_id: notification.alert_id,
          product_id: notification.product_id,
          current_value: notification.current_value,
          threshold_value: notification.threshold_value,
          is_read: false
        }])
        .select()
        .single();

      if (error) throw error;

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
              threshold: alert.threshold
            }
          });
        }
        
        if (alert.notification_methods.includes('sms')) {
          await this.notificationService.sendSMSNotification({
            message: `VibeWell Alert: ${alert.name} - ${alert.metric} is now ${notification.current_value} (threshold: ${alert.threshold})`,
            data: {
              alertId: alert.id,
              productId: alert.product_id
            }
          });
        }
      }

      return data;
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
      const { data, error } = await supabase
        .from('dashboard_notifications')
        .select('*')
        .eq('alert_id', alertId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
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
      const { data, error } = await supabase
        .from('dashboard_notifications')
        .select('*, alert_thresholds(*)')
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
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
      const { error } = await supabase
        .from('dashboard_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Check metrics against alert thresholds and create notifications if needed
   */
  async checkMetricsAgainstAlerts(productId: string, metrics: Record<string, number>): Promise<void> {
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
              is_read: false
            });
            
            // Track alert triggered event
            this.analyticsService.trackEvent('alert_triggered', {
              alert_id: alert.id,
              product_id: productId,
              metric: alert.metric,
              current_value: currentValue,
              threshold: alert.threshold
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