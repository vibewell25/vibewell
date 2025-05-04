import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import notifee, { 
  AndroidImportance, 
  EventType, 
  AndroidCategory, 
  AndroidVisibility,
  AuthorizationStatus, 
  Notification,
  NotificationSettings
} from '@notifee/react-native';
import { isOnline } from './offline-storage';
import { serverBaseUrl } from '../config';
import * as Notifications from 'expo-notifications';
import { NavigationService } from './navigation';
import { isAPIAvailable } from './api';

// Storage keys for push notification settings
const STORAGE_KEYS = {
  NOTIFICATION_TOKEN: '@vibewell/push_notification_token',
  NOTIFICATION_SETTINGS: '@vibewell/push_notification_settings',
  NOTIFICATION_TOPICS: '@vibewell/push_notification_topics',
  NOTIFICATION_CATEGORIES: '@vibewell/push_notification_categories',
};

// Notification categories
export enum NotificationCategory {
  APPOINTMENT = 'appointment',
  PROMOTION = 'promotion',
  MESSAGE = 'message',
  ALERT = 'alert',
  SYSTEM = 'system'
}

// Default notification channels for Android
const DEFAULT_CHANNELS = {
  appointments: {
    id: 'appointments',
    name: 'Appointments',
    description: 'Notifications for upcoming appointments',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PRIVATE,
  },
  promotions: {
    id: 'promotions',
    name: 'Promotions & Offers',
    description: 'Discounts and special offers',
    importance: AndroidImportance.DEFAULT,
    visibility: AndroidVisibility.PUBLIC,
  },
  messages: {
    id: 'messages',
    name: 'Messages',
    description: 'Chat messages and replies',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PRIVATE,
  },
  system: {
    id: 'system',
    name: 'System',
    description: 'Important system notifications',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PRIVATE,
  },
};

// Default notification topics
export const NOTIFICATION_TOPICS = {
  APPOINTMENTS: 'appointments',
  PROMOTIONS: 'promotions',
  UPDATES: 'updates',
  NEWS: 'news',
};

// Interface for notification settings
export interface NotificationSettings {
  enabled: boolean;
  categories: {
    [key in NotificationCategory]: boolean;
  };
  topics: string[];
  quietHours: {
    enabled: boolean;
    start: string; // 24h format HH:MM
    end: string; // 24h format HH:MM
  };
}

// Default notification settings
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  categories: {
    [NotificationCategory.APPOINTMENT]: true,
    [NotificationCategory.PROMOTION]: true,
    [NotificationCategory.MESSAGE]: true,
    [NotificationCategory.ALERT]: true,
    [NotificationCategory.SYSTEM]: true,
  },
  topics: [
    NOTIFICATION_TOPICS.APPOINTMENTS,
    NOTIFICATION_TOPICS.PROMOTIONS,
    NOTIFICATION_TOPICS.UPDATES,
  ],
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

/**
 * Initialize push notification services
 * @returns Promise resolving to authorization status
 */
export async function initPushNotifications(): Promise<boolean> {
  () => {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_TOKEN, newToken);
      await registerTokenWithBackend(newToken);
    });

    // Set up foreground message handler
    const unsubscribeForeground = messaging().onMessage(async () => {
      // Check if notifications are enabled and if we're in quiet hours
      if (await shouldDisplayNotification(remoteMessage)) {
        displayNotification(remoteMessage);
      } else {
        console.log('Notification suppressed due to settings or quiet hours');
      }
    });

    // Set up background/quit state handler
    messaging().setBackgroundMessageHandler(async () => {
      if (await shouldDisplayNotification(remoteMessage)) {
        displayNotification(remoteMessage);
      }
    });

    // Set up notification press handler for foreground events
    notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        handleNotificationAction(detail.notification, 'press');
      } else if (type === EventType.ACTION_PRESS) {
        handleNotificationAction(detail.notification, detail.pressAction.id || 'action');
      }
    });

    // Set up notification press handler for background events
    notifee.onBackgroundEvent(async () => {
      if (type === EventType.PRESS) {
        handleNotificationAction(detail.notification, 'press');
      } else if (type === EventType.ACTION_PRESS) {
        handleNotificationAction(detail.notification, detail.pressAction.id || 'action');
      }
    });

    // Subscribe to topics based on user settings
    await syncTopicSubscriptions();

    console.log('Push notification services initialized');
    return true;
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    return false;
  }
}

/**
 * Request permission for push notifications
 */
export async function {
  requestNotificationPermission(): Promise<boolean> {
  try {
    // Request permissions
    if (Platform.OS === 'ios') {
      const settings = await notifee.requestPermission({
        sound: true,
        alert: true,
        badge: true,
        criticalAlert: true,
        provisional: true,
      });
      
      const enabled = 
        settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED ||
        settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
        
      return enabled;
    } else {
      // Android permissions are requested at runtime when displaying notifications
      // Just check FCM permission
      const authStatus = await messaging().requestPermission();
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
             authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Set up Android notification channels
 */
async function {
  setupAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  
  try {
    // Create each channel
    for (const [key, channel] of Object.entries(DEFAULT_CHANNELS)) {
      await notifee.createChannel(channel);
    }
    
    console.log('Android notification channels created');
  } catch (error) {
    console.error('Failed to create Android notification channels:', error);
  }
}

/**
 * Register FCM token with backend
 */
async function {
  registerTokenWithBackend(token: string): Promise<void> {
  try {
    // Only proceed if we're online
    if (!(await isOnline())) {
      console.log('Device offline, will register token when online');
      return;
    }
    
    // User ID would typically come from your auth service

    fetch(`${serverBaseUrl}/api/notifications/register-device`, {
      method: 'POST',
      headers: {

    fetch(`${serverBaseUrl}/api/notifications/unregister-device`, {
            method: 'POST',
            headers: {

    
                  'Content-Type': 'application/json',

                  'Authorization': `Bearer ${await AsyncStorage.getItem('@vibewell/auth_token')}`,
            },
            body: JSON.stringify({ token }),
          });
          
          if (!response.ok) {
            console.error('Failed to unregister token from backend:', response.status);
          }
        } catch (error) {
          console.error('Error unregistering token from backend:', error);
        }
      }
    }
    
    // Remove token and settings from storage
    await AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATION_TOKEN);
    
    // Update settings to disabled but preserve preferences
    const settings = await getNotificationSettings();
    settings.enabled = false;
    await saveNotificationSettings(settings);
    
    console.log('Push notifications unregistered');
  } catch (error) {
    console.error('Error unregistering push notifications:', error);
  }
}

/**
 * Send a test notification (useful for debugging)
 */
export async function {
  sendTestNotification(): Promise<void> {
  try {
    const title = 'Test Notification';
    const body = 'This is a test notification from VibeWell';
    
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: DEFAULT_CHANNELS.system.id,
        smallIcon: 'ic_notification',
      },
    });
    
    console.log('Test notification sent');
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
}

export default {
  initPushNotifications,
  requestNotificationPermission,
  getPushNotificationToken,
  getNotificationSettings,
  saveNotificationSettings,
  unregisterPushNotifications,
  sendTestNotification,
  NotificationCategory,
  NOTIFICATION_TOPICS,
}; 