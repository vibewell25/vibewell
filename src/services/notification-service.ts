import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define types
export interface EmailNotification {
  type: 'alert' | 'feedback' | 'product' | 'system';
  recipient?: string;
  subject: string;
  message: string;
  data?: Record<string, any>;
}

export interface SMSNotification {
  recipient?: string;
  message: string;
  data?: Record<string, any>;
}

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, any>;
  userId?: string;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  productAlerts: boolean;
  feedback: boolean;
  system: boolean;
}

export class NotificationService {
  /**
   * Send an email notification
   */
  async sendEmailNotification(notification: EmailNotification): Promise<void> {
    try {
      // In a real implementation, this would call an email service API
      // For now, we'll just log it and store in the database for tracking
      console.log('Sending email notification:', notification);
      
      const { error } = await supabase
        .from('notification_log')
        .insert([{
          type: 'email',
          notification_type: notification.type,
          recipient: notification.recipient,
          subject: notification.subject,
          message: notification.message,
          data: notification.data
        }]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error sending email notification:', error);
      throw error;
    }
  }

  /**
   * Send an SMS notification
   */
  async sendSMSNotification(notification: SMSNotification): Promise<void> {
    try {
      // In a real implementation, this would call an SMS service API
      // For now, we'll just log it and store in the database for tracking
      console.log('Sending SMS notification:', notification);
      
      const { error } = await supabase
        .from('notification_log')
        .insert([{
          type: 'sms',
          recipient: notification.recipient,
          message: notification.message,
          data: notification.data
        }]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      throw error;
    }
  }

  /**
   * Send a push notification
   */
  async sendPushNotification(notification: PushNotification): Promise<void> {
    try {
      // In a real implementation, this would call a push notification service
      // For now, we'll just log it and store in the database for tracking
      console.log('Sending push notification:', notification);
      
      const { error } = await supabase
        .from('notification_log')
        .insert([{
          type: 'push',
          recipient: notification.userId,
          subject: notification.title,
          message: notification.body,
          data: notification.data
        }]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  /**
   * Get a user's notification preferences
   */
  async getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found, create default preferences
          return this.createDefaultNotificationPreferences(userId);
        }
        throw error;
      }
      
      return {
        userId: data.user_id,
        email: data.email_enabled,
        sms: data.sms_enabled,
        push: data.push_enabled,
        marketing: data.marketing_enabled,
        productAlerts: data.product_alerts_enabled,
        feedback: data.feedback_enabled,
        system: data.system_enabled
      };
    } catch (error) {
      console.error('Error getting user notification preferences:', error);
      throw error;
    }
  }

  /**
   * Create default notification preferences for a user
   */
  private async createDefaultNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const defaultPreferences = {
        user_id: userId,
        email_enabled: true,
        sms_enabled: false,
        push_enabled: true,
        marketing_enabled: true,
        product_alerts_enabled: true,
        feedback_enabled: true,
        system_enabled: true
      };
      
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .insert([defaultPreferences])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        userId: data.user_id,
        email: data.email_enabled,
        sms: data.sms_enabled,
        push: data.push_enabled,
        marketing: data.marketing_enabled,
        productAlerts: data.product_alerts_enabled,
        feedback: data.feedback_enabled,
        system: data.system_enabled
      };
    } catch (error) {
      console.error('Error creating default notification preferences:', error);
      throw error;
    }
  }

  /**
   * Update a user's notification preferences
   */
  async updateUserNotificationPreferences(
    userId: string,
    preferences: Partial<Omit<NotificationPreferences, 'userId'>>
  ): Promise<NotificationPreferences> {
    try {
      const updateData: Record<string, boolean> = {};
      
      if (preferences.email !== undefined) updateData.email_enabled = preferences.email;
      if (preferences.sms !== undefined) updateData.sms_enabled = preferences.sms;
      if (preferences.push !== undefined) updateData.push_enabled = preferences.push;
      if (preferences.marketing !== undefined) updateData.marketing_enabled = preferences.marketing;
      if (preferences.productAlerts !== undefined) updateData.product_alerts_enabled = preferences.productAlerts;
      if (preferences.feedback !== undefined) updateData.feedback_enabled = preferences.feedback;
      if (preferences.system !== undefined) updateData.system_enabled = preferences.system;
      
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        userId: data.user_id,
        email: data.email_enabled,
        sms: data.sms_enabled,
        push: data.push_enabled,
        marketing: data.marketing_enabled,
        productAlerts: data.product_alerts_enabled,
        feedback: data.feedback_enabled,
        system: data.system_enabled
      };
    } catch (error) {
      console.error('Error updating user notification preferences:', error);
      throw error;
    }
  }

  /**
   * Get notification history for a user
   */
  async getUserNotificationHistory(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notification_log')
        .select('*')
        .eq('recipient', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user notification history:', error);
      throw error;
    }
  }

  /**
   * Notify user according to their preferences
   */
  async notifyUser(
    userId: string,
    notification: {
      type: 'alert' | 'feedback' | 'product' | 'system';
      subject: string;
      message: string;
      data?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      // Get user notification preferences
      const preferences = await this.getUserNotificationPreferences(userId);
      if (!preferences) return;
      
      // Check if this notification type is enabled
      let typeEnabled = false;
      switch (notification.type) {
        case 'alert':
          typeEnabled = preferences.productAlerts;
          break;
        case 'feedback':
          typeEnabled = preferences.feedback;
          break;
        case 'system':
          typeEnabled = preferences.system;
          break;
        case 'product':
          typeEnabled = preferences.marketing;
          break;
      }
      
      if (!typeEnabled) return;
      
      // Get user contact information
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, phone')
        .eq('id', userId)
        .single();
      
      if (userError) throw userError;
      
      // Send notifications based on preferences
      const sendPromises: Promise<void>[] = [];
      
      if (preferences.email && userData.email) {
        sendPromises.push(
          this.sendEmailNotification({
            type: notification.type,
            recipient: userData.email,
            subject: notification.subject,
            message: notification.message,
            data: notification.data
          })
        );
      }
      
      if (preferences.sms && userData.phone) {
        sendPromises.push(
          this.sendSMSNotification({
            recipient: userData.phone,
            message: `${notification.subject}: ${notification.message}`,
            data: notification.data
          })
        );
      }
      
      if (preferences.push) {
        sendPromises.push(
          this.sendPushNotification({
            userId,
            title: notification.subject,
            body: notification.message,
            data: notification.data
          })
        );
      }
      
      await Promise.all(sendPromises);
    } catch (error) {
      console.error('Error notifying user:', error);
      throw error;
    }
  }
} 