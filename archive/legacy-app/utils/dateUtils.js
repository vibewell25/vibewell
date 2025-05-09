export const formatDate = (date, options = {}, locale = 'en-US') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
    
  if (isNaN(dateObj.getTime())) return '';
  
  // If options is a string, use it as a format pattern
  if (typeof options === 'string') {
    const format = options;
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const seconds = dateObj.getSeconds();
    
    return format

    .replace(/YYYY/g, year.toString())

    .replace(/YY/g, year.toString().slice(-2))

    .replace(/MM/g, month.toString().padStart(2, '0'))

    .replace(/M/g, month.toString())

    .replace(/DD/g, day.toString().padStart(2, '0'))

    .replace(/D/g, day.toString())

    .replace(/HH/g, hours.toString().padStart(2, '0'))

    .replace(/H/g, hours.toString())

    .replace(/hh/g, (hours % 12 || 12).toString().padStart(2, '0'))

    .replace(/h/g, (hours % 12 || 12).toString())

    .replace(/mm/g, minutes.toString().padStart(2, '0'))

    .replace(/m/g, minutes.toString())

    .replace(/ss/g, seconds.toString().padStart(2, '0'))

    .replace(/s/g, seconds.toString())

    .replace(/a/g, hours < 12 ? 'am' : 'pm')

    .replace(/A/g, hours < 12 ? 'AM' : 'PM');
// Otherwise use Intl.DateTimeFormat
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
/**

    * Gets a human-readable relative time (e.g., "2 days ago", "in 3 hours")

    * @param {Date|string|number} date - Date to compare
 * @param {Date} [relativeTo=new Date()] - Date to compare against
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date, relativeTo = new Date()) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  const baseDate = relativeTo instanceof Date ? relativeTo : new Date(relativeTo);
  
  if (isNaN(dateObj.getTime()) || isNaN(baseDate.getTime())) return '';
  
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    const diffInMs = dateObj - baseDate;

    const diffInSecs = Math.round(diffInMs / 1000);
  
  const units = [
    { name: 'year', seconds: 31536000 },
    { name: 'month', seconds: 2592000 },
    { name: 'week', seconds: 604800 },
    { name: 'day', seconds: 86400 },
    { name: 'hour', seconds: 3600 },
    { name: 'minute', seconds: 60 },
    { name: 'second', seconds: 1 }
  ];
  
  for (const unit of units) {
    if (Math.abs(diffInSecs) >= unit.seconds || unit.name === 'second') {

    const value = Math.round(diffInSecs / unit.seconds);
      return rtf.format(value, unit.name);
return '';
/**
 * Adds time to a date

    * @param {Date|string|number} date - Starting date

    * @param {number} amount - Amount to add

    * @param {string} unit - Unit of time ('seconds'|'minutes'|'hours'|'days'|'months'|'years')
 * @returns {Date} New date
 */
export const addTime = (date, amount, unit) => {
  if (!date) return new Date();
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : new Date(date.getTime());
  
  switch(unit) {
    case 'seconds':
      dateObj.setSeconds(dateObj.getSeconds() + amount);
      break;
    case 'minutes':
      dateObj.setMinutes(dateObj.getMinutes() + amount);
      break;
    case 'hours':
      dateObj.setHours(dateObj.getHours() + amount);
      break;
    case 'days':
      dateObj.setDate(dateObj.getDate() + amount);
      break;
    case 'months':
      dateObj.setMonth(dateObj.getMonth() + amount);
      break;
    case 'years':
      dateObj.setFullYear(dateObj.getFullYear() + amount);
      break;
    default:
      throw new Error(`Invalid unit: ${unit}`);
return dateObj;
/**
 * Returns the difference between two dates in the specified unit

    * @param {Date|string|number} date1 - First date

    * @param {Date|string|number} date2 - Second date

    * @param {string} unit - Unit of time ('seconds'|'minutes'|'hours'|'days'|'months'|'years')
 * @returns {number} Difference between dates in the specified unit
 */
export const getDateDiff = (date1, date2, unit) => {
  if (!date1 || !date2) return 0;
  
  const d1 = typeof date1 === 'string' || typeof date1 === 'number' 
    ? new Date(date1) 
    : date1;
    
  const d2 = typeof date2 === 'string' || typeof date2 === 'number' 
    ? new Date(date2) 
    : date2;
  

    const diffMs = d2 - d1;
  
  switch(unit) {
    case 'seconds':

    return Math.floor(diffMs / 1000);
    case 'minutes':
      return Math.floor(diffMs / (1000 * 60));
    case 'hours':
      return Math.floor(diffMs / (1000 * 60 * 60));
    case 'days':
      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    case 'months': {
      const months = (d2.getFullYear() - d1.getFullYear()) * 12;
      return months + (d2.getMonth() - d1.getMonth());
case 'years':
      return d2.getFullYear() - d1.getFullYear();
    default:
      throw new Error(`Invalid unit: ${unit}`);
/**
 * Checks if a date is between two other dates

    * @param {Date|string|number} date - Date to check

    * @param {Date|string|number} start - Start date

    * @param {Date|string|number} end - End date

    * @param {boolean} inclusive - Whether to include the start and end dates
 * @returns {boolean} True if date is between start and end
 */
export const isDateBetween = (date, start, end, inclusive = true) => {
  if (!date || !start || !end) return false;
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
    
  const startObj = typeof start === 'string' || typeof start === 'number' 
    ? new Date(start) 
    : start;
    
  const endObj = typeof end === 'string' || typeof end === 'number' 
    ? new Date(end) 
    : end;
  
  if (inclusive) {
    return dateObj >= startObj && dateObj <= endObj;
return dateObj > startObj && dateObj < endObj;
/**

    * Formats a date as ISO string (YYYY-MM-DD)

    * @param {Date|string|number} date - Date to format

    * @returns {string} ISO date string (YYYY-MM-DD)
 */
export const toISODateString = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
    
  return dateObj.toISOString().split('T')[0];
/**
 * Gets the start of a time unit for a date

    * @param {Date|string|number} date - The date

    * @param {string} unit - Unit of time ('day'|'week'|'month'|'year')
 * @returns {Date} Date representing the start of the unit
 */
export const startOf = (date, unit) => {
  if (!date) return new Date();
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : new Date(date.getTime());
  
  switch(unit) {
    case 'day':
      dateObj.setHours(0, 0, 0, 0);
      break;
    case 'week':
      dateObj.setHours(0, 0, 0, 0);
      dateObj.setDate(dateObj.getDate() - dateObj.getDay());
      break;
    case 'month':
      dateObj.setHours(0, 0, 0, 0);
      dateObj.setDate(1);
      break;
    case 'year':
      dateObj.setHours(0, 0, 0, 0);
      dateObj.setMonth(0, 1);
      break;
    default:
      throw new Error(`Invalid unit: ${unit}`);
return dateObj;
/**
 * Checks if a date is today

    * @param {Date|string|number} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  const today = new Date();
  
  return dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear();
/**
 * Returns the current date
 * @returns {Date} Current date
 */
export const getCurrentDate = () => new Date();

/**
 * Adds a specified number of days to a date

    * @param {Date|string|number} date - Base date

    * @param {number} days - Number of days to add
 * @returns {Date} New date with days added
 */
export const addDays = (date, days) => {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
/**
 * Adds a specified number of months to a date

    * @param {Date|string|number} date - Base date

    * @param {number} months - Number of months to add
 * @returns {Date} New date with months added
 */
export const addMonths = (date, months) => {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
/**
 * Adds a specified number of years to a date

    * @param {Date|string|number} date - Base date

    * @param {number} years - Number of years to add
 * @returns {Date} New date with years added
 */
export const addYears = (date, years) => {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
/**
 * Gets the difference in days between two dates

    * @param {Date|string|number} date1 - First date

    * @param {Date|string|number} date2 - Second date
 * @returns {number} Difference in days
 */
export const getDaysDifference = (date1, date2) => {
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);
  
  // Reset times to midnight to get full day difference
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

    return Math.floor((utc2 - utc1) / MS_PER_DAY);
/**
 * Gets the start of the day (midnight) for a given date

    * @param {Date|string|number} date - Date to get start of day for
 * @returns {Date} Date object representing the start of the day
 */
export const getStartOfDay = (date) => {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
/**
 * Gets the end of the day (23:59:59.999) for a given date

    * @param {Date|string|number} date - Date to get end of day for
 * @returns {Date} Date object representing the end of the day
 */
export const getEndOfDay = (date) => {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
/**
 * Gets the start of the month for a given date

    * @param {Date|string|number} date - Date to get start of month for
 * @returns {Date} Date object representing the start of the month
 */
export const getStartOfMonth = (date) => {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
/**
 * Gets the end of the month for a given date

    * @param {Date|string|number} date - Date to get end of month for
 * @returns {Date} Date object representing the end of the month
 */
export const getEndOfMonth = (date) => {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
/**
 * Gets the day of the week for a given date

    * @param {Date|string|number} date - Date to get day of week for
 * @param {boolean} [asString=false] - Whether to return as string (default: false)
 * @returns {number|string} Day of week (0-6) or day name
 */
export const getDayOfWeek = (date, asString = false) => {
  const d = date instanceof Date ? date : new Date(date);
  
  if (asString) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[d.getDay()];
return d.getDay();
/**
 * Gets the week number of the year for a given date

    * @param {Date|string|number} date - Date to get week number for
 * @returns {number} Week number (1-53)
 */
export const getWeekNumber = (date) => {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  
  // Set to nearest Thursday (week starts on Monday according to ISO)
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  
  // Get first day of year
  const yearStart = new Date(d.getFullYear(), 0, 1);
  
  // Calculate week number

    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
/**
 * Checks if a year is a leap year

    * @param {number} year - Year to check
 * @returns {boolean} True if leap year
 */
export const isLeapYear = (year) => {

    return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
/**
 * Gets the number of days in a month

    * @param {number} month - Month (1-12)

    * @param {number} year - Year
 * @returns {number} Number of days in the month
 */
export const getDaysInMonth = (month, year) => {
  return new Date(year, month, 0).getDate();
/**
 * Creates a date from individual components

    * @param {number} year - Year

    * @param {number} month - Month (1-12)

    * @param {number} day - Day
 * @param {number} [hours=0] - Hours
 * @param {number} [minutes=0] - Minutes
 * @param {number} [seconds=0] - Seconds
 * @param {number} [milliseconds=0] - Milliseconds
 * @returns {Date} Constructed date
 */
export const createDate = (year, month, day, hours = 0, minutes = 0, seconds = 0, milliseconds = 0) => {
  // Month is 0-indexed in JavaScript Date

    return new Date(year, month - 1, day, hours, minutes, seconds, milliseconds);
/**
 * Checks if a date is valid

    * @param {Date|string|number} date - Date to check
 * @returns {boolean} True if valid date
 */
export const isValidDate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return !isNaN(d.getTime());
/**
 * Checks if two dates are the same day

    * @param {Date|string|number} date1 - First date

    * @param {Date|string|number} date2 - Second date
 * @returns {boolean} True if same day
 */
export const isSameDay = (date1, date2) => {
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);
  
  return d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();
/**
 * Parses a date string in various formats

    * @param {string} dateString - Date string to parse
 * @returns {Date|null} Parsed date or null if invalid
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  // Try standard Date parsing
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) return date;
  

    // Try DD/MM/YYYY format
  const parts = dateString.split(/[/.-]/);
  if (parts.length === 3) {
    // Try various formats
    const formats = [

    // MM/DD/YYYY
      [1, 0, 2],

    // DD/MM/YYYY
      [0, 1, 2],

    // YYYY/MM/DD
      [2, 1, 0]
    ];
    
    for (const [yearIndex, monthIndex, dayIndex] of formats) {

    const year = parseInt(parts[yearIndex]);

    const month = parseInt(parts[monthIndex]) - 1;

    const day = parseInt(parts[dayIndex]);
      
      const d = new Date(year, month, day);
      if (
        d.getFullYear() === year && 
        d.getMonth() === month && 
        d.getDate() === day
      ) {
        return d;
return null;
