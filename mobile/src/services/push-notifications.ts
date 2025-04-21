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
  try {
    // Set up Android channels first
    if (Platform.OS === 'android') {
      await setupAndroidChannels();
    }

    // Request permission
    const authStatus = await requestNotificationPermission();
    if (!authStatus) {
      console.log('Push notification permissions not granted');
      return false;
    }

    // Load settings
    await loadNotificationSettings();

    // Get FCM token
    const token = await messaging().getToken();
    if (token) {
      // Save the token to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_TOKEN, token);
      // Register with your backend
      await registerTokenWithBackend(token);
    }

    // Listen for token refresh
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_TOKEN, newToken);
      await registerTokenWithBackend(newToken);
    });

    // Set up foreground message handler
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      // Check if notifications are enabled and if we're in quiet hours
      if (await shouldDisplayNotification(remoteMessage)) {
        displayNotification(remoteMessage);
      } else {
        console.log('Notification suppressed due to settings or quiet hours');
      }
    });

    // Set up background/quit state handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      if (await shouldDisplayNotification(remoteMessage)) {
        displayNotification(remoteMessage);
      }
    });

    // Set up notification press handler for foreground events
    notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        handleNotificationAction(detail.notification, 'press');
      } else if (type === EventType.ACTION_PRESS) {
        handleNotificationAction(detail.notification, detail.pressAction?.id || 'action');
      }
    });

    // Set up notification press handler for background events
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (type === EventType.PRESS) {
        handleNotificationAction(detail.notification, 'press');
      } else if (type === EventType.ACTION_PRESS) {
        handleNotificationAction(detail.notification, detail.pressAction?.id || 'action');
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
export async function requestNotificationPermission(): Promise<boolean> {
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
async function setupAndroidChannels(): Promise<void> {
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
async function registerTokenWithBackend(token: string): Promise<void> {
  try {
    // Only proceed if we're online
    if (!(await isOnline())) {
      console.log('Device offline, will register token when online');
      return;
    }
    
    // User ID would typically come from your auth service
    const userId = await AsyncStorage.getItem('@vibewell/user_id');
    
    const response = await fetch(`${serverBaseUrl}/api/notifications/register-device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await AsyncStorage.getItem('@vibewell/auth_token')}`,
      },
      body: JSON.stringify({
        token,
        userId,
        platform: Platform.OS,
        appVersion: Platform.Version,
        deviceInfo: {
          model: Platform.OS === 'ios' ? 'iPhone' : 'Android',
          // Include more detailed device info if needed
        },
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to register token: ${response.status}`);
    }
    
    console.log('Token registered with backend:', token);
  } catch (error) {
    console.error('Error registering token with backend:', error);
    // Will retry next time the app starts or when connectivity is restored
  }
}

/**
 * Determine if a notification should be displayed based on settings and quiet hours
 */
async function shouldDisplayNotification(remoteMessage: any): Promise<boolean> {
  try {
    const settings = await getNotificationSettings();
    
    // Check if notifications are globally enabled
    if (!settings.enabled) {
      return false;
    }
    
    // Check category
    const category = remoteMessage.data?.category || NotificationCategory.SYSTEM;
    if (!settings.categories[category as NotificationCategory]) {
      return false;
    }
    
    // Check quiet hours
    if (settings.quietHours.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const startTime = settings.quietHours.start;
      const endTime = settings.quietHours.end;
      
      // Handle overnight quiet hours (e.g., 22:00 to 08:00)
      if (startTime > endTime) {
        if (currentTime >= startTime || currentTime <= endTime) {
          // It's quiet hours, check if this is a high-priority notification
          return remoteMessage.data?.priority === 'high';
        }
      } else {
        // Regular quiet hours (e.g., 13:00 to 15:00)
        if (currentTime >= startTime && currentTime <= endTime) {
          // It's quiet hours, check if this is a high-priority notification
          return remoteMessage.data?.priority === 'high';
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking notification settings:', error);
    // If there's an error, default to showing the notification
    return true;
  }
}

/**
 * Display a notification using Notifee
 */
async function displayNotification(remoteMessage: any): Promise<void> {
  try {
    // Extract notification data
    const { notification, data } = remoteMessage;
    const category = data?.category || NotificationCategory.SYSTEM;
    
    // Determine which Android channel to use
    let channelId = 'default';
    
    if (Platform.OS === 'android') {
      switch (category) {
        case NotificationCategory.APPOINTMENT:
          channelId = DEFAULT_CHANNELS.appointments.id;
          break;
        case NotificationCategory.PROMOTION:
          channelId = DEFAULT_CHANNELS.promotions.id;
          break;
        case NotificationCategory.MESSAGE:
          channelId = DEFAULT_CHANNELS.messages.id;
          break;
        default:
          channelId = DEFAULT_CHANNELS.system.id;
      }
    }
    
    // Create notification actions based on category
    const actions = createActionsForCategory(category, data);
    
    // Display the notification
    await notifee.displayNotification({
      id: data?.notificationId || undefined,
      title: notification?.title || 'New Notification',
      body: notification?.body || '',
      data: data || {},
      android: {
        channelId,
        smallIcon: 'ic_notification',
        largeIcon: data?.image || undefined,
        color: '#0066CC',
        pressAction: {
          id: 'default',
        },
        actions,
        // Add a category for Android notifications
        category: mapToAndroidCategory(category),
        // Handle importance override if needed
        importance: data?.priority === 'high' ? AndroidImportance.HIGH : undefined,
      },
      ios: {
        // iOS specific configuration
        categoryId: category,
        attachments: data?.image ? [{url: data.image}] : undefined,
        critical: data?.priority === 'high',
        sound: data?.sound || 'default',
        // Add thread ID for grouping related notifications
        threadId: data?.threadId || category,
      },
    });
  } catch (error) {
    console.error('Error displaying notification:', error);
  }
}

/**
 * Create notification actions based on category
 */
function createActionsForCategory(category: string, data: any) {
  switch (category) {
    case NotificationCategory.APPOINTMENT:
      return [
        {
          title: 'View',
          pressAction: { id: 'view' },
        },
        {
          title: 'Reschedule',
          pressAction: { id: 'reschedule' },
        },
      ];
    case NotificationCategory.MESSAGE:
      return [
        {
          title: 'Reply',
          pressAction: { id: 'reply' },
        },
        {
          title: 'Mark as Read',
          pressAction: { id: 'mark_read' },
        },
      ];
    default:
      return [];
  }
}

/**
 * Map our category to Android system categories
 */
function mapToAndroidCategory(category: string): AndroidCategory | undefined {
  switch (category) {
    case NotificationCategory.MESSAGE:
      return AndroidCategory.MESSAGE;
    case NotificationCategory.APPOINTMENT:
      return AndroidCategory.REMINDER;
    case NotificationCategory.ALERT:
      return AndroidCategory.ALARM;
    default:
      return undefined;
  }
}

/**
 * Handle notification press and action button presses
 */
function handleNotificationAction(notification: Notification | null, actionId: string): void {
  if (!notification) return;
  
  try {
    // Extract data from notification
    const { data } = notification;
    const category = data?.category || NotificationCategory.SYSTEM;
    
    console.log(`Notification ${actionId} action:`, { category, data });
    
    // Handle based on category and action
    switch (category) {
      case NotificationCategory.APPOINTMENT:
        handleAppointmentAction(data, actionId);
        break;
      case NotificationCategory.MESSAGE:
        handleMessageAction(data, actionId);
        break;
      case NotificationCategory.PROMOTION:
        handlePromotionAction(data, actionId);
        break;
      default:
        // Handle generic action
        // TODO: Navigate to appropriate screen based on data and actionId
        console.log('Generic notification action:', { data, actionId });
    }
  } catch (error) {
    console.error('Error handling notification action:', error);
  }
}

/**
 * Handle appointment-specific actions
 */
function handleAppointmentAction(data: any, actionId: string): void {
  // TODO: Implement navigation to appointment screens
  // Example:
  // if (actionId === 'view') {
  //   navigate to appointment details screen
  // } else if (actionId === 'reschedule') {
  //   navigate to reschedule screen
  // }
  console.log('Appointment action:', { data, actionId });
}

/**
 * Handle message-specific actions
 */
function handleMessageAction(data: any, actionId: string): void {
  // TODO: Implement navigation to message screens
  console.log('Message action:', { data, actionId });
}

/**
 * Handle promotion-specific actions
 */
function handlePromotionAction(data: any, actionId: string): void {
  // TODO: Implement navigation to promotion screens
  console.log('Promotion action:', { data, actionId });
}

/**
 * Get the current notification settings
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const settingsString = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    if (!settingsString) {
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
    
    return JSON.parse(settingsString);
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

/**
 * Save notification settings
 */
export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
    
    // Update topic subscriptions if they changed
    await syncTopicSubscriptions();
    
    console.log('Notification settings saved');
  } catch (error) {
    console.error('Error saving notification settings:', error);
    throw error;
  }
}

/**
 * Load and initialize notification settings
 */
async function loadNotificationSettings(): Promise<NotificationSettings> {
  try {
    const settingsString = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    
    // If no settings found, save defaults
    if (!settingsString) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_SETTINGS, 
        JSON.stringify(DEFAULT_NOTIFICATION_SETTINGS)
      );
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
    
    return JSON.parse(settingsString);
  } catch (error) {
    console.error('Error loading notification settings:', error);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

/**
 * Subscribe to topics based on user settings
 */
async function syncTopicSubscriptions(): Promise<void> {
  try {
    const settings = await getNotificationSettings();
    const currentTopics = settings.topics;
    
    // Get all available topics
    const allTopics = Object.values(NOTIFICATION_TOPICS);
    
    // Subscribe to selected topics
    for (const topic of allTopics) {
      if (currentTopics.includes(topic)) {
        await messaging().subscribeToTopic(topic).catch(error => {
          console.error(`Failed to subscribe to topic ${topic}:`, error);
        });
      } else {
        await messaging().unsubscribeFromTopic(topic).catch(error => {
          console.error(`Failed to unsubscribe from topic ${topic}:`, error);
        });
      }
    }
    
    console.log('Topic subscriptions synced');
  } catch (error) {
    console.error('Error syncing topic subscriptions:', error);
  }
}

/**
 * Get the current FCM token
 */
export async function getPushNotificationToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_TOKEN);
  } catch (error) {
    console.error('Error getting push notification token:', error);
    return null;
  }
}

/**
 * Unregister from push notifications
 */
export async function unregisterPushNotifications(): Promise<void> {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_TOKEN);
    
    if (token) {
      // Unsubscribe from all topics
      for (const topic of Object.values(NOTIFICATION_TOPICS)) {
        await messaging().unsubscribeFromTopic(topic).catch(error => {
          console.error(`Failed to unsubscribe from topic ${topic}:`, error);
        });
      }
      
      // Unregister from backend
      if (await isOnline()) {
        try {
          const response = await fetch(`${serverBaseUrl}/api/notifications/unregister-device`, {
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
export async function sendTestNotification(): Promise<void> {
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