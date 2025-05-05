import { env } from '@/config/env';

/**
 * Security Headers Module
 * 
 * This module provides functions to generate and apply security headers
 * for the VibeWell application, following web security best practices.
 */

// Default CSP sources
const DEFAULT_IMG_SOURCES = 'https://storage.getvibewell.com https://*.amazonaws.com https://*.auth0.com';
const DEFAULT_CONNECT_SOURCES = 'https://*.auth0.com https://api.getvibewell.com';
const DEFAULT_MEDIA_SOURCES = 'https://*.amazonaws.com';

export type SecurityHeadersConfig = {
  isDevelopment: boolean;
  nonce?: string;
/**
 * Generate a cryptographically secure random nonce
 * @returns A base64 encoded nonce string
 */
export function generateNonce(): string {
  if (typeof window !== 'undefined') {
    // Client-side
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)));
else {
    // Server-side
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('base64');
/**
 * Generate Content Security Policy header value
 * @param config Security headers configuration
 * @returns CSP header value string
 */
export function getContentSecurityPolicy(config: SecurityHeadersConfig): string {
  const { isDevelopment, nonce } = config;
  
  // Define CSP directives - more restrictive in production
  const directives = [
    // Default (fallback) policy
    `default-src 'self'${isDevelopment ? " 'unsafe-eval'" : ''}`,
    
    // Scripts - use nonce-based CSP in production for better security
    `script-src 'self'${nonce ? ` 'nonce-${nonce}'` : ''}${isDevelopment ? " 'unsafe-eval' 'unsafe-inline'" : ''} https://*.auth0.com https://*.stripe.com`,
    
    // Styles - allow inline styles with hash or nonce in production
    `style-src 'self'${isDevelopment ? " 'unsafe-inline'" : ` 'nonce-${nonce || ''}'`}`,
    
    // Images
    `img-src 'self' data: blob: ${DEFAULT_IMG_SOURCES}`,
    
    // Fonts
    `font-src 'self'`,
    
    // Connect (API, WebSockets)
    `connect-src 'self' ${DEFAULT_CONNECT_SOURCES}`,
    
    // Media
    `media-src 'self' ${DEFAULT_MEDIA_SOURCES}`,
    
    // Frames - restrict to same origin and Auth0
    `frame-src 'self' https://*.auth0.com https://*.stripe.com`,
    
    // Forms - only post to our own origin
    `form-action 'self'`,
    
    // Block site from being framed by other sites to prevent clickjacking
    `frame-ancestors 'none'`,
    
    // Disallow object tags (Flash, Java applets, etc.)
    `object-src 'none'`,
    
    // Allow manifest file
    `manifest-src 'self'`,
    
    // Worker scripts
    `worker-src 'self'${isDevelopment ? " blob:" : ''}`,
    
    // Ensure base tags can only be self
    `base-uri 'self'`,
  ];

  return directives.join('; ');
/**
 * Generate Permissions Policy header value
 * @returns Permissions Policy header value string
 */
export function getPermissionsPolicy(): string {
  const permissions = [
    // Sensors and device access
    'accelerometer=()',
    'ambient-light-sensor=()',
    'autoplay=()',
    'battery=(self)',
    'camera=(self)',
    'display-capture=()',
    'document-domain=(self)',
    'encrypted-media=(self)',
    'execution-while-not-rendered=(self)',
    'execution-while-out-of-viewport=(self)',
    // Only allow geolocation in specific contexts
    'geolocation=()',
    'gyroscope=()',
    'hid=()',
    'idle-detection=()',
    'magnetometer=()',
    'microphone=()',
    // Disable Federated Learning of Cohorts (FLoC)
    'interest-cohort=()',
    'midi=()',
    'payment=(self)',
    'picture-in-picture=()',
    'publickey-credentials-get=(self)',
    'screen-wake-lock=()',
    'serial=()',
    'usb=()',
    'web-share=(self)',
    'xr-spatial-tracking=()',
  ];

  return permissions.join(', ');
/**
 * Generate all security headers
 * @param config Security headers configuration
 * @returns Object with all security headers
 */
export function getSecurityHeaders(config: SecurityHeadersConfig): Record<string, string> {
  const headers: Record<string, string> = {
    // Prevent browsers from incorrectly detecting non-scripts as scripts
    'X-Content-Type-Options': 'nosniff',
    
    // Block loading of site in iframe/frame to prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Control DNS prefetching
    'X-DNS-Prefetch-Control': 'on',
    
    // Cross-site scripting protection
    'X-XSS-Protection': '1; mode=block',
    
    // Control referrer header
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions policy (formerly Feature-Policy)
    'Permissions-Policy': getPermissionsPolicy(),
    
    // Content Security Policy
    'Content-Security-Policy': getContentSecurityPolicy(config),
// HSTS header - only in production
  if (!config.isDevelopment) {
    headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload';
return headers;
/**
 * Apply security headers to a response
 * @param headers Headers object to modify
 * @param config Security headers configuration
 */
export function applySecurityHeaders(
  headers: Headers | Record<string, string>,
  config: SecurityHeadersConfig = { isDevelopment: process.env.NODE_ENV !== 'production' }
): void {
  const securityHeaders = getSecurityHeaders(config);
  
  // Apply each header to the response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (headers instanceof Headers) {
      headers.set(key, value);
else {
      headers[key] = value;
export default {
  getSecurityHeaders,
  applySecurityHeaders,
  generateNonce,
  getContentSecurityPolicy,
  getPermissionsPolicy,
