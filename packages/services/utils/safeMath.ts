/**
 * Safe Math utilities to prevent integer overflow and related issues
 * 
 * This module provides helper functions to perform common arithmetic operations
 * with built-in safety checks to prevent integer overflow, underflow, and other
 * numeric issues.
 */

/**
 * Maximum safe integer in JavaScript
 */
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER; // 2^53 - 1

/**
 * Minimum safe integer in JavaScript
 */
const MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER; // -(2^53 - 1)

/**
 * Safely add two numbers, preventing integer overflow
 *
 * @param a - First number
 * @param b - Second number
 * @returns The sum of a and b if it's safe, otherwise throws an error
 */
export function add(a: number, b: number): number {
  // Convert inputs to numbers if they aren't already
  const numA = Number(a);
  const numB = Number(b);

  // Check if either is NaN
  if (isNaN(numA) || isNaN(numB)) {
    throw new Error('SafeMath: Cannot add NaN values');
  }

  // Perform the operation
  const result = numA + numB;

  // Check for overflow/underflow
  if (
    (numA > 0 && numB > 0 && result <= 0) || // Positive overflow
    (numA < 0 && numB < 0 && result >= 0) || // Negative overflow
    result > MAX_SAFE_INTEGER ||
    result < MIN_SAFE_INTEGER
  ) {
    throw new Error(`SafeMath: Addition overflow: ${numA} + ${numB}`);
  }

  return result;
}

/**
 * Safely subtract one number from another, preventing integer underflow
 *
 * @param a - First number (minuend)
 * @param b - Second number (subtrahend)
 * @returns The difference (a - b) if it's safe, otherwise throws an error
 */
export function subtract(a: number, b: number): number {
  // Convert inputs to numbers if they aren't already
  const numA = Number(a);
  const numB = Number(b);

  // Check if either is NaN
  if (isNaN(numA) || isNaN(numB)) {
    throw new Error('SafeMath: Cannot subtract NaN values');
  }

  // Perform the operation
  const result = numA - numB;

  // Check for overflow/underflow
  if (
    (numA >= 0 && numB < 0 && result <= 0) || // Positive overflow
    (numA < 0 && numB > 0 && result >= 0) || // Negative overflow
    result > MAX_SAFE_INTEGER ||
    result < MIN_SAFE_INTEGER
  ) {
    throw new Error(`SafeMath: Subtraction overflow: ${numA} - ${numB}`);
  }

  return result;
}

/**
 * Safely multiply two numbers, preventing integer overflow
 *
 * @param a - First number (multiplicand)
 * @param b - Second number (multiplier)
 * @returns The product (a * b) if it's safe, otherwise throws an error
 */
export function multiply(a: number, b: number): number {
  // Convert inputs to numbers if they aren't already
  const numA = Number(a);
  const numB = Number(b);

  // Check if either is NaN
  if (isNaN(numA) || isNaN(numB)) {
    throw new Error('SafeMath: Cannot multiply NaN values');
  }

  // Early return for multiplication by 0 or 1
  if (numA === 0 || numB === 0) return 0;
  if (numA === 1) return numB;
  if (numB === 1) return numA;

  // Check for potential overflow before performing the operation
  if (
    Math.abs(numA) > MAX_SAFE_INTEGER / Math.abs(numB)
  ) {
    throw new Error(`SafeMath: Multiplication overflow: ${numA} * ${numB}`);
  }

  // Perform the operation
  const result = numA * numB;

  // Double-check result is within safe range
  if (
    result > MAX_SAFE_INTEGER ||
    result < MIN_SAFE_INTEGER
  ) {
    throw new Error(`SafeMath: Multiplication overflow: ${numA} * ${numB}`);
  }

  return result;
}

/**
 * Safely divide two numbers, preventing division by zero
 *
 * @param a - Numerator
 * @param b - Denominator
 * @returns The quotient (a / b) if it's safe, otherwise throws an error
 */
export function divide(a: number, b: number): number {
  // Convert inputs to numbers if they aren't already
  const numA = Number(a);
  const numB = Number(b);

  // Check if either is NaN
  if (isNaN(numA) || isNaN(numB)) {
    throw new Error('SafeMath: Cannot divide NaN values');
  }

  // Check for division by zero
  if (numB === 0) {
    throw new Error('SafeMath: Division by zero');
  }

  // Perform the operation
  return numA / numB;
}

/**
 * Safely perform modulo operation
 *
 * @param a - Dividend
 * @param b - Divisor
 * @returns The remainder (a % b) if it's safe, otherwise throws an error
 */
export function modulo(a: number, b: number): number {
  // Convert inputs to numbers if they aren't already
  const numA = Number(a);
  const numB = Number(b);

  // Check if either is NaN
  if (isNaN(numA) || isNaN(numB)) {
    throw new Error('SafeMath: Cannot perform modulo on NaN values');
  }

  // Check for modulo by zero
  if (numB === 0) {
    throw new Error('SafeMath: Modulo by zero');
  }

  // Perform the operation
  return numA % numB;
}

/**
 * Safely increment a number by 1
 *
 * @param a - Number to increment
 * @returns The incremented value if it's safe, otherwise throws an error
 */
