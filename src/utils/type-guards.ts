/**
 * Type Guard Utilities
 * 
 * This file provides type guard functions to handle type narrowing for nullable and
 * undefined values throughout the application. These functions help TypeScript
 * correctly infer types in conditional blocks and avoid common type errors.
 * 
 * NOTE: This file uses TypeScript generics without JSX content, so it has a .ts extension.
 * When writing TypeScript files with generics:
 * 1. If the file contains JSX/React elements, use the .tsx extension and be careful with generic syntax
 *    - Consider using named type parameters (like PromiseType instead of T) to avoid conflict with JSX
 *    - Extract complex generic functions to separate functions with clear parameter names
 * 2. If the file contains only TypeScript (no JSX), use the .ts extension
 */

/**
 * Checks if a value is defined (not undefined)
 * @param value - The value to check
 * @returns True if the value is not undefined
 */
export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * Checks if a value is not null
 * @param value - The value to check
 * @returns True if the value is not null
 */
export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

/**
 * Checks if a value exists (not null and not undefined)
 * @param value - The value to check
 * @returns True if the value is neither null nor undefined
 */
export function exists<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Checks if a value is a string
 * @param value - The value to check
 * @returns True if the value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Checks if a value is a number
 * @param value - The value to check
 * @returns True if the value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Checks if a value is an Error
 * @param value - The value to check
 * @returns True if the value is an Error object
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Safely accesses a property of an object that might be undefined
 * @param obj - The object to access a property from
 * @param key - The key of the property to access
 * @returns The value of the property if it exists, otherwise undefined
 */
export function safeAccess<T, K extends keyof T>(obj: T | null | undefined, key: K): T[K] | undefined {
  return exists(obj) ? obj[key] : undefined;
}

/**
 * A type guard for checking if an object has a specific property
 * @param obj - The object to check
 * @param prop - The name of the property to check for
 * @returns True if the object has the specified property
 */
export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * Checks if a value is an array
 * @param value - The value to check
 * @returns True if the value is an array
 */
export function isArray<T>(value: unknown): value is Array<T> {
  return Array.isArray(value);
}

/**
 * Checks if an array is not empty
 * @param arr - The array to check
 * @returns True if the array exists and has at least one element
 */
export function isNonEmptyArray<T>(arr: T[] | null | undefined): arr is T[] {
  return exists(arr) && arr.length > 0;
}

/**
 * Checks if a value is an object (and not null)
 * @param value - The value to check
 * @returns True if the value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Converts a value to a string safely
 * @param value - The value to convert
 * @returns The string representation or an empty string if null/undefined
 */
export function safeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

/**
 * Converts a value to a number safely
 * @param value - The value to convert
 * @param defaultValue - The default value to return if conversion fails
 * @returns The number or the default value if conversion fails
 */
export function safeNumber(value: unknown, defaultValue = 0): number {
  if (value === null || value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
} 