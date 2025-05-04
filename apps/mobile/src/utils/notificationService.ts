
    
    import * as Notifications from 'expo-notifications';

    import { Platform, Alert } from 'react-native';

    import Constants from 'expo-constants';

    import { SchedulableTriggerInputTypes } from 'expo-notifications';

// Configure notifications to show alerts when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Requests permission for push notifications
 * @returns {Promise<boolean>} Whether permission was granted
 */
export async function {
  requestNotificationPermissions(): Promise<boolean> {
  try {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return false;
      }
      
      return true;
    }
    
    console.log('Must use physical device for Push Notifications');
    return false;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedules a booking reminder notification

     * @param {string} bookingId - Booking identifier

     * @param {string} serviceTitle - Name of the booked service

     * @param {Date} bookingDate - Date and time of the booking

     * @param {number} minutesBefore - Minutes before booking to send reminder (default: 60)
 * @returns {Promise<string|null>} Notification identifier if successful, null otherwise
 */
export async function {
  scheduleBookingReminder(
  bookingId: string,
  serviceTitle: string,
  bookingDate: Date,
  minutesBefore: number = 60
): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    
    if (!hasPermission) {
      return null;
    }
    
    // Calculate trigger time (x minutes before appointment)

        const triggerTime = new Date(bookingDate.getTime() - minutesBefore * 60 * 1000);
    
    // Don't schedule if the trigger time is in the past
    if (triggerTime.getTime() <= Date.now()) {
      console.log('Cannot schedule notification in the past');
      return null;
    }
    
    // Schedule the notification with proper trigger format
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Upcoming Appointment Reminder',
        body: `Your appointment for ${serviceTitle} is in ${minutesBefore} minutes`,
        data: { bookingId },
        sound: true,
      },
      trigger: {
        date: triggerTime,
        type: SchedulableTriggerInputTypes.DATE
      },
    });
    
    return identifier;
  } catch (error) {
    console.error('Error scheduling booking reminder:', error);
    return null;
  }
}

/**
 * Cancels a previously scheduled notification

     * @param {string} notificationId - Notification identifier to cancel
 * @returns {Promise<boolean>} Whether the cancellation was successful
 */
export async function {
  cancelNotification(notificationId: string): Promise<boolean> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    return true;
  } catch (error) {
    console.error('Error canceling notification:', error);
    return false;
  }
}

/**
 * Gets all pending notification requests
 * @returns {Promise<Notifications.NotificationRequest[]>} Array of pending notification requests
 */
export async function {
  getPendingNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting pending notifications:', error);
    return [];
  }
}

/**
 * Schedule a local notification
 */
export const scheduleNotification = async (title: string,
  body: string,
  data?: any,
  trigger?: Notifications.NotificationTriggerInput
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
    },
    trigger: trigger || null,
  });
}; 