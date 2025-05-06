import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';
import { nanoid } from 'nanoid';

import { logger } from '@/lib/logger';

interface SecurityConfig {
  isDev: boolean;
  allowedHosts: string[];
  trustedOrigins: string[];
const defaultConfig: SecurityConfig = {
  isDev: process.env.NODE_ENV !== 'production',
  allowedHosts: ['localhost', 'vibewell.com'], // Add your domains
  trustedOrigins: ['https://vibewell.com'], // Add your trusted origins
// CSP Directives
const getCSPDirectives = (config: SecurityConfig, nonce: string): string => {
  const directives = {

    'default-src': ["'self'"],

    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,

      ...(config.isDev ? ["'unsafe-eval'"] : []), // Allow eval in development
    ],



    'style-src': ["'self'", "'unsafe-inline'"], // Consider removing unsafe-inline if possible

    'img-src': ["'self'", 'data:', 'https:'],

    'font-src': ["'self'", 'https:', 'data:'],

    'connect-src': [
      "'self'",
      ...config.trustedOrigins,
      ...(config.isDev ? ['ws://localhost:*'] : []),
    ],

    'media-src': ["'self'"],

    'object-src': ["'none'"],

    'base-uri': ["'self'"],

    'form-action': ["'self'"],

    'frame-ancestors': ["'none'"],

    'frame-src': ["'self'"],

    'worker-src': ["'self'", 'blob:'],

    'child-src': ["'self'", 'blob:'],

    'upgrade-insecure-requests': [],
return Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(' ')}`;
)
    .join('; ');
// Permissions Policy Directives
const getPermissionsPolicy = (): string => {
  const directives = {
    accelerometer: [],

    'ambient-light-sensor': [],
    autoplay: ['self'],
    battery: ['self'],
    camera: ['self'],

    'display-capture': ['self'],

    'document-domain': [],

    'encrypted-media': ['self'],
    fullscreen: ['self'],
    gamepad: ['self'],
    geolocation: ['self'],
    gyroscope: [],
    magnetometer: [],
    microphone: ['self'],
    midi: [],
    payment: ['self'],

    'picture-in-picture': [],

    'publickey-credentials-get': ['self'],

    'screen-wake-lock': ['self'],

    'sync-xhr': ['self'],
    usb: [],

    'web-share': ['self'],

    'xr-spatial-tracking': [],
return Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) return `${key}=()`;
      return `${key}=(${values.join(' ')})`;
)
    .join(', ');
// Security Headers Configuration
const getSecurityHeaders = (config: SecurityConfig): Record<string, string> => {
  const nonce = nanoid();

  const headers: Record<string, string> = {
    // HSTS Configuration

    'Strict-Transport-Security': config.isDev
      ? ''

      : 'max-age=31536000; includeSubDomains; preload',
    
    // Content Security Policy

    'Content-Security-Policy': getCSPDirectives(config, nonce),
    
    // Permissions Policy

    'Permissions-Policy': getPermissionsPolicy(),
    
    // Additional Security Headers


    'X-Content-Type-Options': 'nosniff',

    'X-Frame-Options': 'DENY',

    'X-XSS-Protection': '1; mode=block',



    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Cache Control



    'Cache-Control': 'no-store, max-age=0',
    

    // Cross-Origin Headers



    'Cross-Origin-Opener-Policy': 'same-origin',



    'Cross-Origin-Embedder-Policy': 'require-corp',



    'Cross-Origin-Resource-Policy': 'same-origin',
// Remove empty headers
  Object.keys(headers).forEach(key => {

    if (!headers[key]) {

    delete headers[key];
return headers;
// Request Correlation ID Middleware
const addCorrelationId = (req: NextRequest): string => {

  const correlationId = req.headers.get('x-correlation-id') || nanoid();
  return correlationId;
// API Key Validation
const validateApiKey = (req: NextRequest): boolean => {

  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) return false;

  const validApiKey = process.env['API_KEY'];
  if (!validApiKey) {
    logger.error('API_KEY environment variable is not set');
    return false;
return apiKey === validApiKey;
// Main Security Middleware
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); securityHeadersMiddleware(
  req: NextRequest,
  config: Partial<SecurityConfig> = {}
): Promise<NextResponse | null> {
  const finalConfig = { ...defaultConfig, ...config };
  const correlationId = addCorrelationId(req);
  
  // Skip security checks for public assets
  if (req.nextUrl.pathname.startsWith('/_next/') || 
      req.nextUrl.pathname.startsWith('/public/')) {
    return null;
// Validate host header
  const host = req.headers.get('host');
  if (!host || !finalConfig.allowedHosts.includes(host.split(':')[0])) {
    logger.warn(`Invalid host header detected: ${host || 'none'} (${correlationId})`);
    return NextResponse.json(
      { error: 'Invalid host header' },
      { status: 400 }
// Validate API key for API routes
  if (req.nextUrl.pathname.startsWith('/api/') && !validateApiKey(req)) {
    logger.warn(`Invalid API key for path: ${req.nextUrl.pathname} (${correlationId})`);
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
// Apply security headers
  const headers = getSecurityHeaders(finalConfig);
  const response = NextResponse.next();
  
  // Add headers to response
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
// Add correlation ID to response headers

  response.headers.set('x-correlation-id', correlationId);

  // Return nonce for use in templates

  response.headers.set('x-nonce', nanoid());

  return response;
// Export types and configurations
export type { SecurityConfig };
export { getSecurityHeaders, validateApiKey }; 