import { createClient } from '@supabase/supabase-js';
import { AnalyticsService } from './analytics-service';
import nodemailer from 'nodemailer';
import { Twilio } from 'twilio';

// Define the Alert interface
export interface Alert {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isActive: boolean;
  productId?: string;
  threshold: {
    metricType: 'views' | 'uniqueVisitors' | 'tryOns' | 'conversion' | 'rating';
    condition: 'above' | 'below';
    value: number;
    timeframeHours: number;
  };
  notificationMethods: {
    type: 'email' | 'sms' | 'inApp';
    enabled: boolean;
    destination?: string;
  }[];
  lastTriggered?: string;
  createdAt: string;
  updatedAt: string;
}

// Define the CreateAlertParams interface for creating new alerts
export interface CreateAlertParams {
  userId: string;
  name: string;
  description?: string;
  isActive: boolean;
  productId?: string;
  threshold: {
    metricType: string;
    condition: 'above' | 'below';
    value: number;
    timeframeHours: number;
  };
  notificationMethods: Array<{
    type: 'email' | 'sms' | 'inApp';
    enabled: boolean;
    config?: Record<string, any>;
  }>;
}

export interface AlertCheck {
  alertId: string;
  currentValue: number;
  threshold: number;
  condition: 'above' | 'below';
  triggered: boolean;
  checkedAt: string;
}

export interface AlertNotification {
  id: string;
  alertId: string;
  userId: string;
  message: string;
  read: boolean;
  notificationMethod: string;
  sentAt: string;
}

// Initialize email and SMS clients
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
});

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
  : null;

