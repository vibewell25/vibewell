export enum EventType {
  USER_ACTION = 'user_action',
  PAGE_VIEW = 'page_view',
  SYSTEM = 'system',
  ERROR = 'error',
  PERFORMANCE = 'performance',
// Base properties interface
interface BaseProperties {
  timestamp?: number;
  sessionId?: string;
  userId?: string | null;
  [key: string]: unknown;
// Type for analytics event data
export interface AnalyticsEvent {
  eventName: string;
  eventType: EventType;
  timestamp: number;
  properties: BaseProperties;
// Interface for analytics provider implementation
export interface AnalyticsProvider {
  trackEvent: (event: AnalyticsEvent) => void;
  initialize: () => Promise<void>;
  setUser: (userId: string, userProperties?: UserProperties) => void;
// Additional types for analytics
export interface UserProperties extends BaseProperties {
  userType?: string;
  email?: string;
  role?: string;
  accountType?: string;
  subscriptionTier?: string;
export interface PageViewProperties extends BaseProperties {
  pagePath: string;
  pageTitle?: string;
  referrer?: string;
  loadTime?: number;
export interface ErrorProperties extends BaseProperties {
  errorName: string;
  errorMessage: string;
  stackTrace?: string;
  componentName?: string;
  source?: string;
export interface PerformanceProperties extends BaseProperties {
  metricName: string;
  duration: number;
  threshold?: number;
  resourceType?: string;
// Singleton analytics service
class AnalyticsService {
  private providers: AnalyticsProvider[] = [];
  private initialized = false;
  private queue: AnalyticsEvent[] = [];
  private userId: string | null = null;
  private sessionId: string = this.generateSessionId();
  private userProperties: UserProperties = {};
  private disabled = false;
  private retryCount: number = 0;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  constructor() {
    // Initialize in browser environments only
    if (typeof window !== 'undefined') {
      this.initializeFromConfig();
/**
   * Initialize the analytics service from configuration
   */
  private async initializeFromConfig(): Promise<void> {
    try {
      // Register providers based on environment
      if (process.env.NODE_ENV === 'production') {
        // In production, use real analytics providers
        // Use console analytics provider as fallback when actual providers are not available
        this.registerConsoleProvider();

        try {
          // Attempt to load Google Analytics if available
          const { GoogleAnalyticsProvider } = await import(
            './analytics-providers/google-analytics'
          ).catch(() => {
            console.warn('Google Analytics provider not available, using console fallback');
            return { GoogleAnalyticsProvider: null };
if (GoogleAnalyticsProvider) {
            this.registerProvider(new GoogleAnalyticsProvider());
// Attempt to load Segment if available
          const { SegmentProvider } = await import('./analytics-providers/segment').catch(() => {
            console.warn('Segment provider not available, using console fallback');
            return { SegmentProvider: null };
if (SegmentProvider) {
            this.registerProvider(new SegmentProvider());
catch (error) {
          console.warn(
            'Failed to load analytics providers:',
            error instanceof Error ? error.message : 'Unknown error',
// Ensure we have at least the console provider
          if (this.providers.length === 0) {
            this.registerConsoleProvider();
else {
        // In development, just use console logging
        this.registerConsoleProvider();
// Initialize the providers
      await this.initializeProviders();

      // Process any queued events
      this.processQueue();
catch (error) {
      console.error(
        'Failed to initialize analytics:',
        error instanceof Error ? error.message : 'Unknown error',
/**
   * Register a console-based analytics provider for development/fallback
   */
  private registerConsoleProvider(): void {
    this.registerProvider({
      trackEvent: (event: AnalyticsEvent) => {
        const { eventName, eventType, properties } = event;
        console.groupCollapsed(
          `%c Analytics: ${eventType} - ${eventName}`,
          'color: #3498db; font-weight: bold;',
console.log('Properties:', properties);
        console.log('Timestamp:', new Date(event.timestamp).toISOString());
        console.groupEnd();
initialize: () => Promise.resolve(),
      setUser: (userId: string, props?: UserProperties) => {
        console.log(
          `%c Analytics: Set User ${userId}`,
          'color: #2ecc71; font-weight: bold;',
          props,
/**
   * Initialize providers with retry logic
   */
  private async initializeProviders(): Promise<void> {
    try {
      await Promise.all(this.providers.map((p) => p.initialize()));
      this.initialized = true;
      this.retryCount = 0;
catch (error) {
      this.if (retryCount > Number.MAX_SAFE_INTEGER || retryCount < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); retryCount++;
      console.error(
        `Analytics initialization failed (attempt ${this.retryCount}/${this.MAX_RETRIES}):`,
        error instanceof Error ? error.message : 'Unknown error',
if (this.retryCount < this.MAX_RETRIES) {
        // Retry with exponential backoff
        const delay = this.RETRY_DELAY * Math.pow(2, this.retryCount - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.initializeProviders();
else {
        // Max retries reached, set initialized to avoid infinite retries
        console.warn(
          'Max analytics initialization retries reached, some events may not be tracked',
this.initialized = true;
/**
   * Register an analytics provider
   * @param provider Analytics provider implementation
   */
  public registerProvider(provider: AnalyticsProvider): void {
    this.providers.push(provider);
/**
   * Enable or disable analytics tracking
   * @param enabled Whether tracking is enabled
   */
  public setEnabled(enabled: boolean): void {
    this.disabled = !enabled;

    // Log status change
    console.log(`Analytics tracking ${enabled ? 'enabled' : 'disabled'}`);

    // Process queue if enabling
    if (enabled && this.initialized && this.queue.length > 0) {
      this.processQueue();
/**
   * Set the current user ID and properties
   * @param userId User identifier
   * @param properties Additional user properties
   */
  public setUser(userId: string, properties: UserProperties = {}): void {
    this.userId = userId;
    this.userProperties = { ...this.userProperties, ...properties };

    // Update user in all providers
    this.providers.forEach((provider) => {
      try {
        provider.setUser(userId, this.userProperties);
catch (error) {
        console.error('Error setting user in analytics provider:', error);
// Track user identification event
    this.trackEvent(EventType.SYSTEM, 'user_identified', {
      method: properties.userType || 'direct',
      isNewSession: true,
/**
   * Clear the current user (for logout)
   */
  public clearUser(): void {
    // Track logout event before clearing
    if (this.userId) {
      this.trackEvent(EventType.USER_ACTION, 'user_logged_out', {
        userId: this.userId,
this.userId = null;
    this.userProperties = {};
    this.sessionId = this.generateSessionId();

    // Update in providers
    this.providers.forEach((provider) => {
      try {
        provider.setUser('anonymous');
catch (error) {
        console.error('Error clearing user in analytics provider:', error);
/**
   * Track an analytics event
   */
  private trackEvent(
    eventType: EventType,
    eventName: string,
    properties: Partial<BaseProperties> = {},
  ): void {
    if (this.disabled) {
      return;
const event: AnalyticsEvent = {
      eventName,
      eventType,
      timestamp: Date.now(),
      properties: {
        ...properties,
        sessionId: this.sessionId,
        userId: this.userId,
        ...this.userProperties,
if (!this.initialized) {
      this.queue.push(event);
      return;
this.providers.forEach((provider) => {
      try {
        provider.trackEvent(event);
catch (error) {
        console.error(
          'Error tracking event:',
          error instanceof Error ? error.message : 'Unknown error',
/**
   * Process queued events
   */
  private processQueue(): void {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        this.providers.forEach((provider) => {
          try {
            provider.trackEvent(event);
catch (error) {
            console.error(
              'Error processing queued event:',
              error instanceof Error ? error.message : 'Unknown error',
/**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
/**
   * Get the current user type
   */
  private getUserType(): string {
    return this.userProperties.userType || 'anonymous';
/**
   * Log a generic event
   */
  public logEvent(eventName: string, properties: Partial<BaseProperties> = {}): void {
    this.trackEvent(EventType.SYSTEM, eventName, properties);
/**
   * Track a user action
   */
  public trackUserAction(actionName: string, properties: Partial<BaseProperties> = {}): void {
    this.trackEvent(EventType.USER_ACTION, actionName, properties);
/**
   * Track a page view
   */
  public trackPageView(
    pagePath: string,
    properties: Partial<PageViewProperties> = { pagePath },
  ): void {
    const pageViewProps: PageViewProperties = {
      pagePath,
      pageTitle: document.title,
      referrer: document.referrer,
      loadTime:
        window.performance.timing.domContentLoadedEventEnd -
        window.performance.timing.navigationStart,
      ...properties,
this.trackEvent(EventType.PAGE_VIEW, 'page_view', pageViewProps);
/**
   * Track an error
   */
  public trackError(errorName: string, properties: Partial<ErrorProperties>): void {
    const errorProps: ErrorProperties = {
      errorName,
      errorMessage: properties.errorMessage || 'Unknown error',
      ...properties,
this.trackEvent(EventType.ERROR, 'error', errorProps);
/**
   * Track a performance metric
   */
  public trackPerformance(metricName: string, properties: Partial<PerformanceProperties>): void {
    const perfProps: PerformanceProperties = {
      metricName,
      duration: properties.duration || 0,
      ...properties,
this.trackEvent(EventType.PERFORMANCE, 'performance', perfProps);
// Create singleton instance
const analyticsService = new AnalyticsService();

// Export convenience methods
export const logEvent = (eventName: string, properties?: Partial<BaseProperties>): void =>
  analyticsService.logEvent(eventName, properties);

export const trackUserAction = (actionName: string, properties?: Partial<BaseProperties>): void =>
  analyticsService.trackUserAction(actionName, properties);

export const trackPageView = (pagePath: string, properties?: Partial<PageViewProperties>): void =>
  analyticsService.trackPageView(pagePath, properties);

export const trackError = (errorName: string, properties: Partial<ErrorProperties>): void =>
  analyticsService.trackError(errorName, properties);

export const trackPerformance = (
  metricName: string,
  properties: Partial<PerformanceProperties>,
): void => analyticsService.trackPerformance(metricName, properties);

export const setUser = (userId: string, properties?: Partial<UserProperties>): void =>
  analyticsService.setUser(userId, properties);

export const clearUser = (): void => analyticsService.clearUser();

export const setEnabled = (enabled: boolean): void => analyticsService.setEnabled(enabled);

// Export the service for advanced usage
export default analyticsService;
