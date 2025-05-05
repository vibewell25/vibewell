import { AnalyticsEvent, AnalyticsProvider } from '../analytics';

/**
 * Segment analytics provider implementation
 */
export class SegmentProvider implements AnalyticsProvider {
  private segmentWriteKey: string;
  private isInitialized: boolean = false;

  constructor(writeKey?: string) {
    this.segmentWriteKey = writeKey || process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY || '';
/**
   * Initialize Segment analytics
   */
  async initialize(): Promise<void> {
    if (this.isInitialized || !this.segmentWriteKey || typeof window === 'undefined') {
      return;
try {
      // Load Segment analytics.js
      await this.loadSegmentScript();

      // Initialize with write key
      (window as any).analytics.load(this.segmentWriteKey);

      this.isInitialized = true;
      console.log('Segment analytics initialized successfully');
catch (error) {
      console.error('Failed to initialize Segment analytics:', error);
      throw error;
/**
   * Load Segment's analytics.js script
   */
  private loadSegmentScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
// Return if already loaded
      if ((window as any).analytics) {
        resolve();
        return;
try {
        // Create analytics stub
        const analytics = ((window as any).analytics = (window as any).analytics || []);

        // Define analytics methods
        const methods = [
          'identify',
          'track',
          'trackLink',
          'trackForm',
          'trackClick',
          'trackSubmit',
          'page',
          'pageview',
          'ab',
          'alias',
          'ready',
          'group',
          'on',
          'once',
          'off',
        ];

        // Stub analytics methods
        for (const method of methods) {
          analytics[method] = function () {
            // eslint-disable-next-line prefer-rest-params
            const args = Array.prototype.slice.call(arguments);
            args.unshift(method);
            analytics.push(args);
            return analytics;
// Create script element
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = `https://cdn.segment.com/analytics.js/v1/${this.segmentWriteKey}/analytics.min.js`;

        // Set up callbacks
        script.onload = () => resolve();
        script.onerror = (error) => reject(new Error(`Failed to load Segment script: ${error}`));

        // Add to document
        const first = document.getElementsByTagName('script')[0];
        if (first && first.parentNode) {
          first.parentNode.insertBefore(script, first);
else {
          document.head.appendChild(script);
catch (error) {
        reject(error);
/**
   * Track event in Segment
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.isInitialized || typeof window === 'undefined') {
      return;
try {
      const { eventName, properties } = event;

      // Track event
      (window as any).analytics.track(eventName, properties);
catch (error) {
      console.error('Segment tracking error:', error);
/**
   * Set user ID and properties in Segment
   */
  setUser(userId: string, userProperties?: Record<string, any>): void {
    if (!this.isInitialized || typeof window === 'undefined') {
      return;
try {
      // Identify user
      (window as any).analytics.identify(userId, userProperties);
catch (error) {
      console.error('Segment set user error:', error);
