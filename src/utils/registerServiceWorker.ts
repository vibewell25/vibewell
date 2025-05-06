/**
 * Service Worker Registration Tracker
 * Handles service worker registration, updates, and event tracking
 */

import { EventEmitter } from 'events';

/**
 * ServiceWorker registration status enum
 */
export enum ServiceWorkerStatus {
  PENDING = 'pending',
  REGISTERED = 'registered',
  ERROR = 'error',
  UPDATED = 'updated'
}

/**
 * ServiceWorker event types
 */
export enum ServiceWorkerEvents {
  REGISTRATION_START = 'registration:start',
  REGISTRATION_SUCCESS = 'registration:success',
  REGISTRATION_ERROR = 'registration:error',
  UPDATE_FOUND = 'update:found',
  UPDATE_READY = 'update:ready',
  ACTIVATED = 'activated',
  CONTROLLING = 'controlling'
}

/**
 * ServiceWorker status info
 */
export interface ServiceWorkerStatusInfo {
  status: ServiceWorkerStatus;
  scriptURL?: string;
  registration?: ServiceWorkerRegistration;
  error?: Error | null;
}

/**
 * A singleton class that tracks ServiceWorker registration and status
 */
export class ServiceWorkerRegistrationTracker extends EventEmitter {
  private static instance: ServiceWorkerRegistrationTracker;
  private status: ServiceWorkerStatusInfo = {
    status: ServiceWorkerStatus.PENDING,
    error: null
  };
  private registrationPromise: Promise<ServiceWorkerRegistration> | null = null;
  private updatePromise: Promise<void> | null = null;

  constructor() {
    super();
    
    // Enforce singleton pattern
    if (ServiceWorkerRegistrationTracker.instance) {
      return ServiceWorkerRegistrationTracker.instance;
    }
    
    ServiceWorkerRegistrationTracker.instance = this;
    
    // Set max listeners to avoid memory leak warnings
    this.setMaxListeners(20);
  }

  /**
   * Get the current status of service worker registration
   */
  public getStatus(): ServiceWorkerStatusInfo {
    return { ...this.status };
  }

  /**
   * Register a service worker
   * Will only register once even if called multiple times
   */
  public register(scriptURL: string): Promise<ServiceWorkerRegistration> {
    // If already registering, return existing promise
    if (this.registrationPromise) {
      return this.registrationPromise;
    }
    
    // Start registration process
    this.emit(ServiceWorkerEvents.REGISTRATION_START, scriptURL);
    
    // Create and store promise
    this.registrationPromise = this.registerServiceWorker(scriptURL);
    return this.registrationPromise;
  }

  /**
   * Update the service worker if one is already registered
   */
  public update(): Promise<void> {
    // If already updating, return existing promise
    if (this.updatePromise) {
      return this.updatePromise;
    }
    
    // Make sure we have a registration
    if (!this.status.registration) {
      return Promise.reject(new Error('No service worker registration found'));
    }
    
    // Create and store promise
    this.updatePromise = this.updateServiceWorker(this.status.registration);
    return this.updatePromise;
  }

  /**
   * Notify that an update was found
   * Used to manually trigger update found event for testing
   */
  public notifyUpdateFound(registration: ServiceWorkerRegistration): void {
    this.emit(ServiceWorkerEvents.UPDATE_FOUND, registration);
  }

  /**
   * Add controller change listener
   */
  public onControllerChange(callback: () => void): void {
    if (!window.navigator.serviceWorker) {
      return;
    }
    
    window.navigator.serviceWorker.addEventListener('controllerchange', callback);
  }

  /**
   * Remove all event listeners
   */
  public removeAllEventListeners(): void {
    this.removeAllListeners();
    
    if (window.navigator.serviceWorker) {
      // No direct removeAllEventListeners, would need to track and remove individually
    }
  }

  /**
   * Internal method to register the service worker
   */
  private async registerServiceWorker(scriptURL: string): Promise<ServiceWorkerRegistration> {
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service workers are not supported in this browser');
      }

      // Register the service worker
      const registration = await navigator.serviceWorker.register(scriptURL);
      
      // Update status
      this.status = {
        status: ServiceWorkerStatus.REGISTERED,
        scriptURL,
        registration,
        error: null
      };
      
      // Emit success event
      this.emit(ServiceWorkerEvents.REGISTRATION_SUCCESS, registration);
      
      // Set up update listeners
      this.setupUpdateListeners(registration);
      
      return registration;
    } catch (error) {
      // Update status with error
      this.status = {
        status: ServiceWorkerStatus.ERROR,
        scriptURL,
        error: error as Error
      };
      
      // Emit error event
      this.emit(ServiceWorkerEvents.REGISTRATION_ERROR, error);
      
      // Reset promise to allow retrying
      this.registrationPromise = null;
      
      // Re-throw for caller
      throw error;
    }
  }

  /**
   * Internal method to update the service worker
   */
  private async updateServiceWorker(registration: ServiceWorkerRegistration): Promise<void> {
    try {
      await registration.update();
      
      // Reset promise to allow future updates
      this.updatePromise = null;
    } catch (error) {
      // Reset promise to allow retrying
      this.updatePromise = null;
      
      // Re-throw for caller
      throw error;
    }
  }

  /**
   * Set up listeners for service worker updates
   */
  private setupUpdateListeners(registration: ServiceWorkerRegistration): void {
    // Listen for new service workers
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (!newWorker) {
        return;
      }
      
      // Emit update found event
      this.emit(ServiceWorkerEvents.UPDATE_FOUND, registration);
      
      // Listen for state changes
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'activated') {
          this.emit(ServiceWorkerEvents.ACTIVATED, registration);
        }
      });
    });
  }
} 