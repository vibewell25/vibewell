/**
 * Application Event Monitor
 * 
 * This utility provides a central event bus for tracking and debugging
 * events throughout the application. It also includes performance
 * measurement utilities and event filtering.
 */

import { IS_DEVELOPMENT } from './env';

/**
 * Event levels for categorizing events
 */
export enum EventLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Application event structure
 */
export interface AppEvent {
  /**
   * Event name/identifier
   */
  name: string;
  
  /**
   * Event level
   */
  level: EventLevel;
  
  /**
   * Event timestamp
   */
  timestamp: number;
  
  /**
   * Event source (component, module, etc.)
   */
  source: string;
  
  /**
   * Additional event data
   */
  data?: any;
  
  /**
   * Event duration in milliseconds (for performance tracking)
   */
  duration?: number;
  
  /**
   * Event tags for filtering
   */
  tags?: string[];
  
  /**
   * Related events (e.g., parent event ID)
   */
  relatedEvents?: string[];
  
  /**
   * Unique event ID
   */
  id: string;
  
  /**
   * User ID if applicable
   */
  userId?: string;
  
  /**
   * Session ID if applicable
   */
  sessionId?: string;
}

/**
 * Event listener function signature
 */
type EventListener = (event: AppEvent) => void;

/**
 * Options for registering an event listener
 */
interface ListenerOptions {
  /**
   * Filter events by level
   */
  level?: EventLevel | EventLevel[];
  
  /**
   * Filter events by tags
   */
  tags?: string[];
  
  /**
   * Filter events by source
   */
  source?: string | string[];
  
  /**
   * Filter events by name
   */
  eventName?: string | string[];
  
  /**
   * Only listen for events with a duration greater than this value
   */
  minDuration?: number;
}

/**
 * Event monitor singleton
 */
class EventMonitor {
  private static instance: EventMonitor;
  private listeners: Map<string, { callback: EventListener; options: ListenerOptions }>;
  private events: AppEvent[];
  private maxEvents: number;
  private sessionId: string;
  private userId: string | null;
  private isEnabled: boolean;
  
  /**
   * Create a new event monitor instance
   */
  private constructor() {
    this.listeners = new Map();
    this.events = [];
    this.maxEvents = 1000;
    this.sessionId = this.generateId();
    this.userId = null;
    // Enable by default in development, disable in production
    this.isEnabled = IS_DEVELOPMENT;
  }
  
  /**
   * Get the event monitor instance
   */
  public static getInstance(): EventMonitor {
    if (!EventMonitor.instance) {
      EventMonitor.instance = new EventMonitor();
    }
    return EventMonitor.instance;
  }
  
  /**
   * Enable or disable the event monitor
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
  
  /**
   * Set the user ID for tracking events
   */
  public setUserId(userId: string | null): void {
    this.userId = userId;
  }
  
  /**
   * Create a new session ID
   */
  public resetSession(): void {
    this.sessionId = this.generateId();
  }
  
  /**
   * Register an event listener
   * 
   * @param id Unique identifier for the listener
   * @param callback Callback function to be called when an event is emitted
   * @param options Options for filtering events
   */
  public on(id: string, callback: EventListener, options: ListenerOptions = {}): void {
    this.listeners.set(id, { callback, options });
  }
  
  /**
   * Remove an event listener
   * 
   * @param id Listener ID to remove
   */
  public off(id: string): void {
    this.listeners.delete(id);
  }
  
  /**
   * Emit an event
   * 
   * @param name Event name
   * @param level Event level
   * @param source Event source
   * @param data Additional event data
   * @param tags Event tags
   * @param relatedEvents Related event IDs
   * @returns The emitted event or undefined if disabled
   */
  public emit(
    name: string,
    level: EventLevel = EventLevel.INFO,
    source: string,
    data?: any,
    tags?: string[],
    relatedEvents?: string[]
  ): AppEvent | undefined {
    if (!this.isEnabled) return undefined;
    
    const event: AppEvent = {
      id: this.generateId(),
      name,
      level,
      timestamp: Date.now(),
      source,
      data,
      tags,
      relatedEvents,
      userId: this.userId ?? undefined,
      sessionId: this.sessionId,
    };
    
    this.addEvent(event);
    this.notifyListeners(event);
    
    return event;
  }
  
  /**
   * Start measuring performance for an event
   * 
   * @param name Event name
   * @param source Event source
   * @param tags Event tags
   * @returns Event ID for stopping measurement or undefined if disabled
   */
  public startMeasure(name: string, source: string, tags?: string[]): string | undefined {
    if (!this.isEnabled) return undefined;
    
    const eventId = this.generateId();
    
    // Store start time in performance API if available, otherwise use Date
    if (typeof performance !== 'undefined') {
      performance.mark(`${eventId}-start`);
    }
    
    // Create event with start time but don't emit yet
    const event: AppEvent = {
      id: eventId,
      name,
      level: EventLevel.DEBUG,
      timestamp: Date.now(),
      source,
      tags: tags ? [...tags, 'performance'] : ['performance'],
      userId: this.userId ?? undefined,
      sessionId: this.sessionId,
    };
    
    // Store event temporarily without notifying listeners
    this.events.push(event);
    
    return eventId;
  }
  
