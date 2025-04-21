import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverBaseUrl } from '../config';

// Constants
const STORAGE_KEYS = {
  PUSH_TOKEN: '@vibewell/push_token',
  NOTIFICATION_SETTINGS: '@vibewell/notification_settings',
};

// Types
export type NotificationSettings = {
  appointments: boolean;
  reminders: boolean;
  marketing: boolean;
  chat: boolean;
  events: boolean;
  systemUpdates: boolean;
};

export type NotificationCategory = keyof NotificationSettings;

export interface RegisterForPushNotificationsResult {
  success: boolean;
  token?: string;
  error?: string;
}

// Default notification settings
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  appointments: true,
  reminders: true,
  marketing: false,
  chat: true,
  events: true,
  systemUpdates: true,
};

/**
 * Configure notification handling for the app
 */
export async function configureNotifications() {
  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Configure categories and actions
  await Notifications.setNotificationCategoryAsync('APPOINTMENT', [
    {
      identifier: 'CONFIRM',
      buttonTitle: 'Confirm',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
      },
    },
    {
      identifier: 'RESCHEDULE',
      buttonTitle: 'Reschedule',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
      },
    },
    {
      identifier: 'CANCEL',
      buttonTitle: 'Cancel',
      options: {
        isDestructive: true,
        isAuthenticationRequired: false,
      },
    },
  ]);

  await Notifications.setNotificationCategoryAsync('MESSAGE', [
    {
      identifier: 'REPLY',
      buttonTitle: 'Reply',
      textInput: {
        submitButtonTitle: 'Send',
        placeholder: 'Type your reply...',
      },
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
      },
    },
    {
      identifier: 'MARK_READ',
      buttonTitle: 'Mark as Read',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
      },
    },
  ]);
}

/**
 * Check device permissions for notifications
 */
export async function checkNotificationPermissions(): Promise<boolean> {
  // Check if physical device (notifications don't work on simulators)
  if (!Device.isDevice) {
    console.warn('Push notifications are not supported in simulator');
    return false;
  }

  // Check existing permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') {
    return true;
  }

  // Request permissions if not already granted
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Register for push notifications
 */
export async function registerForPushNotifications(): Promise<RegisterForPushNotificationsResult> {
  try {
    // Check permissions
    const hasPermission = await checkNotificationPermissions();
    if (!hasPermission) {
      return {
        success: false,
        error: 'Permission for notifications not granted',
      };
    }

    // Get push token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PROJECT_ID,
    });

    // Save token locally
    await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token.data);

    // Configure for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Create specific channels for different notification types
      await Notifications.setNotificationChannelAsync('appointments', {
        name: 'Appointments',
        description: 'Notifications about upcoming appointments',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4287f5',
      });

      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Messages',
        description: 'Chat messages and communications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 100, 100, 100],
        lightColor: '#41db51',
      });

      await Notifications.setNotificationChannelAsync('events', {
        name: 'Events',
        description: 'Event reminders and updates',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 150, 150, 150],
        lightColor: '#f542e9',
      });

      await Notifications.setNotificationChannelAsync('marketing', {
        name: 'Marketing',
        description: 'Promotional notifications and offers',
        importance: Notifications.AndroidImportance.LOW,
      });
    }

    // Register with backend server
    await registerTokenWithServer(token.data);

    return {
      success: true,
      token: token.data,
    };
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Register push token with server
 */
