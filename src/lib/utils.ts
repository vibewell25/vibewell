import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { randomBytes } from 'crypto';

/**
 * Combines multiple class names or class name objects together
 * and merges Tailwind classes properly.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a cryptographically secure unique ID with an optional prefix
 * This function generates IDs suitable for security-sensitive contexts
 */
export function uniqueId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  // Use crypto.randomBytes instead of Math.random for better security
  const secureRandomStr = randomBytes(8).toString('hex');
  return `${prefix}${timestamp}${secureRandomStr}`;
}

/**
 * Format a number with commas for thousands separators
 */
export function formatNumber(number: number): string {
  return new Intl.NumberFormat('en-US').format(number);
}

/**
 * Format a date using the browser's Intl.DateTimeFormat
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Format a time string to a readable format
 */
export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format a date and time string to a readable format
 */
export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

/**
 * Truncate a string to a specified length and add an ellipsis
 */
export function truncateString(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + '...';
}

/**
 * Generate a slug from a text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

/**
 * Validate an email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate a phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format a rating as a string
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Get a random color in a cryptographically secure way
 */
export function getRandomColor(): string {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];

  // Use secure random number generation
  if (typeof window !== 'undefined' && window.crypto) {
    // Browser environment
    const randomIndex = new Uint32Array(1);
    window.crypto.getRandomValues(randomIndex);
    return colors[randomIndex[0] % colors.length];
  } else {
    // Node.js environment
    const randomBytes = require('crypto').randomBytes;
    const randomIndex = randomBytes(1)[0];
    return colors[randomIndex % colors.length];
  }
}

/**
 * Safely access a deep property in an object using a path string
 * Example: getNestedValue(user, 'profile.address.city')
 */
export function getNestedValue<T = any>(
  obj: Record<string, any> | null | undefined,
  path: string,
  defaultValue?: T
): T | undefined {
  // Early return if object is null or undefined
  if (obj === null || obj === undefined) {
    return defaultValue;
  }

  // Split the path by dots, brackets, or commas
  const travel = (regexp: RegExp) => {
    const result = String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => {
        // Check for null or undefined at each step
        if (res === null || res === undefined) {
          return res;
        }

        // Access the property safely
        return typeof res === 'object' && key in res ? res[key] : undefined;
      }, obj);

    return result;
  };

  // Try with different regex patterns for different path formats
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);

  // Return default value if result is undefined or equal to the original object
  return (result === undefined || result === obj ? defaultValue : result) as T | undefined;
}

/**
 * Generate a random string of specified length
 */
export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

/**
 * Truncate a hash or long identifier to show the first and last few characters
 * @param hash The hash or identifier to truncate
 * @param chars Number of characters to show at the beginning and end
 * @returns Truncated hash with ellipsis
 */
export function truncateHash(hash: string, chars: number = 4): string {
  if (!hash) return '';
  if (hash.length <= chars * 2) return hash;

  return `${hash.substring(0, chars)}...${hash.substring(hash.length - chars)}`;
}

// For backward compatibility
export const truncateAddress = truncateHash;
