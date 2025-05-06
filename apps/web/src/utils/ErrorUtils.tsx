functions that work alongside
 * the main error-handler.ts system. These utilities help ensure proper type checking
 * and guard against undefined/null errors.
 */

import { isError, isString } from './type-guards';
import { ErrorCategory, ErrorSource, ErrorSeverity } from './error-handler';

/**
 * Safely creates an error message from any error type
 * @param error - The error object or message
 * @returns A standardized error message string
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
else if (isString(error)) {
    return error;
else if (error === null) {
    return 'Null error';
else if (error === undefined) {
    return 'Undefined error';
else {
    try {
      return String(error);
catch {
      return 'Unknown error';
/**
 * Safely extracts the error name if available
 * @param error - The error object
 * @returns The error name or a default string
 */
export function getErrorName(error: unknown): string {
  if (isError(error)) {
    return error.name;
return 'Error';
/**
 * Safely determines if an error is a network error
 * @param error - The error to check
 * @returns True if it appears to be a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (!isError(error)) return false;

  // Check for common network error patterns
  return (
    error.name === 'TypeError' ||
    error.name === 'NetworkError' ||
    error.message.includes('network') ||
    error.message.includes('fetch') ||
    error.message.includes('connection')
/**
 * Safely determines if an error is a timeout error
 * @param error - The error to check
 * @returns True if it appears to be a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (!isError(error)) return false;

  return (
    error.name === 'TimeoutError' ||
    error.message.includes('timeout') ||
    error.message.includes('timed out')
/**
 * Safely determines if an error is a not found error
 * @param error - The error to check
 * @returns True if it appears to be a not found error
 */
export function isNotFoundError(error: unknown): boolean {
  if (!isError(error)) return false;

  return error.message.includes('not found') || error.message.includes('404');
/**
 * Safely determines if an error is a server error
 * @param error - The error to check
 * @returns True if it appears to be a server error
 */
export function isServerError(error: unknown): boolean {
  if (!isError(error)) return false;

  return (
    error.message.includes('server error') ||
    error.message.includes('500') ||
    error.message.includes('internal')
/**
 * Safely determines if an error is an authentication error
 * @param error - The error to check
 * @returns True if it appears to be an authentication error
 */
export function isAuthenticationError(error: unknown): boolean {
  if (!isError(error)) return false;

  return (
    error.message.includes('authentication') ||
    error.message.includes('unauthenticated') ||
    error.message.includes('unauthorized') ||
    error.message.includes('401') ||
    error.message.includes('login')
/**
 * Gets the appropriate error category based on the error
 * @param error - The error to categorize
 * @returns The appropriate ErrorCategory
 */
export function getErrorCategory(error: unknown): ErrorCategory {
  if (isAuthenticationError(error)) {
    return ErrorCategory.AUTHENTICATION;
else if (isNotFoundError(error)) {
    return ErrorCategory.RESOURCE_NOT_FOUND;
else if (isTimeoutError(error)) {
    return ErrorCategory.TIMEOUT;
else if (isNetworkError(error)) {
    return ErrorCategory.API;
else if (isServerError(error)) {
    return ErrorCategory.SERVER;
else {
    return ErrorCategory.UNKNOWN;
/**
 * Gets the appropriate error source based on the error
 * @param error - The error to source
 * @returns The appropriate ErrorSource
 */
export function getErrorSource(error: unknown): ErrorSource {
  if (isNetworkError(error)) {
    return ErrorSource.NETWORK;
else if (isServerError(error)) {
    return ErrorSource.SERVER;
else {
    return ErrorSource.CLIENT;
/**
 * Safely determines the severity of an error
 * @param error - The error to check
 * @returns The appropriate ErrorSeverity
 */
export function getErrorSeverity(error: unknown): ErrorSeverity {
  if (isServerError(error) || isAuthenticationError(error)) {
    return ErrorSeverity.ERROR;
else if (isNetworkError(error) || isTimeoutError(error)) {
    return ErrorSeverity.WARNING;
else if (isNotFoundError(error)) {
    return ErrorSeverity.INFO;
else {
    return ErrorSeverity.ERROR;
/**
 * Enhances an error object with additional metadata for the error handler
 * @param error - The original error
 * @param options - Additional options to add
 * @returns An object with error properly typed and additional metadata
 */
export function enhanceError(
  error: unknown,
  options?: {
    category?: ErrorCategory;
    source?: ErrorSource;
    severity?: ErrorSeverity;
    metadata?: Record<string, any>;
    code?: string;
): {
  errorMessage: string;
  originalError: Error | undefined;
  category: ErrorCategory;
  source: ErrorSource;
  severity: ErrorSeverity;
  metadata: Record<string, any>;
  code?: string;
{
  const errorMessage = getErrorMessage(error);
  const originalError = isError(error) ? error : undefined;

  return {
    errorMessage,
    originalError,
    category: options.category || getErrorCategory(error),
    source: options.source || getErrorSource(error),
    severity: options.severity || getErrorSeverity(error),
    metadata: options.metadata || {},
    code: options.code,