export class AnalyticsAlertService {
  private supabase;
  private analyticsService;
  
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    this.analyticsService = new AnalyticsService();
  }

  /**
   * Create a new analytics alert
   * @param alert Alert data to create
   * @returns The created alert or error
   */
  async createAlert(alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Alert | null; error: Error | null }> {
    try {
      // Track event
      await this.analyticsService.trackEvent({
        eventName: 'alert_created',
        userId: alert.userId,
        properties: {
          alertName: alert.name,
          metricType: alert.threshold.metricType,
          productId: alert.productId || 'all_products'
        }
      });

      const now = new Date().toISOString();
      const newAlert = {
        ...alert,
        createdAt: now,
        updatedAt: now
      };

      const { data, error } = await this.supabase
        .from('alerts')
        .insert(newAlert)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error creating alert:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get all alerts for a specific user
   * @param userId The user ID to get alerts for
   * @returns List of alerts or error
   */
  async getAlertsByUser(userId: string): Promise<{ data: Alert[]; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('alerts')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error getting user alerts:', error);
      return { data: [], error: error as Error };
    }
  }

  /**
   * Get a specific alert by its ID
   * @param alertId The alert ID to retrieve
   * @returns The alert or error
   */
  async getAlertById(alertId: string): Promise<{ data: Alert | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('alerts')
        .select('*')
        .eq('id', alertId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error getting alert:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get alerts for a specific product
   * @param productId The product ID to get alerts for
   * @returns List of alerts or error
   */
  async getAlertsByProduct(productId: string): Promise<{ data: Alert[]; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('alerts')
        .select('*')
        .eq('productId', productId)
        .eq('isActive', true)
        .order('createdAt', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error getting product alerts:', error);
      return { data: [], error: error as Error };
    }
  }

  /**
   * Update an existing alert
   * @param alertId The ID of the alert to update
   * @param alert The updated alert data
   * @returns The updated alert or error
   */
  async updateAlert(alertId: string, update: Partial<Alert>): Promise<{ data: Alert | null; error: Error | null }> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await this.supabase
        .from('alerts')
        .update({
          ...update,
          updatedAt: now
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;

      // Track event
      if (data) {
        await this.analyticsService.trackEvent({
          eventName: 'alert_updated',
          userId: data.userId,
          properties: {
            alertId,
            alertName: data.name,
            isActive: data.isActive
          }
        });
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error updating alert:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete an alert
   * @param alertId The ID of the alert to delete
   * @returns Success or error
   */
  async deleteAlert(alertId: string): Promise<{ error: Error | null }> {
    try {
      // Get the alert first to track the deletion
      const { data: alert } = await this.supabase
        .from('alerts')
        .select('userId, name')
        .eq('id', alertId)
        .single();

      const { error } = await this.supabase
        .from('alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      // Track deletion event if we found the alert
      if (alert) {
        await this.analyticsService.trackEvent({
          eventName: 'alert_deleted',
          userId: alert.userId,
          properties: {
            alertId,
            alertName: alert.name
          }
        });
      }

      return { error: null };
    } catch (error) {
      console.error('Error deleting alert:', error);
      return { error: error as Error };
    }
  }
  
  /**
   * Check if any alerts have been triggered for a product
   * @param productId The product ID to check alerts for
   * @returns Triggered alerts or error
   */
  async checkProductAlerts(productId: string) {
    try {
      // Get active alerts for this product
      const { data: alerts, error } = await this.getAlertsByProduct(productId);
      
      if (error) throw error;
      if (!alerts || alerts.length === 0) return { data: [], error: null };
      
      const triggeredAlerts = [];
      
      // For each alert, check if it's been triggered
      for (const alert of alerts) {
        const { threshold } = alert;
        const { metricType, condition, value, timeframeHours } = threshold;
        
        // Get the current metric value
        const timeframeStart = new Date();
        timeframeStart.setHours(timeframeStart.getHours() - timeframeHours);
        
        const metricValue = await this.getMetricValue(
          productId, 
          metricType, 
          timeframeStart.toISOString()
        );
        
        if (!metricValue) continue;
        
        // Check if the alert condition is met
        const isTriggered = condition === 'above' 
          ? metricValue > value 
          : metricValue < value;
        
        if (isTriggered) {
          triggeredAlerts.push({
            alert,
            currentValue: metricValue,
            triggeredAt: new Date().toISOString()
          });
        }
      }
      
      return { data: triggeredAlerts, error: null };
    } catch (error) {
      console.error('Error checking product alerts:', error);
      return { data: null, error };
    }
  }
  
  /**
   * Get the current value for a specific metric
   * @param productId The product ID to get the metric for
   * @param metricType The type of metric to retrieve
   * @param startTime The start time for the metric calculation
   * @returns The metric value or null if not available
   */
  private async getMetricValue(productId: string, metricType: string, startTime: string): Promise<number | null> {
    try {
      switch (metricType) {
        case 'views':
          const viewsResponse = await this.analyticsService.getProductViews(productId, startTime);
          return viewsResponse.totalViews || 0;
          
        case 'uniqueVisitors':
          const uniqueVisitorsResponse = await this.analyticsService.getUniqueVisitors(productId, startTime);
          return uniqueVisitorsResponse.uniqueVisitors || 0;
          
        case 'tryOns':
          const tryOnsResponse = await this.analyticsService.getTryOnCount(productId, startTime);
          return tryOnsResponse.tryOnCount || 0;
          
        case 'conversion':
          const conversionResponse = await this.analyticsService.getConversionRate(productId, startTime);
          return conversionResponse.conversionRate || 0;
          
        case 'rating':
          const ratingsResponse = await this.analyticsService.getAverageRating(productId, startTime);
          return ratingsResponse.averageRating || 0;
          
        default:
          console.warn(`Unknown metric type: ${metricType}`);
          return null;
      }
    } catch (error) {
      console.error(`Error getting metric value for ${metricType}:`, error);
      return null;
    }
  }

  /**
   * Check if a specific alert is triggered
   * @param alertId The ID of the alert to check
   * @returns The alert check result or error
   */
  async checkAlert(alertId: string): Promise<{ data: AlertCheck | null; error: Error | null }> {
    try {
      // Get the alert
      const { data: alert, error: alertError } = await this.getAlertById(alertId);
      
      if (alertError) throw alertError;
      if (!alert) throw new Error('Alert not found');
      if (!alert.isActive) return { data: null, error: null }; // Skip inactive alerts
      
      // Get the current metric value
      const { metricType, condition, value, timeframeHours } = alert.threshold;
      const productId = alert.productId;
      
      let currentValue = 0;
      const timeframe = timeframeHours * 60 * 60 * 1000; // Convert hours to milliseconds
      const since = new Date(Date.now() - timeframe).toISOString();
      
      // Get the appropriate metric based on the alert type
      switch (metricType) {
        case 'views':
          const viewsData = await this.analyticsService.getProductViews(productId, since);
          currentValue = viewsData.total || 0;
          break;
        case 'uniqueVisitors':
          const visitorsData = await this.analyticsService.getUniqueVisitors(productId, since);
          currentValue = visitorsData.total || 0;
          break;
        case 'tryOns':
          const tryOnsData = await this.analyticsService.getTryOns(productId, since);
          currentValue = tryOnsData.total || 0;
          break;
        case 'conversion':
          const conversionData = await this.analyticsService.getConversionRate(productId, since);
          currentValue = conversionData.rate || 0;
          break;
        case 'rating':
          const ratingData = await this.analyticsService.getAverageRating(productId, since);
          currentValue = ratingData.average || 0;
          break;
      }
      
      // Check if the alert is triggered
      const isTriggered = condition === 'above' 
        ? currentValue > value 
        : currentValue < value;
      
      // Create alert check record
      const alertCheck: AlertCheck = {
        alertId,
        currentValue,
        threshold: value,
        condition,
        triggered: isTriggered,
        checkedAt: new Date().toISOString()
      };
      
      // If triggered, update the lastTriggered timestamp and send notifications
      if (isTriggered) {
        await this.updateAlert(alertId, { lastTriggered: alertCheck.checkedAt });
        await this.sendAlertNotifications(alert, currentValue);
      }
      
      return { data: alertCheck, error: null };
    } catch (error) {
      console.error('Error checking alert:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Check all alerts
   * @returns Success or error
   */
  async checkAllAlerts(): Promise<{ success: boolean; error: Error | null }> {
    try {
      // Get all active alerts
      const { data: activeAlerts, error } = await this.supabase
        .from('alerts')
        .select('*')
        .eq('isActive', true);
      
      if (error) throw error;
      
      // Check each alert
      for (const alert of activeAlerts || []) {
        await this.checkAlert(alert.id);
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error checking all alerts:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Send alert notifications
   * @param alert The alert to send notifications for
   * @param currentValue The current metric value
   */
  async sendAlertNotifications(alert: Alert, currentValue: number): Promise<void> {
    try {
      const { name, threshold, notificationMethods, userId } = alert;
      const productId = alert.productId;
      
      // Get product name if we have a product ID
      let productName = 'All products';
      if (productId) {
        const { data: product } = await this.supabase
          .from('products')
          .select('name')
          .eq('id', productId)
          .single();
        
        if (product) {
          productName = product.name;
        }
      }
      
      // Create notification message
      const metricName = threshold.metricType.replace(/([A-Z])/g, ' $1').toLowerCase();
      const formattedValue = threshold.metricType === 'conversion' ? `${currentValue}%` : currentValue;
      const message = `Alert "${name}": ${productName} ${metricName} is ${threshold.condition === 'above' ? 'above' : 'below'} threshold (${formattedValue} ${threshold.condition === 'above' ? '>' : '<'} ${threshold.value}${threshold.metricType === 'conversion' ? '%' : ''})`;
      
      // Send notifications based on enabled methods
      for (const method of notificationMethods.filter(m => m.enabled)) {
        // Create notification record
        const notification = {
          alertId: alert.id,
          userId,
          message,
          read: false,
          notificationMethod: method.type,
          sentAt: new Date().toISOString()
        };
        
        await this.supabase
          .from('alert_notifications')
          .insert(notification);
        
        // Email notification
        if (method.type === 'email' && method.destination) {
          try {
            // Get user information for a more personalized email
            const { data: user } = await this.supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', userId)
              .single();
            
            const userEmail = method.destination || user?.email;
            const userName = user?.full_name || 'User';
            
            if (!userEmail) {
              console.error('No email destination for alert notification');
              continue;
            }
            
            // Create a more formatted email with HTML
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
                <h2 style="color: #5c6ac4;">VibeWell Analytics Alert</h2>
                <div style="border-left: 4px solid #5c6ac4; padding: 15px; background-color: #f9f9f9; margin: 20px 0;">
                  <p style="margin: 0; font-size: 16px;"><strong>${message}</strong></p>
                </div>
                <p>Hello ${userName},</p>
                <p>This is an automated alert from your VibeWell analytics dashboard.</p>
                <p><strong>Alert Details:</strong></p>
                <ul>
                  <li><strong>Product:</strong> ${productName}</li>
                  <li><strong>Metric:</strong> ${metricName}</li>
                  <li><strong>Current Value:</strong> ${formattedValue}</li>
                  <li><strong>Threshold:</strong> ${threshold.value}${threshold.metricType === 'conversion' ? '%' : ''}</li>
                  <li><strong>Condition:</strong> ${threshold.condition === 'above' ? 'Above' : 'Below'} threshold</li>
                </ul>
                <p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/analytics/alerts/view/${alert.id}" 
                     style="background-color: #5c6ac4; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 15px;">
                    View Alert Details
                  </a>
                </p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                  This is an automated message. Please do not reply to this email.
                  You can manage your alert settings in the VibeWell dashboard.
                </p>
              </div>
            `;
            
            // Send the email
            await emailTransporter.sendMail({
              from: `"VibeWell Analytics" <${process.env.EMAIL_FROM || 'alerts@vibewell.com'}>`,
              to: userEmail,
              subject: `VibeWell Alert: ${name}`,
              text: message,
              html: emailHtml,
            });
            
            console.log(`Email notification sent to ${userEmail}`);
          } catch (emailError) {
            console.error('Error sending email notification:', emailError);
          }
        }
        
        // SMS notification
        if (method.type === 'sms' && method.destination) {
          try {
            if (!twilioClient) {
              console.error('Twilio client not initialized');
              continue;
            }
            
            // Format phone number - ensure it has country code
            let phoneNumber = method.destination;
            if (!phoneNumber.startsWith('+')) {
              phoneNumber = `+1${phoneNumber}`; // Default to US country code
            }
            
            // Keep SMS messages brief
            const smsMessage = `VibeWell Alert: ${message.substring(0, 140)}`;
            
            // Send SMS using Twilio
            await twilioClient.messages.create({
              body: smsMessage,
              from: process.env.TWILIO_PHONE_NUMBER || '',
              to: phoneNumber
            });
            
            console.log(`SMS notification sent to ${phoneNumber}`);
          } catch (smsError) {
            console.error('Error sending SMS notification:', smsError);
          }
        }
      }
      
      // Track notification event
      await this.analyticsService.trackEvent({
        eventName: 'alert_triggered',
        userId,
        properties: {
          alertId: alert.id,
          alertName: name,
          productId: productId || 'all_products',
          metricType: threshold.metricType,
          currentValue
        }
      });
    } catch (error) {
      console.error('Error sending alert notifications:', error);
    }
  }

  /**
   * Get notifications for a specific user
   * @param userId The user ID to get notifications for
   * @param unreadOnly Whether to get only unread notifications
   * @returns List of notifications or error
   */
  async getNotifications(userId: string, unreadOnly = false): Promise<{ data: AlertNotification[]; error: Error | null }> {
    try {
      let query = this.supabase
        .from('alert_notifications')
        .select('*')
        .eq('userId', userId)
        .order('sentAt', { ascending: false });
      
      if (unreadOnly) {
        query = query.eq('read', false);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error getting notifications:', error);
      return { data: [], error: error as Error };
    }
  }

  /**
   * Mark a notification as read
   * @param notificationId The ID of the notification to mark as read
   * @returns Success or error
   */
  async markNotificationAsRead(notificationId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await this.supabase
        .from('alert_notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Mark all notifications as read for a specific user
   * @param userId The user ID to mark notifications for
   * @returns Success or error
   */
  async markAllNotificationsAsRead(userId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await this.supabase
        .from('alert_notifications')
        .update({ read: true })
        .eq('userId', userId)
        .eq('read', false);
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error: error as Error };
    }
  }
} 