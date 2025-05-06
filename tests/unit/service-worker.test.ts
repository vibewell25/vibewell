import { vi, describe, expect, test, beforeEach, afterEach } from 'vitest';
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
      state: 'activated',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
  }),
  controller: null
};

// Create mock for service worker
const mockServiceWorker = {
  state: 'installing',
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  postMessage: vi.fn()
};

// Create mock for registration return value
const mockRegistration = {
  update: vi.fn(),
  installing: null,
  waiting: null,
  active: {
    state: 'activated',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  scope: 'https://example.com/',
  updateViaCache: 'none' as const,
  navigationPreload: {} as any,
  onupdatefound: null,
  pushManager: {} as any,
  unregister: vi.fn(),
  showNotification: vi.fn(),
  getNotifications: vi.fn()
};

// Store singleton for testing
let singletonInstance: ServiceWorkerRegistrationTracker | null = null;

// Reset the singleton instance between test suites
const resetSingleton = () => {
  (ServiceWorkerRegistrationTracker as any).instance = undefined;
  singletonInstance = null;
};

// Create a tracker instance for tests
const createTracker = () => {
  // Create a new tracker if singleton is null
  if (!singletonInstance) {
    singletonInstance = new ServiceWorkerRegistrationTracker();
  }
  return singletonInstance;
};

describe('Service Worker Registration Tracker', () => {
  let originalWindow: any;
  let originalNavigator: any;
  
  beforeEach(() => {
    // Reset singleton for each test
    resetSingleton();
    
    // Save original window and navigator
    originalWindow = global.window;
    originalNavigator = global.navigator;
    
    // Create clean objects for each test
    const mockWindow = {
      navigator: {
        serviceWorker: mockServiceWorkerContainer
      }
    };
    
    const mockNav = {
      serviceWorker: mockServiceWorkerContainer
    };
    
    // Mock window and navigator for tests
    // @ts-ignore
    global.window = mockWindow;
    // @ts-ignore
    global.navigator = mockNav;
    
    // Reset mocks for each test
    vi.resetAllMocks();
    
    // Setup mock behavior
    mockServiceWorkerContainer.register.mockResolvedValue(mockRegistration as unknown as ServiceWorkerRegistration);
  });

  afterEach(() => {
    // Restore original window and navigator
    global.window = originalWindow;
    global.navigator = originalNavigator;
  });

  test('should maintain a singleton instance', () => {
    // Create first instance
    const tracker1 = new ServiceWorkerRegistrationTracker();
    
    // Create second instance - should return the same instance
    const tracker2 = new ServiceWorkerRegistrationTracker();
    
    // Both instances should be exactly the same object
    expect(tracker1).toBe(tracker2);
  });

  test('should only register service worker once even with multiple calls', async () => {
    const tracker = createTracker();
    
    // Register multiple times in parallel
    const promise1 = tracker.register('/sw.js');
    const promise2 = tracker.register('/sw.js');
    const promise3 = tracker.register('/sw.js');
    
    // Wait for all to complete
    await Promise.all([promise1, promise2, promise3]);
    
    // Should only call register once
    expect(mockServiceWorkerContainer.register).toHaveBeenCalledTimes(1);
    expect(mockServiceWorkerContainer.register).toHaveBeenCalledWith('/sw.js');
  });

  test('should properly track registration status', async () => {
    const tracker = createTracker();
    
    // Initially should be PENDING
    expect(tracker.getStatus().status).toBe(ServiceWorkerStatus.PENDING);
    
    // Register
    await tracker.register('/sw.js');
    
    // Should now be REGISTERED
    expect(tracker.getStatus().status).toBe(ServiceWorkerStatus.REGISTERED);
    expect(tracker.getStatus().registration).toBe(mockRegistration);
  });

  test('should emit events correctly', async () => {
    const tracker = createTracker();
    
    // Spy on emit method
    const emitSpy = vi.spyOn(tracker, 'emit');
    
    // Register service worker
    await tracker.register('/sw.js');
    
    // Verify event emissions
    expect(emitSpy).toHaveBeenCalledWith(ServiceWorkerEvents.REGISTRATION_START, '/sw.js');
    expect(emitSpy).toHaveBeenCalledWith(ServiceWorkerEvents.REGISTRATION_SUCCESS, mockRegistration);
    
    // Manually trigger an update found event
    tracker.notifyUpdateFound(mockRegistration as unknown as ServiceWorkerRegistration);
    
    // Should emit update found event
    expect(emitSpy).toHaveBeenCalledWith(ServiceWorkerEvents.UPDATE_FOUND, mockRegistration);
  });

  test('should handle registration failure correctly', async () => {
    const tracker = createTracker();
    
    // Setup mock to fail
    const mockError = new Error('Registration failed');
    mockServiceWorkerContainer.register.mockRejectedValueOnce(mockError);
    
    // Spy on emit method
    const emitSpy = vi.spyOn(tracker, 'emit');
    
    // Attempt registration and catch error
    await expect(tracker.register('/sw.js')).rejects.toThrow('Registration failed');
    
    // Status should be ERROR
    expect(tracker.getStatus().status).toBe(ServiceWorkerStatus.ERROR);
    
    // Error event should be emitted
    expect(emitSpy).toHaveBeenCalledWith(ServiceWorkerEvents.REGISTRATION_ERROR, mockError);
  });

  test('should handle multiple attempts after failure', async () => {
    const tracker = createTracker();
    
    // Setup mock to fail first time
    const mockError = new Error('Registration failed');
    mockServiceWorkerContainer.register.mockRejectedValueOnce(mockError);
    
    // Attempt registration and catch error
    await expect(tracker.register('/sw.js')).rejects.toThrow('Registration failed');
    
    // Reset mock to succeed for next attempt
    mockServiceWorkerContainer.register.mockResolvedValueOnce(mockRegistration as unknown as ServiceWorkerRegistration);
    
    // Try again
    const registration = await tracker.register('/sw.js');
    
    // Should succeed now
    expect(registration).toBe(mockRegistration);
    expect(tracker.getStatus().status).toBe(ServiceWorkerStatus.REGISTERED);
    
    // Should have called register twice (once for failure, once for success)
    expect(mockServiceWorkerContainer.register).toHaveBeenCalledTimes(2);
  });

  test('should prevent race conditions during update', async () => {
    const tracker = createTracker();
    
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
    const tracker = createTracker();
    
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
  });

  test('should wrap service worker event listeners', async () => {
    const tracker = createTracker();
    
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

  test('should handle activation and state change events', async () => {
    const tracker = createTracker();
    
    // Spy on emit method
    const emitSpy = vi.spyOn(tracker, 'emit');
    
    // Create a mock worker instance
    const newWorker = { ...mockServiceWorker, state: 'installing' };
    
    // Register service worker
    await tracker.register('/sw.js');
    
    // Simulate update found event by manually calling the setup method
    (mockRegistration as any).installing = newWorker;
    
    // Manually call the update listeners setup method with a custom registration
    (tracker as any).setupUpdateListeners(mockRegistration as unknown as ServiceWorkerRegistration);
    
    // Manually bind updatefound handler and call it
    mockRegistration.addEventListener.mock.calls.forEach(call => {
      if (call[0] === 'updatefound') {
        // Call the updatefound handler directly
        const updateFoundHandler = call[1];
        updateFoundHandler();
      }
    });
    
    // Manually bind statechange handler and call it
    newWorker.addEventListener.mock.calls.forEach(call => {
      if (call[0] === 'statechange') {
        // Set worker state to 'activated' and call the statechange handler
        newWorker.state = 'activated';
        const stateChangeHandler = call[1];
        stateChangeHandler();
      }
    });
    
    // Verify activated event was emitted
    expect(emitSpy).toHaveBeenCalledWith(ServiceWorkerEvents.ACTIVATED, mockRegistration);
  });
});
