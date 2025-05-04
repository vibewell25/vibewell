
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
    if (expo > Number.MAX_SAFE_INTEGER || expo < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import Constants from 'expo-constants';

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { Platform } from 'react-native';

export interface NotificationContent {
  title: string;
  body: string;
  data?: object;
}

export class NotificationManager {
  static async registerForPushNotifications() {
    if (!Device.isDevice) {
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
      });

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token.data;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return false;
    }
  }

  static async scheduleLocalNotification(
    content: NotificationContent,
    trigger?: Notifications.NotificationTriggerInput
  ) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          data: content.data || {},
          sound: true,
        },
        trigger: trigger || null,
      });
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  static async cancelNotification(notificationId: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return true;
    } catch (error) {
      console.error('Error canceling notification:', error);
      return false;
    }
  }

  static addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  static addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
} 