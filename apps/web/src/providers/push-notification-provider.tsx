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
const messaging: any = null;
const firebaseApp: any = null;

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

export {};

export {};
