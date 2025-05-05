import { randomBytes } from 'crypto';

/**
 * Generates a cryptographically secure random string of specified length
 * @param length The length of the random string to generate
 * @returns A random string of the specified length
 */
export function generateRandomString(length: number): string {

  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
/**
 * Generates a cryptographically secure random string suitable for use as a session token
 * @returns A random string suitable for use as a session token
 */
export function generateSessionToken(): string {
  return generateRandomString(32);
/**
 * Generates a cryptographically secure random string suitable for use as an API key
 * @returns A random string suitable for use as an API key
 */
export function generateApiKey(): string {
  return `vw_${generateRandomString(32)}`;
/**

 * Performs a timing-safe comparison of two strings
 * @param a The first string to compare
 * @param b The second string to compare
 * @returns true if the strings are equal, false otherwise
 */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
let result = 0;
  for (let i = 0; i < a.length; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
return result === 0;
