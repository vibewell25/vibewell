import type { Event } from '@sentry/types';


import * as Sentry from '@sentry/nextjs';

import { ProfilingIntegration } from '@sentry/profiling-node';

export function initializeMonitoring() {
  if (process.env['NEXT_PUBLIC_VERCEL_ENV'] !== 'development') {
    Sentry.init({
      dsn: process.env['SENTRY_DSN'],
      environment: process.env['NEXT_PUBLIC_VERCEL_ENV'],
      integrations: [
        new ProfilingIntegration(),
      ],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
      
      // Performance monitoring
      enableTracing: true,
      
      // Only send errors in production
      beforeSend(event: Event): Event | null {
        if (process.env['NEXT_PUBLIC_VERCEL_ENV'] === 'production') {
          return event;
return null;
// Ignore specific errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Network request failed',
      ],
export function captureException(error: Error, context?: Record<string, any>) {
  if (process.env['NEXT_PUBLIC_VERCEL_ENV'] !== 'development') {
    Sentry.captureException(error, {
      extra: context,
console.error('Error:', error, context);
export function setUserContext(user: { id: string; email?: string }) {
  if (process.env['NEXT_PUBLIC_VERCEL_ENV'] !== 'development') {
    Sentry.setUser({
      id: user.id,
      email: user.email,
export function clearUserContext() {
  if (process.env['NEXT_PUBLIC_VERCEL_ENV'] !== 'development') {
    Sentry.setUser(null);
export function startTransaction(name: string, op: string) {
  if (process.env['NEXT_PUBLIC_VERCEL_ENV'] !== 'development') {
    return Sentry.startTransaction({
      name,
      op,
return null;
