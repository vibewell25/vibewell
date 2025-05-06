import { ComponentType } from 'react';
import { PreloadConfig, logger, safeJsonParse, safeJsonStringify } from './shared';

/**
 * Singleton class that manages component preloading
 */
class ComponentPreloader {
  private static instance: ComponentPreloader;
  private preloadConfigs: Map<string, PreloadConfig>;
  private preloadedComponents: Set<string>;
  private readonly PRELOAD_HISTORY_KEY = 'vibewell_preload_history';

  private constructor() {
    this.preloadConfigs = new Map();
    this.preloadedComponents = new Set();
    this.loadPreloadHistory();
  }

  public static getInstance(): ComponentPreloader {
    if (!ComponentPreloader.instance) {
      ComponentPreloader.instance = new ComponentPreloader();
    }
    return ComponentPreloader.instance;
  }

  private loadPreloadHistory(): void {
    if (typeof window !== 'undefined') {
      const history = localStorage.getItem(this.PRELOAD_HISTORY_KEY);
      if (history) {
        const parsed = safeJsonParse<string[]>(history, []);
        this.preloadedComponents = new Set(parsed);
      }
    }
  }

  private savePreloadHistory(): void {
    if (typeof window !== 'undefined') {
      const historyData = Array.from(this.preloadedComponents);
      localStorage.setItem(
        this.PRELOAD_HISTORY_KEY,
        safeJsonStringify(historyData)
      );
    }
  }

  /**
   * Register a component for potential preloading
   */
  public registerComponent(name: string, config: PreloadConfig): void {
    this.preloadConfigs.set(name, config);
  }

  /**
   * Preload a component by name
   */
  public async preloadComponent(name: string): Promise<void> {
    if (this.preloadedComponents.has(name)) return;

    const config = this.preloadConfigs.get(name);
    if (!config) return;

    try {
      await config.component();
      this.preloadedComponents.add(name);
      this.savePreloadHistory();
      logger.debug(`Component ${name} preloaded successfully`);
    } catch (error) {
      logger.error(`Failed to preload component ${name}:`, error);
    }
  }

  /**
   * Check if a component should be preloaded based on conditions
   */
  public shouldPreload(
    name: string,
    currentConditions: Partial<PreloadConfig['conditions']>
  ): boolean {
    const config = this.preloadConfigs.get(name);
    if (!config || this.preloadedComponents.has(name)) return false;

    const { route, userAction, timeOnPage, scrollDepth } = config.conditions;

    return (
      (!route || route === currentConditions.route) &&
      (!userAction || userAction === currentConditions.userAction) &&
      (!timeOnPage || (currentConditions.timeOnPage || 0) >= timeOnPage) &&
      (!scrollDepth || (currentConditions.scrollDepth || 0) >= scrollDepth)
    );
  }

  /**
   * Get list of registered components
   */
  public getRegisteredComponents(): string[] {
    return Array.from(this.preloadConfigs.keys());
  }

  /**
   * Get list of preloaded components
   */
  public getPreloadedComponents(): string[] {
    return Array.from(this.preloadedComponents);
  }

  /**
   * Clear preload history
   */
  public clearPreloadHistory(): void {
    this.preloadedComponents.clear();
    this.savePreloadHistory();
  }
}

export default ComponentPreloader;
