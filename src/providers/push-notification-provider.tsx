'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration - in production, these should be environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only in browser environment
let messaging: any = null;
let firebaseApp: any = null;

interface NotificationPermission {
  permission: 'default' | 'granted' | 'denied';
  token: string | null;
}

interface NotificationContextType {
  notificationPermission: NotificationPermission;
  requestPermission: () => Promise<void>;
  showNotification: (title: string, options?: NotificationOptions) => void;
  subscribeToTopic: (topic: string) => Promise<void>;
  unsubscribeFromTopic: (topic: string) => Promise<void>;
  lastNotification: any | null;
}

const NotificationContext = createContext<NotificationContextType>({
  notificationPermission: { permission: 'default', token: null },
  requestPermission: async () => {},
  showNotification: () => {},
  subscribeToTopic: async () => {},
  unsubscribeFromTopic: async () => {},
  lastNotification: null,
});

export const PushNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>({
    permission: 'default',
    token: null,
  });
  const [lastNotification, setLastNotification] = useState<any>(null);

  // Initialize Firebase and set up message handling
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      // Initialize Firebase services
      try {
        firebaseApp = initializeApp(firebaseConfig);
        messaging = getMessaging(firebaseApp);

        // Handle incoming messages when app is in foreground
        onMessage(messaging, payload => {
          console.log('Message received in foreground:', payload);
          setLastNotification(payload);

          // Show notification even when app is in foreground
          if (payload.notification) {
            showNotification(payload.notification.title || 'New notification', {
              body: payload.notification.body,
              icon: '/images/notification-icon.png',
              data: payload.data,
            });
          }
        });

        // Get current permission status
        const currentPermission = Notification.permission as 'default' | 'granted' | 'denied';
        setNotificationPermission(prev => ({ ...prev, permission: currentPermission }));

        // If already granted, get the token
        if (currentPermission === 'granted') {
          getTokenAndUpdate();
        }
      } catch (error) {
        console.error('Error initializing Firebase:', error);
      }
    }
  }, []);

  // Helper function to get token and update state
  const getTokenAndUpdate = async () => {
    try {
      if (!messaging) return;

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (token) {
        setNotificationPermission(prev => ({ ...prev, token }));
        // Store the token in your database to send notifications later
        await saveTokenToDatabase(token);
      } else {
        console.log('No registration token available.');
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
  };

  // Save token to your database
  const saveTokenToDatabase = async (token: string) => {
    try {
      // In a real app, you'd send this token to your backend
      await fetch('/api/notifications/register-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
    } catch (error) {
      console.error('Error saving token to database:', error);
    }
  };

  // Request notification permission
  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(prev => ({
          ...prev,
          permission: permission as 'default' | 'granted' | 'denied',
        }));

        if (permission === 'granted') {
          await getTokenAndUpdate();
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  };

  // Show a notification
  const showNotification = (title: string, options: NotificationOptions = {}) => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        const notification = new Notification(title, {
          icon: '/images/notification-icon.png',
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  };

  // Subscribe to a topic
  const subscribeToTopic = async (topic: string) => {
    try {
      if (!notificationPermission.token) return;

      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: notificationPermission.token,
          topic,
        }),
      });
    } catch (error) {
      console.error('Error subscribing to topic:', error);
    }
  };

  // Unsubscribe from a topic
  const unsubscribeFromTopic = async (topic: string) => {
    try {
      if (!notificationPermission.token) return;

      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: notificationPermission.token,
          topic,
        }),
      });
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notificationPermission,
        requestPermission,
        showNotification,
        subscribeToTopic,
        unsubscribeFromTopic,
        lastNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const usePushNotifications = () => useContext(NotificationContext);
