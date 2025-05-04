
import { format } from 'date-fns';

/**
 * Formats a timestamp for message display
 * @param timestamp ISO timestamp string
 * @returns Formatted time (HH:mm for today, MMM d for other days)
 */
export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (isToday) {
    return format(date, 'HH:mm');
  } else {
    return format(date, 'MMM d');
  }
}

/**

 * Formats the last seen timestamp in a human-readable format
 * @param timestamp ISO timestamp string

 * @returns Human-readable format (e.g., "Just now", "5 minutes ago", etc.)
 */
export function formatLastSeen(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffMins < 1440) {

    const hours = Math.floor(diffMins / 60);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    return format(date, 'MMM d, yyyy');
  }
}
