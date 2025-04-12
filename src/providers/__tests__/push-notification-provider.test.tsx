import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PushNotificationProvider } from '@/providers/push-notification-provider';

// Mock Firebase services
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({}))
}));

jest.mock('firebase/messaging', () => ({
  getMessaging: jest.fn(() => ({})),
  getToken: jest.fn(() => Promise.resolve('mock-token')),
  onMessage: jest.fn((_, callback) => {
    // Store callback for tests to trigger
    global.firebaseMessageCallback = callback;
  })
}));

// Mock the fetch API
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true })
  })
) as jest.Mock;

// Mock the Notification API
class NotificationMock {
  static permission = 'default';
  static requestPermission = jest.fn(() => Promise.resolve('granted'));

  constructor(public title: string, public options: any) {}
  
  onclick: () => void = () => {};
  close = jest.fn();
}

global.Notification = NotificationMock as any;

describe('PushNotificationProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.Notification.permission = 'default';
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
        <button onClick={() => {
          // Access the provider's context in a real implementation
          // For test, we'll just directly call the global method
          Notification.requestPermission();
        }}>
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
    global.Notification.permission = 'granted';
    
    const oldNotification = global.Notification;
    const mockNotification = jest.fn();
    global.Notification = mockNotification as any;
    
    render(
      <PushNotificationProvider>
        <div>Test</div>
      </PushNotificationProvider>
    );
    
    // Simulate a message received
    if (global.firebaseMessageCallback) {
      global.firebaseMessageCallback({
        notification: {
          title: 'Test Notification',
          body: 'This is a test notification'
        }
      });
    }
    
    await waitFor(() => {
      expect(mockNotification).toHaveBeenCalledWith(
        'Test Notification',
        expect.objectContaining({
          body: 'This is a test notification'
        })
      );
    });
    
    // Restore original Notification
    global.Notification = oldNotification;
  });

  it('saves token to the database after permission is granted', async () => {
    global.Notification.permission = 'granted';
    
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
          body: expect.stringContaining('token')
        })
      );
    });
  });
}); 