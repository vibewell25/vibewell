import { logEvent } from './analytics';

// Define service worker status types
export enum ServiceWorkerStatus {
  PENDING = 'pending',
  REGISTERED = 'registered',
  UPDATED = 'updated',
  ERROR = 'error',
  UNSUPPORTED = 'unsupported',
// Event types for service worker status changes
export enum ServiceWorkerEvent {
  REGISTRATION_COMPLETE = 'registration_complete',
  UPDATE_FOUND = 'update_found',
  UPDATE_READY = 'update_ready',
  OFFLINE_READY = 'offline_ready',
  ERROR = 'error',
// Interface for registration options
interface RegistrationOptions {
  scope?: string;
  onRegistered?: (registration: ServiceWorkerRegistration) => void;
  onUpdateFound?: (registration: ServiceWorkerRegistration) => void;
  onUpdateReady?: (registration: ServiceWorkerRegistration) => void;
  onOfflineReady?: () => void;
  onError?: (error: Error) => void;
  immediatelyPromptForUpdate?: boolean;
// Service worker registration status
interface RegistrationStatus {
  status: ServiceWorkerStatus;
  error?: Error;
  registration?: ServiceWorkerRegistration;
  updateAvailable?: boolean;
/**
 * Singleton registration tracker to prevent multiple registrations
 */
class ServiceWorkerRegistrationTracker {
  private static instance: ServiceWorkerRegistrationTracker;
  private registrationPromise: Promise<ServiceWorkerRegistration> | null = null;
  private registrationStatus: RegistrationStatus = { status: ServiceWorkerStatus.PENDING };
  private eventTarget = new EventTarget();

  private constructor() {}

