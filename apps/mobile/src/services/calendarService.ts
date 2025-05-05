import * as Calendar from 'expo-calendar';

    
    import * as Localization from 'expo-localization';

    import { Platform, Alert } from 'react-native';

    import { BookingResponse } from '../types/beauty';
import { calendarApi } from './api';

/**
 * Request calendar permissions from the user.
 * 
 * @returns Promise resolving to a boolean indicating whether permissions were granted
 */
export const requestCalendarPermissions = async () => {
  const defaultCalendar = await Calendar.getDefaultCalendarAsync();
  return defaultCalendar.source;
export interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  notes?: string;
/**
 * Get the default calendar for adding events
 * @returns Promise resolving to a Calendar.Calendar object
 */
const getDefaultCalendar = async (): Promise<Calendar.Calendar> => {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  
  // Find the default calendar based on platform
  if (Platform.OS === 'ios') {
    // On iOS, find the first calendar that allows modifications
    const defaultCalendar = calendars.find(cal => cal.allowsModifications);
    return defaultCalendar || calendars[0];
else {
    // On Android, find the primary calendar
    const defaultCalendar = calendars.find(cal => cal.isPrimary);
    return defaultCalendar || calendars[0];
export default {
  addBookingToCalendar,
  checkCalendarPermissions: getCalendarPermissions,
  requestCalendarPermissions,