async function registerTokenWithServer(token: string): Promise<boolean> {
  try {
    // Get user ID from storage or auth context
    const userId = await AsyncStorage.getItem('@vibewell/user_id');
    if (!userId) {
      console.warn('Cannot register push token: No user ID found');
      return false;
    }

    // Send to server
    const response = await fetch(`${serverBaseUrl}/api/users/${userId}/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await AsyncStorage.getItem('@vibewell/auth_token')}`,
      },
      body: JSON.stringify({
        token,
        platform: Platform.OS,
        deviceName: Device.deviceName,
        deviceModel: Device.modelName,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error registering token with server:', error);
    
    // Store failed registration to retry later
    await storeFailedTokenRegistration(token);
    return false;
  }
}

/**
 * Store failed token registration to retry later
 */
async function storeFailedTokenRegistration(token: string): Promise<void> {
  try {
    const pendingRegistrations = JSON.parse(
      await AsyncStorage.getItem('@vibewell/pending_token_registrations') || '[]'
    );
    
    pendingRegistrations.push({
      token,
      timestamp: new Date().toISOString(),
    });
    
    await AsyncStorage.setItem(
      '@vibewell/pending_token_registrations',
      JSON.stringify(pendingRegistrations)
    );
  } catch (error) {
    console.error('Error storing failed token registration:', error);
  }
}

/**
 * Retry failed token registrations
 */
export async function retryFailedTokenRegistrations(): Promise<void> {
  try {
    const pendingRegistrationsStr = await AsyncStorage.getItem('@vibewell/pending_token_registrations');
    if (!pendingRegistrationsStr) return;
    
    const pendingRegistrations = JSON.parse(pendingRegistrationsStr);
    if (!pendingRegistrations.length) return;
    
    const successful = [];
    
    for (const registration of pendingRegistrations) {
      const success = await registerTokenWithServer(registration.token);
      if (success) {
        successful.push(registration);
      }
    }
    
    // Remove successful registrations
    const remaining = pendingRegistrations.filter(
      reg => !successful.some(s => s.token === reg.token)
    );
    
    await AsyncStorage.setItem(
      '@vibewell/pending_token_registrations',
      JSON.stringify(remaining)
    );
  } catch (error) {
    console.error('Error retrying token registrations:', error);
  }
}

/**
 * Get current notification settings
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    return settings ? JSON.parse(settings) : DEFAULT_NOTIFICATION_SETTINGS;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  try {
    const currentSettings = await getNotificationSettings();
    const newSettings = { ...currentSettings, ...settings };
    
    await AsyncStorage.setItem(
      STORAGE_KEYS.NOTIFICATION_SETTINGS,
      JSON.stringify(newSettings)
    );
    
    // Update settings on server
    await updateSettingsOnServer(newSettings);
    
    return newSettings;
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
}

/**
 * Update notification settings on server
 */
async function updateSettingsOnServer(settings: NotificationSettings): Promise<boolean> {
  try {
    const userId = await AsyncStorage.getItem('@vibewell/user_id');
    if (!userId) return false;
    
    const response = await fetch(`${serverBaseUrl}/api/users/${userId}/notification-preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await AsyncStorage.getItem('@vibewell/auth_token')}`,
      },
      body: JSON.stringify(settings),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error updating settings on server:', error);
    return false;
  }
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
  options?: {
    schedulingOptions?: Notifications.NotificationRequestInput['trigger'];
    category?: string;
    badge?: number;
  }
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      badge: options?.badge,
      categoryIdentifier: options?.category,
    },
    trigger: options?.schedulingOptions || null,
  });
  
  return notificationId;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelScheduledNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Get all notification permissions
 */
export async function getNotificationPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
  return await Notifications.getPermissionsAsync();
}

/**
 * Add a notification response handler
 */
export function addNotificationResponseReceivedListener(
  handler: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

/**
 * Add a notification received listener
 */
export function addNotificationReceivedListener(
  handler: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(handler);
}

/**
 * Remove a notification listener
 */
export function removeNotificationListener(subscription: Notifications.Subscription): void {
  Notifications.removeNotificationSubscription(subscription);
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

export default {
  configureNotifications,
  registerForPushNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  scheduleLocalNotification,
  cancelScheduledNotification,
  cancelAllScheduledNotifications,
  getAllScheduledNotifications,
  getNotificationPermissions,
  addNotificationResponseReceivedListener,
  addNotificationReceivedListener,
  removeNotificationListener,
  setBadgeCount,
  retryFailedTokenRegistrations,
}; 