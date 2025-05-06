/**
 * Shared utilities and types used across the application
 * This file contains types and basic utilities that don't have circular dependencies
 */

import { ComponentType } from 'react';

/**
 * Configuration for component preloading conditions
 */
export interface PreloadConfig {
  /**
   * Function to load the component
   */
  component: () => Promise<{ default: ComponentType<any> }>;
  
  /**
   * Conditions that determine when to preload
   */
  conditions: {
    /**
     * Route path that should trigger preloading
     */
    route?: string;
    
    /**
     * User action that should trigger preloading (e.g., 'hover', 'click')
     */
    userAction?: string;
    
    /**
     * Time spent on page in milliseconds before preloading
     */
    timeOnPage?: number;
    
    /**
     * Scroll depth percentage (0-100) that should trigger preloading
     */
    scrollDepth?: number;
  };
}

/**
 * Performance tracking interface
 */
export interface PerformanceTrackingOptions {
  /**
   * Name of the component or operation to track
   */
  name: string;
  
  /**
   * Whether to log performance metrics
   */
  log?: boolean;
  
  /**
   * Performance threshold in milliseconds
   */
  threshold?: number;
}

/**
 * Simple logger interface 
 */
export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[Debug] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    console.info(`[Info] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[Warning] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[Error] ${message}`, ...args);
  }
};

/**
 * Utility to safely handle large operations that could cause overflow
 */
export function safeOperation<T>(
  operation: () => T, 
  fallback: T, 
  errorMessage = 'Operation failed'
): T {
  try {
    return operation();
  } catch (error) {
    logger.error(errorMessage, error);
    return fallback;
  }
}

/**
 * Utility to safely parse JSON
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logger.error(`Failed to parse JSON: ${error}`);
    return fallback;
  }
}

/**
 * Utility to safely stringify JSON
 */
export function safeJsonStringify(value: any, fallback = '{}'): string {
  try {
    return JSON.stringify(value);
  } catch (error) {
    logger.error(`Failed to stringify value: ${error}`);
    return fallback;
  }
} 