export function increment(a: number): number {
  return add(a, 1);
}

/**
 * Safely decrement a number by 1
 *
 * @param a - Number to decrement
 * @returns The decremented value if it's safe, otherwise throws an error
 */
export function decrement(a: number): number {
  return subtract(a, 1);
}

/**
 * Safely perform left bit shift
 *
 * @param a - Value to shift
 * @param bits - Number of bits to shift by
 * @returns The shifted value if it's safe, otherwise throws an error
 */
export function shiftLeft(a: number, bits: number): number {
  // Convert inputs to numbers if they aren't already
  const numA = Number(a);
  const numBits = Number(bits);

  // Check if either is NaN
  if (isNaN(numA) || isNaN(numBits)) {
    throw new Error('SafeMath: Cannot shift NaN values');
  }

  // Check if shift amount is negative
  if (numBits < 0) {
    throw new Error('SafeMath: Cannot shift by negative amount');
  }

  // Check if shift amount is too large
  if (numBits >= 32) {
    throw new Error('SafeMath: Shift amount too large');
  }

  // Check for potential overflow
  if (numA >= 2 ** (31 - numBits) || numA <= -(2 ** (31 - numBits))) {
    throw new Error(`SafeMath: Shift left overflow: ${numA} << ${numBits}`);
  }

  // Perform the operation
  return numA << numBits;
}

/**
 * Safely perform right bit shift
 *
 * @param a - Value to shift
 * @param bits - Number of bits to shift by
 * @returns The shifted value
 */
export function shiftRight(a: number, bits: number): number {
  // Convert inputs to numbers if they aren't already
  const numA = Number(a);
  const numBits = Number(bits);

  // Check if either is NaN
  if (isNaN(numA) || isNaN(numBits)) {
    throw new Error('SafeMath: Cannot shift NaN values');
  }

  // Check if shift amount is negative
  if (numBits < 0) {
    throw new Error('SafeMath: Cannot shift by negative amount');
  }

  // Perform the operation (right shift cannot overflow)
  return numA >> numBits;
}

/**
 * Safely calculate the power of a number
 *
 * @param base - The base
 * @param exponent - The exponent
 * @returns base^exponent if it's safe, otherwise throws an error
 */
export function power(base: number, exponent: number): number {
  // Convert inputs to numbers if they aren't already
  const numBase = Number(base);
  const numExponent = Number(exponent);

  // Check if either is NaN
  if (isNaN(numBase) || isNaN(numExponent)) {
    throw new Error('SafeMath: Cannot compute power with NaN values');
  }

  // Handle special cases
  if (numExponent === 0) return 1;
  if (numExponent === 1) return numBase;
  if (numBase === 0) return 0;
  if (numBase === 1) return 1;

  // Check for potential overflow with log approximation
  if (numExponent > 1) {
    const estimatedResult = numExponent * Math.log(Math.abs(numBase));
    if (estimatedResult > Math.log(MAX_SAFE_INTEGER)) {
      throw new Error(`SafeMath: Power operation would overflow: ${numBase}^${numExponent}`);
    }
  }

  // Perform the operation
  const result = Math.pow(numBase, numExponent);

  // Check result
  if (
    result > MAX_SAFE_INTEGER ||
    result < MIN_SAFE_INTEGER ||
    !Number.isFinite(result)
  ) {
    throw new Error(`SafeMath: Power operation overflow: ${numBase}^${numExponent}`);
  }

  return result;
}

/**
 * Safe conversion utilities to prevent numeric conversion issues
 */
export const safeConversion = {
  /**
   * Safely convert a value to an integer
   *
   * @param value - Value to convert
   * @param radix - Radix for string conversion (default: 10)
   * @returns The integer value
   */
  toInteger(value: any, radix = 10): number {
    let result: number;

    if (typeof value === 'string') {
      // Parse string with radix
      result = parseInt(value, radix);
    } else {
      // Use standard conversion
      result = Math.floor(Number(value));
    }

    // Check if the result is valid
    if (isNaN(result)) {
      throw new Error(`SafeMath: Cannot convert '${value}' to integer`);
    }

    // Check if the result is within safe range
    if (result > MAX_SAFE_INTEGER || result < MIN_SAFE_INTEGER) {
      throw new Error(`SafeMath: Integer conversion overflow: ${value}`);
    }

    return result;
  },

  /**
   * Safely convert a value to a number
   *
   * @param value - Value to convert
   * @returns The number value
   */
  toNumber(value: any): number {
    const result = Number(value);

    // Check if the result is valid
    if (isNaN(result)) {
      throw new Error(`SafeMath: Cannot convert '${value}' to number`);
    }

    // Check if the result is within safe range
    if (result > MAX_SAFE_INTEGER || result < MIN_SAFE_INTEGER) {
      throw new Error(`SafeMath: Number conversion overflow: ${value}`);
    }

    return result;
  }
};

export default {
  add,
  subtract,
  multiply,
  divide,
  modulo,
  increment,
  decrement,
  shiftLeft,
  shiftRight,
  power,
  safeConversion
}; 