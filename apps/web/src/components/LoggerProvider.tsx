import React, { createContext, useContext } from 'react';
import logger from '@/utils/logger';
import type { LoggerContextType, LoggerProviderProps } from '@/utils/logger';

// Create Logger context
const LoggerContext = createContext<LoggerContextType>(logger);

/**
 * Logger Provider Component
 * 
 * Provides the application logger to React components via React context
 */
export const LoggerProvider: React.FC<LoggerProviderProps> = ({ children }) => {
  return <LoggerContext.Provider value={logger}>{children}</LoggerContext.Provider>;
/**
 * Custom hook to use the logger in components
 * 
 * @example
 * ```
 * const logger = useLogger();
 * logger.info('Component mounted');
 * ```
 */
export const useLogger = (): LoggerContextType => useContext(LoggerContext);

export default LoggerProvider; 