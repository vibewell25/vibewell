/**
 * Number manipulation utilities
 */

/**
 * Formats a number as currency
 * @param {number} value - Number to format
 * @param {string} currencyCode - Currency code (default: 'USD')
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currencyCode = 'USD', locale = 'en-US') => {
  if (value === null || value === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
};

/**
 * Formats a number with specified decimal places
 * @param {number} value - Number to format
 * @param {number} decimalPlaces - Number of decimal places (default: 2)
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, decimalPlaces = 2, locale = 'en-US') => {
  if (value === null || value === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
};

/**
 * Formats a number as percentage
 * @param {number} value - Number to format (0.1 = 10%)
 * @param {number} decimalPlaces - Number of decimal places (default: 0)
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted percentage string
 */
export const formatPercent = (value, decimalPlaces = 0, locale = 'en-US') => {
  if (value === null || value === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
};

/**
 * Clamps a number between min and max values
 * @param {number} value - Number to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Rounds a number to specified decimal places
 * @param {number} value - Number to round
 * @param {number} decimalPlaces - Number of decimal places (default: 0)
 * @returns {number} Rounded number
 */
export const round = (value, decimalPlaces = 0) => {
  if (value === null || value === undefined) return 0;
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(value * factor) / factor;
};

/**
 * Checks if a value is a number
 * @param {any} value - Value to check
 * @returns {boolean} True if value is a number
 */
export const isNumber = (value) => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/**
 * Generates a random number between min and max
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @param {boolean} isInteger - Whether to return an integer (default: true)
 * @returns {number} Random number
 */
export const random = (min, max, isInteger = true) => {
  const randomValue = Math.random() * (max - min) + min;
  return isInteger ? Math.floor(randomValue) : randomValue;
};

/**
 * Formats a number with ordinal suffix (1st, 2nd, 3rd, etc.)
 * @param {number} value - Number to format
 * @returns {string} Number with ordinal suffix
 */
export const formatOrdinal = (value) => {
  if (!isNumber(value)) return '';
  
  const num = Math.abs(value);
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${value}th`;
  }
  
  switch (lastDigit) {
    case 1: return `${value}st`;
    case 2: return `${value}nd`;
    case 3: return `${value}rd`;
    default: return `${value}th`;
  }
};

/**
 * Formats a number with grouped thousands
 * @param {number} value - Number to format
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted number
 */
export const formatWithThousandSeparators = (value, locale = 'en-US') => {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat(locale).format(value);
};

/**
 * Converts a number to its word representation
 * @param {number} value - Number to convert
 * @returns {string} Word representation
 */
export const numberToWords = (value) => {
  if (!isNumber(value)) return '';
  
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
    'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const scales = ['', 'thousand', 'million', 'billion', 'trillion'];
  
  if (value === 0) return 'zero';
  
  const num = Math.abs(value);
  let words = '';
  
  // Handle numbers less than 1000
  function handleSmallNumber(num) {
    let result = '';
    
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' hundred ';
      num %= 100;
    }
    
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    
    if (num > 0) {
      result += ones[num] + ' ';
    }
    
    return result;
  }
  
  // Process number in chunks of 3 digits
  let scaleIndex = 0;
  while (num > 0) {
    const hundreds = num % 1000;
    if (hundreds !== 0) {
      words = handleSmallNumber(hundreds) + scales[scaleIndex] + ' ' + words;
    }
    scaleIndex++;
    num = Math.floor(num / 1000);
  }
  
  return (value < 0 ? 'negative ' : '') + words.trim();
};

/**
 * Calculates percentage change between two values
 * @param {number} oldValue - Old value
 * @param {number} newValue - New value
 * @returns {number} Percentage change
 */
export const percentChange = (oldValue, newValue) => {
  if (oldValue === 0) return newValue === 0 ? 0 : 1;
  return (newValue - oldValue) / Math.abs(oldValue);
}; 