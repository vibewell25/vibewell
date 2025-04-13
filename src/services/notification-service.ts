/**
 * Notification Service
 * Handles notifications across the application
 */

export interface Notification {
  type: 'system' | 'user' | 'alert';
  subject: string;
  message: string;
  data?: any;
}

export interface EmailNotification extends Notification {
  recipient: string;
}

export class NotificationService {
  private baseUrl: string;
  private endpoint = '/api/notifications';
  
  constructor() {
    // Use environment variable or fallback to default
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  }
  
  /**
   * Send a notification to a user
   * @param userId - The ID of the user to notify
   * @param notification - The notification to send
   */
  async notifyUser(userId: string, notification: Notification): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/users/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }
  
  /**
   * Send a notification to all users with a specific role
   * @param role - The role to target
   * @param notification - The notification to send
   */
  async notifyByRole(role: string, notification: Notification): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/roles/${role}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to send notification to role:', error);
      return false;
    }
  }
  
  /**
   * Send a notification to a channel or topic
   * @param channel - The channel to notify
   * @param notification - The notification to send
   */
  async notifyChannel(channel: string, notification: Notification): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/channels/${channel}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to send notification to channel:', error);
      return false;
    }
  }
  
  /**
   * Send a system notification to all admins
   * @param notification - The notification to send
   */
  async notifyAdmins(notification: Notification): Promise<boolean> {
    return this.notifyByRole('admin', notification);
  }
  
  /**
   * Send an email notification
   * @param notification - The email notification to send
   */
  async sendEmailNotification(notification: EmailNotification): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }
}

// Export as default
export default NotificationService;