/**
 * String manipulation utilities
 */

/**
 * Capitalizes the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Converts a string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
export const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Truncates a string to a specified length and adds ellipsis if truncated
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add if truncated (default: '...')
 * @returns {string} Truncated string
 */
export const truncate = (str, maxLength, suffix = '...') => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Removes leading and trailing whitespace from a string
 * @param {string} str - String to trim
 * @returns {string} Trimmed string
 */
export const trim = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.trim();
};

/**
 * Checks if a string is empty or only contains whitespace
 * @param {string} str - String to check
 * @returns {boolean} True if string is empty or whitespace
 */
export const isEmpty = (str) => {
  if (!str || typeof str !== 'string') return true;
  return str.trim().length === 0;
};

/**
 * Sanitizes a string for safe display (removes HTML tags)
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export const sanitize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '');
};

/**
 * Formats a string by replacing placeholders with values
 * @param {string} template - Template string with {placeholder} syntax
 * @param {Object} values - Object with replacement values
 * @returns {string} Formatted string
 */
export const format = (template, values) => {
  if (!template || typeof template !== 'string') return '';
  if (!values || typeof values !== 'object') return template;
  
  return template.replace(/{([^{}]*)}/g, (match, key) => {
    const value = values[key];
    return value !== undefined ? value : match;
  });
};

/**
 * Converts a string to kebab-case
 * @param {string} str - String to convert
 * @returns {string} Kebab-case string
 */
export const toKebabCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

/**
 * Converts a string to camelCase
 * @param {string} str - String to convert
 * @returns {string} CamelCase string
 */
export const toCamelCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '');
};

/**
 * Converts a string to snake_case
 * @param {string} str - String to convert
 * @returns {string} Snake_case string
 */
export const toSnakeCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
};

/**
 * Converts a string to PascalCase
 * @param {string} str - String to convert
 * @returns {string} PascalCase string
 */
export const toPascalCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '');
};

/**
 * Generates a random string of specified length
 * @param {number} length - Length of the string to generate
 * @param {string} chars - Characters to use (default: alphanumeric)
 * @returns {string} Random string
 */
export const generateRandomString = (length = 10, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Compares two strings ignoring case
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {boolean} True if strings are equal ignoring case
 */
export const equalsIgnoreCase = (str1, str2) => {
  if (str1 === str2) return true;
  if (!str1 || !str2 || typeof str1 !== 'string' || typeof str2 !== 'string') return false;
  return str1.toLowerCase() === str2.toLowerCase();
};

/**
 * Reverses a string
 * @param {string} str - String to reverse
 * @returns {string} Reversed string
 */
export const reverse = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.split('').reverse().join('');
};

/**
 * Counts the occurrences of a substring in a string
 * @param {string} str - String to search
 * @param {string} substr - Substring to count
 * @returns {number} Number of occurrences
 */
export const countOccurrences = (str, substr) => {
  if (!str || !substr || typeof str !== 'string' || typeof substr !== 'string') return 0;
  return (str.match(new RegExp(substr, 'g')) || []).length;
};

/**
 * Extracts a substring between two delimiters
 * @param {string} str - String to extract from
 * @param {string} startDelimiter - Starting delimiter
 * @param {string} endDelimiter - Ending delimiter
 * @returns {string} Extracted substring
 */
export const extractBetween = (str, startDelimiter, endDelimiter) => {
  if (!str || typeof str !== 'string') return '';
  
  const startIndex = str.indexOf(startDelimiter);
  if (startIndex === -1) return '';
  
  const endIndex = str.indexOf(endDelimiter, startIndex + startDelimiter.length);
  if (endIndex === -1) return '';
  
  return str.substring(startIndex + startDelimiter.length, endIndex);
};

/**
 * Checks if a string starts with a specific substring
 * @param {string} str - String to check
 * @param {string} prefix - Prefix to check for
 * @param {boolean} ignoreCase - Whether to ignore case (default: false)
 * @returns {boolean} True if string starts with prefix
 */
export const startsWith = (str, prefix, ignoreCase = false) => {
  if (!str || !prefix || typeof str !== 'string' || typeof prefix !== 'string') return false;
  
  if (ignoreCase) {
    return str.toLowerCase().startsWith(prefix.toLowerCase());
  }
  
  return str.startsWith(prefix);
};

/**
 * Checks if a string ends with a specific substring
 * @param {string} str - String to check
 * @param {string} suffix - Suffix to check for
 * @param {boolean} ignoreCase - Whether to ignore case (default: false)
 * @returns {boolean} True if string ends with suffix
 */
export const endsWith = (str, suffix, ignoreCase = false) => {
  if (!str || !suffix || typeof str !== 'string' || typeof suffix !== 'string') return false;
  
  if (ignoreCase) {
    return str.toLowerCase().endsWith(suffix.toLowerCase());
  }
  
  return str.endsWith(suffix);
};

/**
 * Converts a string to a slug for URLs
 * @param {string} str - String to convert
 * @returns {string} URL-friendly slug
 */
export const slugify = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')  // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/--+/g, '-')      // Replace multiple hyphens with single hyphen
    .trim()                    // Remove leading/trailing spaces
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}; 