import type { NextApiRequest as BaseNextApiRequest, NextApiResponse as BaseNextApiResponse } from 'next';

export enum ApiVersion {
  V1 = 'v1',
  V2 = 'v2',
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    version: ApiVersion;
    timestamp: string;
    [key: string]: string | number | boolean | null;
  };
}

// Navigation API Types
interface NavigatorConnection {
  effectiveType: '2g' | '3g' | '4g' | '5g';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface NavigatorMemory {
  deviceMemory: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface NavigatorBattery {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
}

// Extended Navigator Interface
interface ExtendedNavigator extends Navigator {
  connection: NavigatorConnection;
  deviceMemory: number;
  getBattery(): Promise<NavigatorBattery>;
  memory: NavigatorMemory;
}

// Payment Provider Types
interface PaymentProviderConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  webhookSecret?: string;
  options?: Record<string, unknown>;
}

interface PaymentError extends Error {
  code: string;
  decline_code?: string;
  payment_intent?: string;
  payment_method?: string;
  type: 'card_error' | 'validation_error' | 'api_error' | 'idempotency_error';
}

// Analytics Types
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
  userId?: string;
}

interface AnalyticsProvider {
  initialize(config: Record<string, unknown>): Promise<void>;
  trackEvent(event: AnalyticsEvent): Promise<void>;
  identify(userId: string, traits?: Record<string, unknown>): Promise<void>;
}

// Performance Monitoring Types
interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  timestamp: number;
}

interface ResourceTiming extends PerformanceResourceTiming {
  decodedBodySize: number;
  encodedBodySize: number;
  transferSize: number;
}

// WebXR Types
interface XRHandJoint {
  position: Float32Array;
  orientation: Float32Array;
  radius: number;
}

interface XRHand {
  joints: Map<string, XRHandJoint>;
}

interface XRFrame {
  getHands(): XRHand[];
}

// Export all types
export type {
  NavigatorConnection,
  NavigatorMemory,
  NavigatorBattery,
  ExtendedNavigator,
  PaymentProviderConfig,
  PaymentError,
  AnalyticsEvent,
  AnalyticsProvider,
  PerformanceMetric,
  ResourceTiming,
  XRHandJoint,
  XRHand,
  XRFrame
};

export interface NextApiRequest extends BaseNextApiRequest {
  user?: {
    id: string;
    email: string;
    roles?: string[];
  };
}

export interface NextApiResponse<T = any> extends BaseNextApiResponse<T> {
  // Add any custom response properties here
}
