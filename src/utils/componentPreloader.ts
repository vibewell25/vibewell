import { ComponentType } from 'react';
import { useEffect, useCallback } from 'react';

interface PreloadConfig {
  component: () => Promise<{ default: ComponentType<any> }>;
  conditions: {
    route?: string;
    userAction?: string;
    timeOnPage?: number;
    scrollDepth?: number;
  };
}

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
        const parsed = JSON.parse(history);
        this.preloadedComponents = new Set(parsed);
      }
    }
  }

  private savePreloadHistory(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        this.PRELOAD_HISTORY_KEY,
        JSON.stringify(Array.from(this.preloadedComponents))
      );
    }
  }

  public registerComponent(name: string, config: PreloadConfig): void {
    this.preloadConfigs.set(name, config);
  }

  public async preloadComponent(name: string): Promise<void> {
    if (this.preloadedComponents.has(name)) return;

    const config = this.preloadConfigs.get(name);
    if (!config) return;

    try {
      await config.component();
      this.preloadedComponents.add(name);
      this.savePreloadHistory();
    } catch (error) {
      console.error(`Failed to preload component ${name}:`, error);
    }
  }

  public shouldPreload(name: string, currentConditions: Partial<PreloadConfig['conditions']>): boolean {
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
}

export const useComponentPreloader = (
  componentName: string,
  conditions: Partial<PreloadConfig['conditions']>
): void => {
  const preloader = ComponentPreloader.getInstance();

  const checkConditions = useCallback(() => {
    if (preloader.shouldPreload(componentName, conditions)) {
      preloader.preloadComponent(componentName);
    }
  }, [componentName, conditions]);

  useEffect(() => {
    const timeoutId = setTimeout(checkConditions, 1000);
    return () => clearTimeout(timeoutId);
  }, [checkConditions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        const scrollDepth = 
          (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
        checkConditions();
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [checkConditions]);
};

export default ComponentPreloader; 