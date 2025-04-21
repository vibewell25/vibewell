/**
 * Date formatting utility functions
 */
import { format, formatDistance, formatRelative, isToday, isYesterday } from 'date-fns';

/**
 * Formats a date with the specified format
 * @param date Date to format
 * @param formatStr Format string (default: 'PPP')
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string | number, formatStr = 'PPP'): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return format(dateObj, formatStr);
};

/**
 * Returns a relative time string (e.g., "5 minutes ago")
 * @param date Date to format
 * @param baseDate Base date to calculate relative time from (default: now)
 * @returns Relative time string
 */
export const getRelativeTime = (
  date: Date | string | number,
  baseDate: Date | string | number = new Date()
): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const baseDateObj =
    typeof baseDate === 'string' || typeof baseDate === 'number' ? new Date(baseDate) : baseDate;

  return formatDistance(dateObj, baseDateObj, { addSuffix: true });
};

/**
 * Returns a smart date string, using "Today", "Yesterday", or the full date
 * @param date Date to format
 * @returns Formatted smart date string
 */
export const getSmartDate = (date: Date | string | number): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (isToday(dateObj)) {
    return `Today, ${format(dateObj, 'h:mm a')}`;
  } else if (isYesterday(dateObj)) {
    return `Yesterday, ${format(dateObj, 'h:mm a')}`;
  } else {
    return format(dateObj, 'PPP');
  }
};
