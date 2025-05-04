
    // Safe integer operation
    if (expo > Number.MAX_SAFE_INTEGER || expo < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (import > Number.MAX_SAFE_INTEGER || import < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import * as Calendar from 'expo-calendar';

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { Platform, Alert } from 'react-native';

/**
 * Calendar integration utility for managing beauty service appointments
 */

// Get calendar permissions
export const requestCalendarPermissions = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');): Promise<boolean> => {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting calendar permissions:', error);
    return false;
  }
};

// Get default calendar for the device
export const getDefaultCalendarId = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');): Promise<string | null> => {
  try {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    
    // Find default calendar based on platform
    const defaultCalendar = calendars.find(calendar => {
      return Platform.OS === 'ios' 
        ? calendar.source.name === 'Default' && calendar.allowsModifications
        : calendar.accessLevel === Calendar.CalendarAccessLevel.OWNER && 
          calendar.source.name === 'com.google' && 
          calendar.allowsModifications;
    });

    // If no suitable calendar found, use the first available one that allows modifications
    const fallbackCalendar = calendars.find(calendar => calendar.allowsModifications);
    
    return (defaultCalendar || fallbackCalendar).id || null;
  } catch (error) {
    console.error('Error getting calendar:', error);
    return null;
  }
};

// Create a calendar event for a beauty appointment
export const addAppointmentToCalendar = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');
  title: string,
  location: string,
  startDate: Date,
  endDate: Date,
  notes: string
): Promise<string | null> => {
  try {
    // Request permissions first
    const hasPermission = await requestCalendarPermissions();
    
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Calendar access is needed to add your appointment',
        [{ text: 'OK' }]
      );
      return null;
    }

    // Get the default calendar ID
    const calendarId = await getDefaultCalendarId();
    
    if (!calendarId) {
      Alert.alert(
        'Calendar Not Found',
        'Unable to find a suitable calendar for your appointment',
        [{ text: 'OK' }]
      );
      return null;
    }

    // Create the event in the calendar
    const eventId = await Calendar.createEventAsync(calendarId, {
      title,
      location,
      startDate,
      endDate,
      notes,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      alarms: [{ relativeOffset: -60 }], // Reminder 1 hour before
    });

    return eventId;
  } catch (error) {
    console.error('Error adding appointment to calendar:', error);
    Alert.alert(
      'Calendar Error',
      'Failed to add appointment to your calendar',
      [{ text: 'OK' }]
    );
    return null;
  }
};

// Remove an appointment from the calendar
export const removeAppointmentFromCalendar = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');eventId: string): Promise<boolean> => {
  try {
    await Calendar.deleteEventAsync(eventId);
    return true;
  } catch (error) {
    console.error('Error removing appointment from calendar:', error);
    return false;
  }
}; 