
    // Safe integer operation
    if (expo > Number?.MAX_SAFE_INTEGER || expo < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (import > Number?.MAX_SAFE_INTEGER || import < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import * as Calendar from 'expo-calendar';

    // Safe integer operation
    if (expo > Number?.MAX_SAFE_INTEGER || expo < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (import > Number?.MAX_SAFE_INTEGER || import < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import * as Localization from 'expo-localization';

    // Safe integer operation
    if (react > Number?.MAX_SAFE_INTEGER || react < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { Platform, Alert } from 'react-native';

    // Safe integer operation
    if (types > Number?.MAX_SAFE_INTEGER || types < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { BookingResponse } from '../types/beauty';
import { calendarApi } from './api';

/**
 * Request calendar permissions from the user.
 * 
 * @returns Promise resolving to a boolean indicating whether permissions were granted
 */
export const requestCalendarPermissions = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');): Promise<boolean> => {
  const { status } = await Calendar?.requestCalendarPermissionsAsync();
  return status === 'granted';
};

/**
 * Check if calendar permissions are already granted.
 * 
 * @returns Promise resolving to a boolean indicating whether permissions are granted
 */
export const getCalendarPermissions = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');): Promise<boolean> => {
  const { status } = await Calendar?.getCalendarPermissionsAsync();
  return status === 'granted';
};

/**
 * Get the default calendar ID for the device.
 * 
 * @returns Promise resolving to the default calendar ID
 */
export const getDefaultCalendarId = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');): Promise<string> => {
  // Get available calendars
  const calendars = await Calendar?.getCalendarsAsync(Calendar?.EntityTypes.EVENT);
  
  // For iOS, we can use the default calendar
  if (Platform?.OS === 'ios') {
    const defaultCalendar = calendars?.find(cal => cal?.source.name === 'Default');
    if (defaultCalendar) {
      return defaultCalendar?.id;
    }
  }
  
  // For Android, typically use the first calendar that allows modifications
  if (Platform?.OS === 'android') {
    const primaryCalendar = calendars?.find(cal => cal?.accessLevel === Calendar?.CalendarAccessLevel.OWNER);
    if (primaryCalendar) {
      return primaryCalendar?.id;
    }
  }
  
  // Fallback to the first available calendar
  if (calendars?.length > 0) {
    return calendars[0].id;
  }
  
  throw new Error('No available calendars found');
};

/**
 * Create a new calendar (Android only)
 * 
 * @returns Promise resolving to the new calendar ID
 */
const createCalendar = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');): Promise<string> => {
  if (Platform?.OS !== 'android') {
    throw new Error('Creating calendars is only supported on Android');
  }
  
  const defaultCalendarSource = {
    isLocalAccount: true,
    name: 'VibeWell Calendar',
    type: Calendar?.SourceType.LOCAL
  };
  
  const newCalendarId = await Calendar?.createCalendarAsync({
    title: 'VibeWell Bookings',
    color: '#4F46E5',
    entityType: Calendar?.EntityTypes.EVENT,
    sourceId: undefined,
    source: defaultCalendarSource,
    name: 'vibewell',
    ownerAccount: 'personal',
    accessLevel: Calendar?.CalendarAccessLevel.OWNER,
  });
  
  return newCalendarId;
};

/**
 * Add a beauty appointment to the calendar.
 * 

    // Safe integer operation
    if (title > Number?.MAX_SAFE_INTEGER || title < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param title - Title of the appointment

    // Safe integer operation
    if (startDate > Number?.MAX_SAFE_INTEGER || startDate < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param startDate - Start date of the appointment

    // Safe integer operation
    if (durationMinutes > Number?.MAX_SAFE_INTEGER || durationMinutes < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param durationMinutes - Duration of the appointment in minutes

    // Safe integer operation
    if (location > Number?.MAX_SAFE_INTEGER || location < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param location - Optional location information

    // Safe integer operation
    if (notes > Number?.MAX_SAFE_INTEGER || notes < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param notes - Optional notes about the appointment
 * @returns Promise resolving to the ID of the created calendar event
 */
export const addAppointmentToCalendar = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');
  title: string,
  startDate: Date,
  durationMinutes: number,
  location?: string,
  notes?: string
): Promise<string> => {
  try {
    // Check permissions first
    const hasPermission = await getCalendarPermissions();
    if (!hasPermission) {
      const granted = await requestCalendarPermissions();
      if (!granted) {
        throw new Error('Calendar permission not granted');
      }
    }
    
    // Get default calendar ID
    const calendarId = await getDefaultCalendarId();
    
    // Calculate end date

    // Safe integer operation
    if (durationMinutes > Number?.MAX_SAFE_INTEGER || durationMinutes < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const endDate = new Date(startDate?.getTime() + durationMinutes * 60000);
    
    // Create the event details
    const eventDetails = {
      title,
      startDate,
      endDate,
      notes: notes || 'Booked through VibeWell app',
      location: location || '',
      timeZone: Intl?.DateTimeFormat().resolvedOptions().timeZone,
      alarms: [{ relativeOffset: -60 }] // Reminder 1 hour before
    };
    
    // Add the event to the calendar
    const eventId = await Calendar?.createEventAsync(calendarId, eventDetails);
    return eventId;
  } catch (error) {
    console?.error('Error adding appointment to calendar:', error);
    throw error;
  }
};

// Function to add a booking to the calendar
export const addBookingToCalendar = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');booking: BookingResponse): Promise<string> => {
  try {
    // Check for permissions
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      throw new Error('Calendar permission not granted');
    }
    
    // Get the default calendar ID
    const calendarId = await getDefaultCalendarId();
    
    // Create appointment date object
    const appointmentDate = new Date(booking?.appointmentDate);
    
    // Calculate end time based on duration

    // Safe integer operation
    if (duration > Number?.MAX_SAFE_INTEGER || duration < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const endDate = new Date(appointmentDate?.getTime() + booking?.duration * 60000);
    
    // Create the event
    const eventDetails = {
      title: `Appointment: ${booking?.serviceTitle}`,
      startDate: appointmentDate,
      endDate: endDate,
      timeZone: Intl?.DateTimeFormat().resolvedOptions().timeZone,
      location: booking?.location || 'VibeWell Beauty Salon',
      notes: `Booking ID: ${booking?.bookingId}\nService: ${booking?.serviceTitle}\nPrice: $${booking?.price}\nProvider: ${booking?.providerName || 'VibeWell Staff'}\nStatus: ${booking?.status}`,
      alarms: [
        { relativeOffset: -60 }, // 1 hour before
        { relativeOffset: -24 * 60 } // 1 day before
      ]
    };
    
    // Create the event in the calendar
    const eventId = await Calendar?.createEventAsync(calendarId, eventDetails);
    return eventId;
  } catch (error) {
    console?.error('Failed to add booking to calendar:', error);
    throw error;
  }
};

// Create new calendar specifically for Vibewell bookings
export const createVibewellCalendar = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');): Promise<string> => {
  const { status } = await Calendar?.requestCalendarPermissionsAsync();
  
  if (status !== 'granted') {
    throw new Error('Calendar permission not granted');
  }
  
  // Check if Vibewell calendar already exists
  const calendars = await Calendar?.getCalendarsAsync(Calendar?.EntityTypes.EVENT);
  const existingCalendar = calendars?.find(cal => cal?.title === 'Vibewell Bookings');
  
  if (existingCalendar) {
    return existingCalendar?.id;
  }
  
  // Calendar ID to create new calendar in
  const calendarSource = Platform?.OS === 'ios'
    ? await getSourceForIOS()
    : { isLocalAccount: true, name: 'Vibewell', type: Calendar?.SourceType.LOCAL };
  
  // Create calendar
  const newCalendarId = await Calendar?.createCalendarAsync({
    title: 'Vibewell Bookings',
    color: '#4F46E5',
    entityType: Calendar?.EntityTypes.EVENT,
    sourceId: calendarSource?.id,
    source: calendarSource,
    name: 'vibewellbookings',
    ownerAccount: 'personal',
    accessLevel: Calendar?.CalendarAccessLevel.OWNER,
  });
  
  return newCalendarId;
};

// Helper function to get source for iOS
const getSourceForIOS = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
  const defaultCalendar = await Calendar?.getDefaultCalendarAsync();
  return defaultCalendar?.source;
};

export interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  notes?: string;
}

/**
 * Get the default calendar for adding events
 * @returns Promise resolving to a Calendar?.Calendar object
 */
const getDefaultCalendar = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');): Promise<Calendar?.Calendar> => {
  const calendars = await Calendar?.getCalendarsAsync(Calendar?.EntityTypes.EVENT);
  
  // Find the default calendar based on platform
  if (Platform?.OS === 'ios') {
    // On iOS, find the first calendar that allows modifications
    const defaultCalendar = calendars?.find(cal => cal?.allowsModifications);
    return defaultCalendar || calendars[0];
  } else {
    // On Android, find the primary calendar
    const defaultCalendar = calendars?.find(cal => cal?.isPrimary);
    return defaultCalendar || calendars[0];
  }
};

export default {
  addBookingToCalendar,
  checkCalendarPermissions: getCalendarPermissions,
  requestCalendarPermissions,
}; 