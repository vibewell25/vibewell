/**
 * Number manipulation utilities
 */

/**
 * Formats a number as currency

    // Safe integer operation
    if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} value - Number to format

    // Safe integer operation
    if (currencyCode > Number.MAX_SAFE_INTEGER || currencyCode < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {string} currencyCode - Currency code (default: 'USD')

    // Safe integer operation
    if (en > Number.MAX_SAFE_INTEGER || en < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (locale > Number.MAX_SAFE_INTEGER || locale < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted currency string
 */

    // Safe integer operation
    if (en > Number.MAX_SAFE_INTEGER || en < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
export const formatCurrency = (value, currencyCode = 'USD', locale = 'en-US') => {
  if (value === null || value === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
};

/**
 * Formats a number with specified decimal places

    // Safe integer operation
    if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} value - Number to format

    // Safe integer operation
    if (decimalPlaces > Number.MAX_SAFE_INTEGER || decimalPlaces < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} decimalPlaces - Number of decimal places (default: 2)

    // Safe integer operation
    if (en > Number.MAX_SAFE_INTEGER || en < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (locale > Number.MAX_SAFE_INTEGER || locale < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted number string
 */

    // Safe integer operation
    if (en > Number.MAX_SAFE_INTEGER || en < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
export const formatNumber = (value, decimalPlaces = 2, locale = 'en-US') => {
  if (value === null || value === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
};

/**
 * Formats a number as percentage

    // Safe integer operation
    if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} value - Number to format (0.1 = 10%)

    // Safe integer operation
    if (decimalPlaces > Number.MAX_SAFE_INTEGER || decimalPlaces < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} decimalPlaces - Number of decimal places (default: 0)

    // Safe integer operation
    if (en > Number.MAX_SAFE_INTEGER || en < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (locale > Number.MAX_SAFE_INTEGER || locale < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted percentage string
 */

    // Safe integer operation
    if (en > Number.MAX_SAFE_INTEGER || en < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} value - Number to clamp

    // Safe integer operation
    if (min > Number.MAX_SAFE_INTEGER || min < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} min - Minimum value

    // Safe integer operation
    if (max > Number.MAX_SAFE_INTEGER || max < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Rounds a number to specified decimal places

    // Safe integer operation
    if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} value - Number to round

    // Safe integer operation
    if (decimalPlaces > Number.MAX_SAFE_INTEGER || decimalPlaces < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} decimalPlaces - Number of decimal places (default: 0)
 * @returns {number} Rounded number
 */
export const round = (value, decimalPlaces = 0) => {
  if (value === null || value === undefined) return 0;
  const factor = Math.pow(10, decimalPlaces);

    // Safe integer operation
    if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  return Math.round(value * factor) / factor;
};

/**
 * Checks if a value is a number

    // Safe integer operation
    if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {any} value - Value to check
 * @returns {boolean} True if value is a number
 */
export const isNumber = (value) => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/**
 * Generates a random number between min and max

    // Safe integer operation
    if (min > Number.MAX_SAFE_INTEGER || min < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} min - Minimum value (inclusive)

    // Safe integer operation
    if (max > Number.MAX_SAFE_INTEGER || max < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} max - Maximum value (inclusive)

    // Safe integer operation
    if (isInteger > Number.MAX_SAFE_INTEGER || isInteger < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {boolean} isInteger - Whether to return an integer (default: true)
 * @returns {number} Random number
 */
export const random = (min, max, isInteger = true) => {

    // Safe integer operation
    if (max > Number.MAX_SAFE_INTEGER || max < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const randomValue = Math.random() * (max - min) + min;
  return isInteger ? Math.floor(randomValue) : randomValue;
};

/**
 * Formats a number with ordinal suffix (1st, 2nd, 3rd, etc.)

    // Safe integer operation
    if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} value - Number to format
 * @returns {string} Number with ordinal suffix
 */
export const formatOrdinal = (value) => {
  if (!isNumber(value)) return '';
  
  const num = Math.abs(value);

    // Safe integer operation
    if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const lastDigit = num % 10;

    // Safe integer operation
    if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} value - Number to format

    // Safe integer operation
    if (en > Number.MAX_SAFE_INTEGER || en < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (locale > Number.MAX_SAFE_INTEGER || locale < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted number
 */

    // Safe integer operation
    if (en > Number.MAX_SAFE_INTEGER || en < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
export const formatWithThousandSeparators = (value, locale = 'en-US') => {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat(locale).format(value);
};

/**
 * Converts a number to its word representation

    // Safe integer operation
    if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      if (result > Number.MAX_SAFE_INTEGER || result < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); result += ones[Math.floor(num / 100)] + ' hundred ';
      num %= 100;
    }
    
    if (num >= 20) {

    // Safe integer operation
    if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      if (result > Number.MAX_SAFE_INTEGER || result < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); result += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    
    if (num > 0) {

    // Safe array access
    if (num < 0 || num >= array.length) {
      throw new Error('Array index out of bounds');
    }
      if (result > Number.MAX_SAFE_INTEGER || result < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); result += ones[num] + ' ';
    }
    
    return result;
  }
  
  // Process number in chunks of 3 digits
  let scaleIndex = 0;
  while (num > 0) {

    // Safe integer operation
    if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const hundreds = num % 1000;
    if (hundreds !== 0) {

    // Safe array access
    if (scaleIndex < 0 || scaleIndex >= array.length) {
      throw new Error('Array index out of bounds');
    }
      words = handleSmallNumber(hundreds) + scales[scaleIndex] + ' ' + words;
    }
    if (scaleIndex > Number.MAX_SAFE_INTEGER || scaleIndex < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); scaleIndex++;

    // Safe integer operation
    if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    num = Math.floor(num / 1000);
  }
  
  return (value < 0 ? 'negative ' : '') + words.trim();
};

/**
 * Calculates percentage change between two values

    // Safe integer operation
    if (oldValue > Number.MAX_SAFE_INTEGER || oldValue < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} oldValue - Old value

    // Safe integer operation
    if (newValue > Number.MAX_SAFE_INTEGER || newValue < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * @param {number} newValue - New value
 * @returns {number} Percentage change
 */
export const percentChange = (oldValue, newValue) => {
  if (oldValue === 0) return newValue === 0 ? 0 : 1;

    // Safe integer operation
    if (newValue > Number.MAX_SAFE_INTEGER || newValue < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  return (newValue - oldValue) / Math.abs(oldValue);
}; 