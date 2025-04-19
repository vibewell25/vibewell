import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { BookingResponse } from '../types/beauty';

// Import the enum for trigger types
import { SchedulableTriggerInputTypes } from 'expo-notifications';

/**
 * Request notifications permissions from the user
 */
export const requestNotificationsPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log('Cannot request notification permissions on emulator');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Only ask for permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // Set how notifications are handled when the app is in the foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  return finalStatus === 'granted';
};

/**
 * Register for push notifications and return the token
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  try {
    // Request permissions
    const permissionGranted = await requestNotificationsPermissions();
    if (!permissionGranted) {
      console.log('Permission for notifications not granted');
      return null;
    }

    // Get the token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId ?? "",
    });
    
    // Return the token
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

/**
 * Schedule a local notification for a booking confirmation
 */
export const scheduleBookingConfirmationNotification = async (
  booking: BookingResponse
): Promise<string> => {
  await requestNotificationsPermissions();
  
  // Schedule the notification for 5 minutes before the appointment
  const appointmentDate = new Date(booking.appointmentDate);
  const notificationDate = new Date(appointmentDate.getTime() - 5 * 60 * 1000);
  
  // Make sure the notification date is in the future
  if (notificationDate.getTime() <= Date.now()) {
    // If appointment is within the next 5 minutes or in the past, don't schedule
    return '';
  }
  
  // Schedule the notification
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Upcoming Appointment Reminder',
      body: `Your ${booking.serviceTitle} appointment is in 5 minutes.`,
      data: { bookingId: booking.bookingId },
    },
    trigger: {
      date: notificationDate,
      type: SchedulableTriggerInputTypes.DATE
    },
  });
  
  return notificationId;
};

/**
 * Send a booking confirmation notification to the user
 * In a real app, this would call your backend API to send a push notification
 */
export const sendBookingConfirmation = async (
  booking: BookingResponse
): Promise<boolean> => {
  try {
    // In a real app, you would call your backend API to send push notifications
    // For this example, we'll just schedule a local notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Booking Confirmed!',
        body: `Your ${booking.serviceTitle} appointment has been confirmed.`,
        data: { bookingId: booking.bookingId },
      },
      trigger: null, // Send immediately
    });
    
    // Also schedule a reminder notification for the day before
    const appointmentDate = new Date(booking.appointmentDate);
    const dayBeforeDate = new Date(appointmentDate);
    dayBeforeDate.setDate(dayBeforeDate.getDate() - 1);
    dayBeforeDate.setHours(9, 0, 0); // 9 AM the day before
    
    // Only schedule if the day before is in the future
    if (dayBeforeDate.getTime() > Date.now()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Appointment Tomorrow',
          body: `Reminder: You have a ${booking.serviceTitle} appointment tomorrow at ${new Date(booking.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          data: { bookingId: booking.bookingId },
        },
        trigger: {
          date: dayBeforeDate,
          type: SchedulableTriggerInputTypes.DATE
        },
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return false;
  }
};

/**
 * Schedule a local notification
 */
export const scheduleNotification = async (
  title: string,
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

/**
 * Schedule a booking reminder notification
 */
export const scheduleBookingReminder = async (
  serviceTitle: string,
  appointmentDate: string,
  appointmentTime: string,
  bookingId: string
) => {
  // Parse the appointment date and time
  const [year, month, day] = appointmentDate.split('-').map(Number);
  const [hours, minutes] = appointmentTime.split(':').map(n => parseInt(n));
  
  // Create Date object for the appointment time
  const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
  
  // Set reminder for 1 day before
  const dayBeforeReminder = new Date(appointmentDateTime);
  dayBeforeReminder.setDate(dayBeforeReminder.getDate() - 1);
  dayBeforeReminder.setHours(9, 0, 0); // 9:00 AM
  
  // Set reminder for 1 hour before
  const hourBeforeReminder = new Date(appointmentDateTime);
  hourBeforeReminder.setHours(hourBeforeReminder.getHours() - 1);
  
  // Schedule notifications
  await scheduleNotification(
    'Upcoming Appointment Reminder',
    `You have an appointment for ${serviceTitle} tomorrow at ${appointmentTime}`,
    { bookingId },
    {
      date: dayBeforeReminder,
      type: SchedulableTriggerInputTypes.DATE
    }
  );
  
  await scheduleNotification(
    'Appointment Soon',
    `Your ${serviceTitle} appointment is in 1 hour`,
    { bookingId },
    {
      date: hourBeforeReminder,
      type: SchedulableTriggerInputTypes.DATE
    }
  );
  
  return { dayBeforeReminder, hourBeforeReminder };
};

/**
 * Listen for notification events
 */
export const addNotificationListener = (
  callback: (notification: Notifications.Notification) => void
) => {
  const subscription = Notifications.addNotificationReceivedListener(callback);
  return subscription;
};

/**
 * Listen for notification response events (when user taps on notification)
 */
export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
) => {
  const subscription = Notifications.addNotificationResponseReceivedListener(callback);
  return subscription;
};

/**
 * Remove notification listeners
 */
export const removeSubscription = (subscription: Notifications.Subscription) => {
  subscription.remove();
}; 