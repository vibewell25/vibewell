/**
 * Unified Rate Limiter Service
 * 
 * This module provides a comprehensive rate limiting solution for the VibeWell platform.
 * It supports multiple protocols (HTTP API, GraphQL, WebSocket) and environments.
 */

// Export core types and interfaces
export * from './types';

// Export protocol-specific adapters
export * from './http';
export * from './graphql';
export * from './websocket';

// Export preset configurations
export * from './presets';

// Core implementation
export * from './core'; 