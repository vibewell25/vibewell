import * as Sentry from '@sentry/nextjs';

import posthog from 'posthog-js';

import type { AnalyticsConfig } from '@/types/third-party';


import { ThirdPartyManager } from '../services/third-party-manager';

// Initialize PostHog
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
// Initialize Sentry
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
// Analytics event types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
export interface PageView {
  path: string;
  title?: string;
  referrer?: string;
  userId?: string;
// Analytics provider interface
export interface AnalyticsProvider {
  trackEvent: (event: AnalyticsEvent) => void;
  trackPageView: (url: string) => void;
  identify: (userId: string, traits?: Record<string, any>) => void;
// Analytics implementation
class AnalyticsService implements AnalyticsProvider {
  trackEvent({ name, properties, category }: AnalyticsEvent): void {
    // Track with PostHog
    if (typeof window !== 'undefined') {
      posthog.capture(name, {
        ...properties,
        category,
// Track with Sentry if it's an error
    if (category === 'error') {
      Sentry.captureEvent({
        message: name,
        level: 'error',
        extra: properties,
trackPageView(url: string): void {
    if (typeof window !== 'undefined') {
      posthog.capture('$pageview', {
        url,
identify(userId: string, traits?: Record<string, any>): void {
    if (typeof window !== 'undefined') {
      posthog.identify(userId, traits);
// Performance monitoring
  trackPerformance(metric: {
    name: string;
    value: number;
    unit?: 'ms' | 'bytes' | 'percent';
): void {
    this.trackEvent({
      name: 'performance_metric',
      properties: metric,
      category: 'performance',
// Error tracking
  trackError(error: Error, context?: Record<string, any>): void {
    this.trackEvent({
      name: 'error',
      properties: {
        message: error.message,
        stack: error.stack,
        ...context,
category: 'error',
Sentry.captureException(error, {
      extra: context,
// User engagement tracking
  trackEngagement(action: string, details?: Record<string, any>): void {
    this.trackEvent({
      name: action,
      properties: details,
      category: 'engagement',
// Export singleton instance
export const analytics = new AnalyticsService();

// We'll move this to a separate React component file
// export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
//   return (
//     <>
//       <Analytics />
//       {children}
//     </>
//   );
// }

export class AnalyticsUtils {
  private static manager = ThirdPartyManager.getInstance();

  static async trackEvent(event: AnalyticsEvent): Promise<void> {
    const analytics = this.manager.getService('analytics');
    if (!analytics) return;

    const config = this.manager.getServiceConfig('analytics') as AnalyticsConfig;

    try {
      switch (config.service) {

        case 'google-analytics':
          await analytics.event({
            eventCategory: event.name,
            eventAction: 'trigger',
            eventLabel: JSON.stringify(event.properties),
            userId: event.userId,
break;

        case 'mixpanel':
          await analytics.track(event.name, {
            ...event.properties,
            distinct_id: event.userId,
            time: event.timestamp || Date.now(),
break;

        case 'segment':
          await analytics.track({
            event: event.name,
            properties: event.properties,
            userId: event.userId,
            timestamp: event.timestamp,
break;
catch (error) {
      console.error('Failed to track analytics event:', error);
static async trackPageView(pageView: PageView): Promise<void> {
    const analytics = this.manager.getService('analytics');
    if (!analytics) return;

    const config = this.manager.getServiceConfig('analytics') as AnalyticsConfig;

    try {
      switch (config.service) {

        case 'google-analytics':
          await analytics.pageview({
            dp: pageView.path,
            dt: pageView.title,
            dr: pageView.referrer,
            uid: pageView.userId,
break;

        case 'mixpanel':
          await analytics.track('Page View', {
            path: pageView.path,
            title: pageView.title,
            referrer: pageView.referrer,
            distinct_id: pageView.userId,
break;

        case 'segment':
          await analytics.page({
            name: pageView.title,
            path: pageView.path,
            referrer: pageView.referrer,
            userId: pageView.userId,
break;
catch (error) {
      console.error('Failed to track page view:', error);
static async identifyUser(userId: string, traits?: Record<string, any>): Promise<void> {
    const analytics = this.manager.getService('analytics');
    if (!analytics) return;

    const config = this.manager.getServiceConfig('analytics') as AnalyticsConfig;

    try {
      switch (config.service) {

        case 'google-analytics':
          await analytics.set({ userId, ...traits });
          break;

        case 'mixpanel':
          await analytics.people.set(userId, traits);
          break;

        case 'segment':
          await analytics.identify({
            userId,
            traits,
break;
catch (error) {
      console.error('Failed to identify user:', error);
static async groupUser(
    userId: string,
    groupId: string,
    traits?: Record<string, any>,
  ): Promise<void> {
    const analytics = this.manager.getService('analytics');
    if (!analytics) return;

    const config = this.manager.getServiceConfig('analytics') as AnalyticsConfig;

    try {
      switch (config.service) {
        case 'mixpanel':
          await analytics.set_group(groupId, userId);
          if (traits) {
            await analytics.group.set(groupId, traits);
break;

        case 'segment':
          await analytics.group({
            userId,
            groupId,
            traits,
break;
catch (error) {
      console.error('Failed to group user:', error);
