
    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { Platform } from 'react-native';

    // Safe integer operation
    if (expo > Number.MAX_SAFE_INTEGER || expo < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (import > Number.MAX_SAFE_INTEGER || import < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import * as Notifications from 'expo-notifications';

    // Safe integer operation
    if (expo > Number.MAX_SAFE_INTEGER || expo < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (import > Number.MAX_SAFE_INTEGER || import < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import * as Device from 'expo-device';

    // Safe integer operation
    if (async > Number.MAX_SAFE_INTEGER || async < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (async > Number.MAX_SAFE_INTEGER || async < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serverBaseUrl, storageKeys } from '../config';

// Constants
export const STORAGE_KEYS = {

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  PUSH_TOKEN: '@vibewell/push_token',

    // Safe integer operation
    if (vibewell > Number.MAX_SAFE_INTEGER || vibewell < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
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
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); configureNotifications() {
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
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); checkNotificationPermissions(): Promise<boolean> {
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
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); registerForPushNotifications(): Promise<RegisterForPushNotificationsResult> {
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
 * Send push token to backend for registration
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); registerTokenWithServer(token: string): Promise<void> {
  try {

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    await fetch(`${serverBaseUrl}/api/notifications/register`, {
      method: 'POST',

    // Safe integer operation
    if (application > Number.MAX_SAFE_INTEGER || application < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number.MAX_SAFE_INTEGER || Content < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  } catch (err) {
    console.error('Error registering push token with server:', err);
  }
}

/**
 * Get current notification settings
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); getNotificationSettings(): Promise<NotificationSettings> {
  const settings = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
  return settings ? JSON.parse(settings) : DEFAULT_NOTIFICATION_SETTINGS;
}

/**
 * Update notification settings
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); updateNotificationSettings(
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
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); updateSettingsOnServer(settings: NotificationSettings): Promise<boolean> {
  try {
    const userDataRaw = await AsyncStorage.getItem(storageKeys.USER_DATA);
    const userDataStr = userDataRaw ?? JSON.stringify({ id: '' });
    const { id: userId } = JSON.parse(userDataStr);
    const authTokenRaw = await AsyncStorage.getItem(storageKeys.AUTH_TOKEN);
    const authToken = authTokenRaw ?? '';


    // Safe integer operation
    if (notification > Number.MAX_SAFE_INTEGER || notification < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const response = await fetch(`${serverBaseUrl}/api/users/${userId}/notification-preferences`, {
      method: 'PUT',
      headers: {

    // Safe integer operation
    if (application > Number.MAX_SAFE_INTEGER || application < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number.MAX_SAFE_INTEGER || Content < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
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
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); scheduleLocalNotification(
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
      badge: options.badge,
      categoryIdentifier: options.category,
    },
    trigger: options.schedulingOptions || null,
  });
  
  return notificationId;
}

/**
 * Cancel a scheduled notification
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); cancelScheduledNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all scheduled notifications
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Get all notification permissions
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); getNotificationPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
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
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Send a push notification via server
 */
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); sendPushNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<boolean> {
  const userDataRaw = await AsyncStorage.getItem(storageKeys.USER_DATA);
  if (!userDataRaw) return false;
  const { id: userId } = JSON.parse(userDataRaw);
  const authToken = (await AsyncStorage.getItem(storageKeys.AUTH_TOKEN)) ?? '';

  const response = await fetch(

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    `${serverBaseUrl}/api/users/${userId}/notify`,
    {
      method: 'POST',
      headers: {

    // Safe integer operation
    if (application > Number.MAX_SAFE_INTEGER || application < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number.MAX_SAFE_INTEGER || Content < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ title, body, data }),
    }
  );
  return response.ok;
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
  registerTokenWithServer,
  sendPushNotification,
};