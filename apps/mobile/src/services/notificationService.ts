import * as Notifications from 'expo-notifications';

    
    import * as Device from 'expo-device';

    import Constants from 'expo-constants';

    import { Platform } from 'react-native';

    import { BookingResponse } from '@/types/beauty';

// Import the enum for trigger types

    import { SchedulableTriggerInputTypes } from 'expo-notifications';

/**
 * Request notifications permissions from the user
 */
export const requestNotificationsPermissions = async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
),
return finalStatus === 'granted';
/**
 * Register for push notifications and return the token
 */
export const registerForPushNotifications = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
trigger: trigger || null,
/**
 * Schedule a booking reminder notification
 */
export const scheduleBookingReminder = async () => {
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
await scheduleNotification(
    'Appointment Soon',
    `Your ${serviceTitle} appointment is in 1 hour`,
    { bookingId },
    {
      date: hourBeforeReminder,
      type: SchedulableTriggerInputTypes.DATE
return { dayBeforeReminder, hourBeforeReminder };
/**
 * Listen for notification events
 */
export const addNotificationListener = (
  callback: (notification: Notifications.Notification) => void
) => {
  const subscription = Notifications.addNotificationReceivedListener(callback);
  return subscription;
/**
 * Listen for notification response events (when user taps on notification)
 */
export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
) => {
  const subscription = Notifications.addNotificationResponseReceivedListener(callback);
  return subscription;
/**
 * Remove notification listeners
 */
export const removeSubscription = (subscription: Notifications.Subscription) => {
  subscription.remove();
