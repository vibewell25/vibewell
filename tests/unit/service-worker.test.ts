// @ts-ignore - Add this to silence module import errors until vitest is properly installed
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  ServiceWorkerRegistrationTracker,
  ServiceWorkerStatus,
  ServiceWorkerEvents
} from '../../src/utils/registerServiceWorker';

// Create mock for navigator.serviceWorker
const mockServiceWorkerContainer = {
  register: vi.fn(),
  getRegistration: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  ready: Promise.resolve({
    update: vi.fn(),
    installing: null,
    waiting: null,
    active: {
      state: 'activated'
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })
};

// Create mock for registration return value
const mockRegistration = {
  update: vi.fn(),
  installing: null,
  waiting: null,
  active: {
    state: 'activated'
  },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

// Stub for window object
const mockWindow = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  navigator: {
    serviceWorker: mockServiceWorkerContainer
  }
};

describe('Service Worker Registration Tracker', () => {
  let originalWindow: any;
  let tracker: ServiceWorkerRegistrationTracker;
  
  beforeEach(() => {
    // Save original window
    originalWindow = global.window;
    
    // Mock window for tests
    // @ts-ignore
    global.window = mockWindow;
    
    // Reset mocks
    vi.resetAllMocks();
    
    // Configure mock registration success
    mockServiceWorkerContainer.register.mockResolvedValue(mockRegistration);
    mockServiceWorkerContainer.getRegistration.mockResolvedValue(mockRegistration);
    
    // Create tracker instance
    tracker = new ServiceWorkerRegistrationTracker();
  });
  
  afterEach(() => {
    // Restore original window
    global.window = originalWindow;
  });
  
  test('should maintain a singleton instance', () => {
    // Create multiple instances
    const tracker1 = new ServiceWorkerRegistrationTracker();
    const tracker2 = new ServiceWorkerRegistrationTracker();
    
    // All should reference the same instance
    expect(tracker1).toBe(tracker2);
    expect(tracker1).toBe(tracker);
  });
  
  test('should only register service worker once even with multiple calls', async () => {
    // Register multiple times in parallel
    const promise1 = tracker.register('/sw.js');
    const promise2 = tracker.register('/sw.js');
    const promise3 = tracker.register('/sw.js');
    
    // Wait for all to complete
    await Promise.all([promise1, promise2, promise3]);
    
    // Should only call register once
    expect(mockServiceWorkerContainer.register).toHaveBeenCalledTimes(1);
  });
  
  test('should properly track registration status', async () => {
    // Initially should be PENDING
    expect(tracker.getStatus().status).toBe(ServiceWorkerStatus.PENDING);
    
    // Register
    const registration = await tracker.register('/sw.js');
    
    // Should now be REGISTERED
    expect(tracker.getStatus().status).toBe(ServiceWorkerStatus.REGISTERED);
    expect(registration).toBe(mockRegistration);
  });
  
  test('should emit events correctly', async () => {
    // Setup event listeners
    const registrationStartListener = vi.fn();
    const registrationSuccessListener = vi.fn();
    const updateFoundListener = vi.fn();
    
    tracker.on(ServiceWorkerEvents.REGISTRATION_START, registrationStartListener);
    tracker.on(ServiceWorkerEvents.REGISTRATION_SUCCESS, registrationSuccessListener);
    tracker.on(ServiceWorkerEvents.UPDATE_FOUND, updateFoundListener);
    
    // Register service worker
    await tracker.register('/sw.js');
    
    // Simulate update found event
    tracker.notifyUpdateFound(mockRegistration);
    
    // Verify event emissions
    expect(registrationStartListener).toHaveBeenCalledTimes(1);
    expect(registrationSuccessListener).toHaveBeenCalledTimes(1);
    expect(updateFoundListener).toHaveBeenCalledTimes(1);
    expect(updateFoundListener).toHaveBeenCalledWith(mockRegistration);
  });
  
  test('should handle registration failure correctly', async () => {
    // Setup mock to fail
    const mockError = new Error('Registration failed');
    mockServiceWorkerContainer.register.mockRejectedValueOnce(mockError);
    
    // Setup error listener
    const errorListener = vi.fn();
    tracker.on(ServiceWorkerEvents.REGISTRATION_ERROR, errorListener);
    
    // Attempt registration and catch error
    try {
      await tracker.register('/sw.js');
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      // Verify the error
      expect(error).toBe(mockError);
    }
    
    // Status should be ERROR
    expect(tracker.getStatus().status).toBe(ServiceWorkerStatus.ERROR);
    
    // Error event should be emitted
    expect(errorListener).toHaveBeenCalledTimes(1);
    expect(errorListener).toHaveBeenCalledWith(mockError);
  });
  
  test('should handle multiple attempts after failure', async () => {
    // Setup mock to fail first time
    const mockError = new Error('Registration failed');
    mockServiceWorkerContainer.register.mockRejectedValueOnce(mockError);
    
    // Attempt registration and catch error
    try {
      await tracker.register('/sw.js');
    } catch (error) {
      // Expected to fail
    }
    
    // Reset mock to succeed
    mockServiceWorkerContainer.register.mockResolvedValueOnce(mockRegistration);
    
    // Try again
    const registration = await tracker.register('/sw.js');
    
    // Should succeed now
    expect(registration).toBe(mockRegistration);
    expect(tracker.getStatus().status).toBe(ServiceWorkerStatus.REGISTERED);
    
    // Should have called register twice (once for failure, once for success)
    expect(mockServiceWorkerContainer.register).toHaveBeenCalledTimes(2);
  });
  
  test('should prevent race conditions during update', async () => {
    // Register service worker
    await tracker.register('/sw.js');
    
    // Start multiple updates concurrently
    const update1 = tracker.update();
    const update2 = tracker.update();
    const update3 = tracker.update();
    
    // Wait for all updates
    await Promise.all([update1, update2, update3]);
    
    // Should only call update once
    expect(mockRegistration.update).toHaveBeenCalledTimes(1);
  });
  
  test('should expose status for external components to check', async () => {
    // Test initial status
    expect(tracker.getStatus().status).toBe(ServiceWorkerStatus.PENDING);
    
    // Register
    await tracker.register('/sw.js');
    
    // Test registered status
    expect(tracker.getStatus()).toEqual({
      status: ServiceWorkerStatus.REGISTERED,
      scriptURL: '/sw.js',
      registration: mockRegistration,
      error: null
    });
    
    // Simulate update found
    tracker.notifyUpdateFound(mockRegistration);
    
    // Status should still be REGISTERED
    expect(tracker.getStatus().status).toBe(ServiceWorkerStatus.REGISTERED);
  });
  
  test('should wrap service worker event listeners', async () => {
    // Register
    await tracker.register('/sw.js');
    
    // Add controller change listener
    const controllerChangeListener = vi.fn();
    tracker.onControllerChange(controllerChangeListener);
    
    // Verify event listener was added
    expect(mockServiceWorkerContainer.addEventListener).toHaveBeenCalledWith(
      'controllerchange',
      expect.any(Function)
    );
    
    // Cleanup listeners
    tracker.removeAllEventListeners();
  });
}); 