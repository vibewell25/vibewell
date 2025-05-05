import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML content to sanitize
 * @returns Safe HTML string with potentially dangerous tags/attributes removed
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  
  // Configure DOMPurify with strict options
  const config = {
    ALLOWED_TAGS: [
      'a', 'b', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'hr', 'i', 'li', 'ol', 'p', 'span', 'strong', 'ul', 'img'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src', 'rel', 'target', 'class', 'style'
    ],
    FORBID_CONTENTS: ['script', 'style', 'iframe', 'form', 'input', 'button'],
    ALLOW_UNKNOWN_PROTOCOLS: false,
    ADD_ATTR: ['target="_blank"', 'rel="noopener noreferrer"'], ;
  
  return DOMPurify.sanitize(html, config);
/**
 * Sanitizes a text string by removing HTML and potentially dangerous characters
 * @param text - The text to sanitize
 * @returns Sanitized plain text string
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';
  
  // First remove any HTML
  const noHtml = DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
  
  // Then escape any remaining special characters
  return validator.escape(noHtml);
/**
 * Sanitizes a URL to prevent javascript: and data: URLs
 * @param url - The URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // Check for javascript: or data: URLs which can be used for XSS
  if (
    url.toLowerCase().startsWith('javascript:') || 
    url.toLowerCase().startsWith('data:') ||
    url.toLowerCase().startsWith('vbscript:')
  ) {
    return '';
// Validate URL format
  if (!validator.isURL(url, { 
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
)) {
    return '';
return url;
/**
 * Sanitizes an email address
 * @param email - The email to sanitize
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email) return '';
  
  const sanitized = validator.escape(email.trim());
  
  if (!validator.isEmail(sanitized)) {
    return '';
return sanitized;
/**
 * Object schema sanitization utility using Zod
 * Use to sanitize and validate user inputs for APIs
 * @param schema - Zod schema for validation
 * @param data - Input data to sanitize
 * @returns Validated and sanitized data
 */
export function sanitizeData<T>(schema: z.ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data);
catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
throw error;
/**
 * Middleware for sanitizing request bodies
 * @param schema - Zod schema for the request body
 */
export function validateRequestBody<T>(schema: z.ZodType<T>) {
  return async (req: any, res: any, next: () => void) => {
    try {
      const sanitizedBody = sanitizeData(schema, req.body);
      req.body = sanitizedBody;
      next();
catch (error) {
      res.status(400).json({ 
        error: 'Invalid request data',
        message: error instanceof Error ? error.message : 'Validation failed',
/**
 * Sanitize SQL input to prevent SQL injection
 * @param value - The value to sanitize for SQL queries
 * @returns Sanitized value safe for SQL
 */
export function sanitizeSqlInput(value: string | null | undefined): string {
  if (!value) return '';
  
  // Replace SQL metacharacters
  return value
    .replace(/'/g, "''") // Escape single quotes
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/\0/g, '\\0') // Escape NULL bytes
    .replace(/\n/g, '\\n') // Escape newlines
    .replace(/\r/g, '\\r') // Escape carriage returns
    .replace(/\x1a/g, '\\Z'); // Escape ctrl+Z
/**
 * Sanitizes a filename to ensure it's safe for filesystem operations
 * @param filename - The filename to sanitize
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string | null | undefined): string {
  if (!filename) return '';
  
  // Remove path traversal attempts and invalid characters
  return filename
    .replace(/[/\\?%*:|"<>]/g, '_') // Replace invalid chars with underscore
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/^\/+/, '') // Remove leading slashes
    .trim();
// Export a default object with all sanitization functions
export default {
  html: sanitizeHtml,
  text: sanitizeText,
  url: sanitizeUrl,
  email: sanitizeEmail,
  data: sanitizeData,
  validateRequestBody,
  sqlInput: sanitizeSqlInput,
  filename: sanitizeFilename,