  public static getInstance(): ServiceWorkerRegistrationTracker {
    if (!ServiceWorkerRegistrationTracker.instance) {
      ServiceWorkerRegistrationTracker.instance = new ServiceWorkerRegistrationTracker();
return ServiceWorkerRegistrationTracker.instance;
/**
   * Get current registration status
   */
  public getStatus(): RegistrationStatus {
    return { ...this.registrationStatus };
/**
   * Register a listener for service worker events
   */
  public addEventListener(
    event: ServiceWorkerEvent,
    callback: EventListenerOrEventListenerObject,
  ): void {
    this.eventTarget.addEventListener(event, callback);
/**
   * Remove a listener for service worker events
   */
  public removeEventListener(
    event: ServiceWorkerEvent,
    callback: EventListenerOrEventListenerObject,
  ): void {
    this.eventTarget.removeEventListener(event, callback);
/**
   * Dispatch an event
   */
  private dispatchEvent(event: ServiceWorkerEvent, detail?: any): void {
    this.eventTarget.dispatchEvent(new CustomEvent(event, { detail }));
/**
   * Register or retrieve the service worker
   */
  public registerServiceWorker(
    scriptUrl: string,
    options: RegistrationOptions = {},
  ): Promise<ServiceWorkerRegistration> {
    // If registration is already in progress, return the existing promise
    if (this.registrationPromise) {
      return this.registrationPromise;
// Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      const error = new Error('Service workers are not supported in this browser');
      this.registrationStatus = {
        status: ServiceWorkerStatus.UNSUPPORTED,
        error,
if (options.onError) {
        options.onError(error);
return Promise.reject(error);
// Create a new registration promise
    this.registrationPromise = new Promise<ServiceWorkerRegistration>((resolve, reject) => {
      const { scope } = options;

      // Attempt to register the service worker
      navigator.serviceWorker
        .register(scriptUrl, { scope })
        .then((registration) => {
          // Update status
          this.registrationStatus = {
            status: ServiceWorkerStatus.REGISTERED,
            registration,
            updateAvailable: false,
// Set up update handling
          this.setupUpdateHandling(registration, options);

          // Handle installation completion
          if (registration.active) {
            this.handleInstalledServiceWorker(registration, options);
// Call registered callback
          if (options.onRegistered) {
            options.onRegistered(registration);
// Dispatch event
          this.dispatchEvent(ServiceWorkerEvent.REGISTRATION_COMPLETE, { registration });

          // Log the successful registration
          logEvent('service_worker_registered', {
            timestamp: Date.now(),
            scope: registration.scope,
resolve(registration);
)
        .catch((error) => {
          // Update status
          this.registrationStatus = {
            status: ServiceWorkerStatus.ERROR,
            error,
// Reset registration promise
          this.registrationPromise = null;

          // Call error callback
          if (options.onError) {
            options.onError(error);
// Dispatch event
          this.dispatchEvent(ServiceWorkerEvent.ERROR, { error });

          // Log the error
          logEvent('service_worker_error', {
            timestamp: Date.now(),
            error: error.message,
reject(error);
return this.registrationPromise;
/**
   * Handle updates for the registered service worker
   */
  private setupUpdateHandling(
    registration: ServiceWorkerRegistration,
    options: RegistrationOptions,
  ): void {
    // Handle updates
    registration.addEventListener('updatefound', () => {
      // Get the installing service worker
      const installingWorker = registration.installing;

      if (installingWorker) {
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available
              this.registrationStatus.updateAvailable = true;

              // Call update ready callback
              if (options.onUpdateReady) {
                options.onUpdateReady(registration);
// Dispatch event
              this.dispatchEvent(ServiceWorkerEvent.UPDATE_READY, { registration });

              // Log the update
              logEvent('service_worker_update_ready', {
                timestamp: Date.now(),
                scope: registration.scope,
// Prompt for update if configured
              if (options.immediatelyPromptForUpdate) {
                this.promptForUpdate();
else {
              // First-time install
              if (options.onOfflineReady) {
                options.onOfflineReady();
// Dispatch event
              this.dispatchEvent(ServiceWorkerEvent.OFFLINE_READY);

              // Log the installation
              logEvent('service_worker_offline_ready', {
                timestamp: Date.now(),
                scope: registration.scope,
// Call update found callback
      if (options.onUpdateFound) {
        options.onUpdateFound(registration);
// Dispatch event
      this.dispatchEvent(ServiceWorkerEvent.UPDATE_FOUND, { registration });

      // Log the update found
      logEvent('service_worker_update_found', {
        timestamp: Date.now(),
        scope: registration.scope,
/**
   * Handle the case where a service worker is already installed
   */
  private handleInstalledServiceWorker(
    registration: ServiceWorkerRegistration,
    options: RegistrationOptions,
  ): void {
    // Check for updates
    registration.update().catch((error) => {
      console.error('Error checking for service worker updates:', error);
// Log active service worker
    logEvent('service_worker_already_active', {
      timestamp: Date.now(),
      scope: registration.scope,
/**
   * Prompt the user to update the application
   */
  public promptForUpdate(): void {
    const registration = this.registrationStatus.registration;

    if (registration && this.registrationStatus.updateAvailable) {
      // Ask the user if they would like to reload to update
      if (window.confirm('A new version of this application is available. Reload to update?')) {
        // Check for waiting service worker
        if (registration.waiting) {
          // Send message to service worker to skip waiting
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
// Reload the page
        window.location.reload();
/**
   * Check for service worker updates
   */
  public checkForUpdates(): Promise<boolean> {
    const registration = this.registrationStatus.registration;

    if (!registration) {
      return Promise.resolve(false);
return registration
      .update()
      .then(() => this.registrationStatus.updateAvailable || false)
      .catch((error) => {
        console.error('Error checking for updates:', error);
        return false;
/**
   * Unregister all service workers
   */
  public unregisterAll(): Promise<boolean> {
    return navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        return Promise.all(registrations.map((registration) => registration.unregister())).then(
          (results) => results.every(Boolean),
)
      .catch((error) => {
        console.error('Error unregistering service workers:', error);
        return false;
)
      .finally(() => {
        // Reset registration state
        this.registrationPromise = null;
        this.registrationStatus = { status: ServiceWorkerStatus.PENDING };
/**
 * Initialize the service worker for the application
 * This is the main function exported and used by the app
 */
export function registerServiceWorker(
  scriptUrl = '/service-worker.js',
  options: RegistrationOptions = {},
): Promise<ServiceWorkerRegistration> {
  // Create and use the singleton tracker
  const tracker = ServiceWorkerRegistrationTracker.getInstance();
  return tracker.registerServiceWorker(scriptUrl, options);
/**
 * Check for service worker updates
 */
export function checkForServiceWorkerUpdates(): Promise<boolean> {
  return ServiceWorkerRegistrationTracker.getInstance().checkForUpdates();
/**
 * Prompt the user to update the application
 */
export function promptForServiceWorkerUpdate(): void {
  ServiceWorkerRegistrationTracker.getInstance().promptForUpdate();
/**
 * Unregister all service workers
 */
export function unregisterServiceWorkers(): Promise<boolean> {
  return ServiceWorkerRegistrationTracker.getInstance().unregisterAll();
/**
 * Get current service worker status
 */
export function getServiceWorkerStatus(): RegistrationStatus {
  return ServiceWorkerRegistrationTracker.getInstance().getStatus();
/**
 * Add a listener for service worker events
 */
export function addServiceWorkerEventListener(
  event: ServiceWorkerEvent,
  callback: EventListenerOrEventListenerObject,
): void {
  ServiceWorkerRegistrationTracker.getInstance().addEventListener(event, callback);
/**
 * Remove a listener for service worker events
 */
export function removeServiceWorkerEventListener(
  event: ServiceWorkerEvent,
  callback: EventListenerOrEventListenerObject,
): void {
  ServiceWorkerRegistrationTracker.getInstance().removeEventListener(event, callback);
// Default export with all utilities
export default {
  register: registerServiceWorker,
  checkForUpdates: checkForServiceWorkerUpdates,
  promptForUpdate: promptForServiceWorkerUpdate,
  unregister: unregisterServiceWorkers,
  getStatus: getServiceWorkerStatus,
  addEventListener: addServiceWorkerEventListener,
  removeEventListener: removeServiceWorkerEventListener,
  ServiceWorkerStatus,
  ServiceWorkerEvent,
// This is to be used in _app.js or similar entry point
export {};

// For TypeScript support
declare global {
  interface Window {
    workbox: any;