  /**
   * Stop measuring performance for an event
   * 
   * @param eventId Event ID from startMeasure
   * @param data Additional event data
   * @param level Event level
   * @returns The completed event with duration or undefined if disabled/not found
   */
  public stopMeasure(
    eventId: string | undefined,
    data?: any,
    level: EventLevel = EventLevel.DEBUG
  ): AppEvent | undefined {
    if (!this.isEnabled || !eventId) return undefined;
    
    // Find the event
    const eventIndex = this.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return undefined;
    
    const event = this.events[eventIndex];
    
    // Calculate duration using performance API if available
    let duration = 0;
    if (typeof performance !== 'undefined') {
      performance.mark(`${eventId}-end`);
      try {
        const measure = performance.measure(
          `${event.name}-duration`,
          `${eventId}-start`,
          `${eventId}-end`
        );
        duration = measure.duration;
        
        // Clean up marks
        performance.clearMarks(`${eventId}-start`);
        performance.clearMarks(`${eventId}-end`);
      } catch (error) {
        // Fallback if performance marks are not available
        duration = Date.now() - event.timestamp;
      }
    } else {
      duration = Date.now() - event.timestamp;
    }
    
    // Update event
    const updatedEvent: AppEvent = {
      ...event,
      level,
      data,
      duration,
    };
    
    // Replace event in array
    this.events[eventIndex] = updatedEvent;
    
    // Notify listeners
    this.notifyListeners(updatedEvent);
    
    return updatedEvent;
  }
  
  /**
   * Get all events
   * 
   * @param options Filter options
   * @returns Filtered events
   */
  public getEvents(options: ListenerOptions = {}): AppEvent[] {
    return this.filterEvents(this.events, options);
  }
  
  /**
   * Clear all events
   */
  public clearEvents(): void {
    this.events = [];
  }
  
  /**
   * Add an event to the events array
   * 
   * @param event Event to add
   */
  private addEvent(event: AppEvent): void {
    this.events.push(event);
    
    // Limit the number of stored events
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
  }
  
  /**
   * Notify all listeners about an event
   * 
   * @param event Event to notify about
   */
  private notifyListeners(event: AppEvent): void {
    this.listeners.forEach(({ callback, options }) => {
      if (this.shouldNotifyListener(event, options)) {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in event listener for ${event.name}:`, error);
        }
      }
    });
  }
  
  /**
   * Check if a listener should be notified about an event
   * 
   * @param event Event to check
   * @param options Listener options
   * @returns Whether the listener should be notified
   */
  private shouldNotifyListener(event: AppEvent, options: ListenerOptions): boolean {
    // Check level
    if (options.level) {
      const levels = Array.isArray(options.level) ? options.level : [options.level];
      if (!levels.includes(event.level)) return false;
    }
    
    // Check tags
    if (options.tags?.length) {
      if (!event.tags?.length) return false;
      if (!event.tags.some(eventTag => options.tags?.includes(eventTag))) return false;
    }
    
    // Check source
    if (options.source) {
      const sources = Array.isArray(options.source) ? options.source : [options.source];
      if (!sources.includes(event.source)) return false;
    }
    
    // Check event name
    if (options.eventName) {
      const names = Array.isArray(options.eventName) ? options.eventName : [options.eventName];
      if (!names.includes(event.name)) return false;
    }
    
    // Check duration
    if (options.minDuration !== undefined && (event.duration === undefined || event.duration < options.minDuration)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Filter events based on options
   * 
   * @param events Events to filter
   * @param options Filter options
   * @returns Filtered events
   */
  private filterEvents(events: AppEvent[], options: ListenerOptions): AppEvent[] {
    return events.filter(event => this.shouldNotifyListener(event, options));
  }
  
  /**
   * Generate a unique ID
   * 
   * @returns Unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

// Export singleton instance
export const eventMonitor = EventMonitor.getInstance();

// Convenience methods
export const emitEvent = (name: string, level: EventLevel, source: string, data?: any, tags?: string[]): AppEvent | undefined => 
  eventMonitor.emit(name, level, source, data, tags);

export const debugEvent = (name: string, source: string, data?: any, tags?: string[]): AppEvent | undefined => 
  eventMonitor.emit(name, EventLevel.DEBUG, source, data, tags);

export const infoEvent = (name: string, source: string, data?: any, tags?: string[]): AppEvent | undefined => 
  eventMonitor.emit(name, EventLevel.INFO, source, data, tags);

export const warningEvent = (name: string, source: string, data?: any, tags?: string[]): AppEvent | undefined => 
  eventMonitor.emit(name, EventLevel.WARNING, source, data, tags);

export const errorEvent = (name: string, source: string, data?: any, tags?: string[]): AppEvent | undefined => 
  eventMonitor.emit(name, EventLevel.ERROR, source, data, tags);

export const criticalEvent = (name: string, source: string, data?: any, tags?: string[]): AppEvent | undefined => 
  eventMonitor.emit(name, EventLevel.CRITICAL, source, data, tags);

export const measureEvent = async <T>(
  name: string, 
  source: string, 
  fn: () => Promise<T> | T,
  tags?: string[]
): Promise<T> => {
  const eventId = eventMonitor.startMeasure(name, source, tags);
  try {
    const result = await fn();
    eventMonitor.stopMeasure(eventId, { success: true });
    return result;
  } catch (error) {
    eventMonitor.stopMeasure(eventId, { error: error.message, stack: error.stack }, EventLevel.ERROR);
    throw error;
  }
}; 