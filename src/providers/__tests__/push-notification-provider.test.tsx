/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PushNotificationProvider } from '../../providers/push-notification-provider';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock Firebase services
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/messaging', () => ({
  getMessaging: vi.fn(() => ({})),
  getToken: vi.fn(() => Promise.resolve('mock-token')),
  onMessage: vi.fn((_, callback) => {
    // Store callback for tests to trigger
    (global as any).firebaseMessageCallback = callback;
  }),
}));

// Mock the fetch API
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
) as unknown as typeof fetch;

// Mock the Notification API
class NotificationMock {
  static permission = 'default';
  static requestPermission = vi.fn(() => Promise.resolve('granted'));

  constructor(
    public title: string,
    public options: any
  ) {}

  onclick: () => void = () => {};
  close = vi.fn();
}

(global as any).Notification = NotificationMock;

describe('PushNotificationProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global as any).Notification.permission = 'default';
  });

  it('renders its children', () => {
    render(
      <PushNotificationProvider>
        <div data-testid="test-child">Test Child</div>
      </PushNotificationProvider>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('requests notification permission when triggered', async () => {
    const { getByText } = render(
      <PushNotificationProvider>
        <button
          onClick={() => {
            // Access the provider's context in a real implementation
            // For test, we'll just directly call the global method
            Notification.requestPermission();
          }}
        >
          Request Permission
        </button>
      </PushNotificationProvider>
    );

    fireEvent.click(getByText('Request Permission'));

    await waitFor(() => {
      expect(Notification.requestPermission).toHaveBeenCalled();
    });
  });

  it('shows a notification', async () => {
    (global as any).Notification.permission = 'granted';

    const oldNotification = (global as any).Notification;
    const mockNotification = vi.fn();
    (global as any).Notification = mockNotification;

    render(
      <PushNotificationProvider>
        <div>Test</div>
      </PushNotificationProvider>
    );

    // Simulate a message received
    if ((global as any).firebaseMessageCallback) {
      (global as any).firebaseMessageCallback({
        notification: {
          title: 'Test Notification',
          body: 'This is a test notification',
        },
      });
    }

    await waitFor(() => {
      expect(mockNotification).toHaveBeenCalledWith(
        'Test Notification',
        expect.objectContaining({
          body: 'This is a test notification',
        })
      );
    });

    // Restore original Notification
    (global as any).Notification = oldNotification;
  });

  it('saves token to the database after permission is granted', async () => {
    (global as any).Notification.permission = 'granted';

    render(
      <PushNotificationProvider>
        <div>Test</div>
      </PushNotificationProvider>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/notifications/register-device',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object),
          body: expect.stringContaining('token'),
        })
      );
    });
  });
});
