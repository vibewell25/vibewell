/**
 * Logger implementation for the application
 * This provides a consistent interface for logging across the app
 */

// Log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Define a type for loggable parameters
export type LogParam = 
  | string 
  | number 
  | boolean 
  | null 
  | undefined 
  | Error 
  | { toString(): string }
  | Record<string, unknown>;

// Logger interface
export interface Logger {
  debug: (message: string, ...args: LogParam[]) => void;
  info: (message: string, ...args: LogParam[]) => void;
  warn: (message: string, ...args: LogParam[]) => void;
  error: (message: string, ...args: LogParam[]) => void;
}

// Create the logger
export const logger: Logger = {
  debug: (message: string, ...args: LogParam[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: LogParam[]) => {
    console.info(`[INFO] ${message}`, ...args);
  },
  
  warn: (message: string, ...args: LogParam[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  
  error: (message: string, ...args: LogParam[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  }
};

// Export singleton instance
export default logger; 