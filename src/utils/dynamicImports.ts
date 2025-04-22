import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import type { FC } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { withPerformanceTracking } from './performanceMonitor';
import ComponentPreloader from './componentPreloader';

// Common loading component for all dynamic imports
const loadingComponent: FC = () => <LoadingSpinner />;

// Helper function to create dynamic imports with consistent configuration
const createDynamicComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: { 
    ssr?: boolean;
    preloadConfig?: {
      route?: string;
      userAction?: string;
      timeOnPage?: number;
      scrollDepth?: number;
    };
  } = {}
) => {
  const preloader = ComponentPreloader.getInstance();
  const componentName = importFunc.toString();

  if (options.preloadConfig) {
    preloader.registerComponent(componentName, {
      component: importFunc,
      conditions: options.preloadConfig
    });
  }

  const DynamicComponent = dynamic(importFunc, {
    loading: loadingComponent,
    ssr: options.ssr !== false,
  });

  return withPerformanceTracking(DynamicComponent, componentName);
};

// Large Component Bundles
export const ResourceDetailTemplate = createDynamicComponent<ComponentType<any>>(
  async () => {
    const mod = await import('@/components/resource-detail-template');
    return { default: mod.ResourceDetailTemplate };
  },
  {
    preloadConfig: {
      route: '/resources',
      scrollDepth: 50
    }
  }
);

export const EnhancedHeader = createDynamicComponent<ComponentType<any>>(
  async () => {
    const mod = await import('@/components/enhanced-header');
    return { default: mod.EnhancedHeader };
  }
);

export const ResourceReview = createDynamicComponent<ComponentType<any>>(
  async () => {
    const mod = await import('@/components/resource-review');
    return { default: mod.ResourceReview };
  },
  {
    preloadConfig: {
      route: '/resources',
      userAction: 'hover_resource'
    }
  }
);

export const HubSearch = createDynamicComponent<ComponentType<any>>(
  async () => {
    const mod = await import('@/components/hub-search');
    return { default: mod.HubSearch };
  }
);

// Event Management Feature Bundle
export const EventManagement = createDynamicComponent<ComponentType<any>>(
  async () => {
    const mod = await import('@/components/event-management');
    return { default: mod.EventManagement };
  },
  {
    preloadConfig: {
      route: '/events',
      timeOnPage: 5
    }
  }
);

export const EventOrganizerDashboard = createDynamicComponent<ComponentType<any>>(
  async () => {
    const mod = await import('@/components/event-organizer-dashboard');
    return { default: mod.EventOrganizerDashboard };
  },
  {
    preloadConfig: {
      route: '/events/manage',
      timeOnPage: 2
    }
  }
);

export const EventMaterialsAgenda = createDynamicComponent<ComponentType<any>>(
  async () => {
    const mod = await import('@/components/event-materials-agenda');
    return { default: mod.EventMaterialsAgenda };
  },
  {
    preloadConfig: {
      route: '/events/manage',
      userAction: 'view_materials'
    }
  }
);

export const EventAnalytics = createDynamicComponent<ComponentType<any>>(
  async () => {
    const mod = await import('@/components/event-analytics');
    return { default: mod.EventAnalytics };
  },
  {
    preloadConfig: {
      route: '/events/manage',
      userAction: 'view_analytics'
    }
  }
);

// Authentication Features
export const WebAuthnAuth = createDynamicComponent<ComponentType<any>>(
  async () => {
    const mod = await import('@/components/WebAuthnAuth');
    return { default: mod.WebAuthnAuth };
  }
);

export const WebAuthnButton = createDynamicComponent<ComponentType<any>>(
  async () => {
    const mod = await import('@/components/WebAuthnButton');
    return { default: mod.WebAuthnButton };
  }
);

// Specialized Features (Client-side only)
export const VirtualTryOn = createDynamicComponent<ComponentType<any>>(
  async () => {
    const mod = await import('@/components/virtual-try-on');
    return { default: mod.VirtualTryOn };
  },
  { 
    ssr: false,
    preloadConfig: {
      route: '/try-on',
      timeOnPage: 3
    }
  }
);

export const ARFeatures = createDynamicComponent<ComponentType<any>>(
  async () => {
    const mod = await import('@/components/ar');
    return { default: mod.ARFeatures };
  },
  { 
    ssr: false,
    preloadConfig: {
      route: '/ar-experience',
      timeOnPage: 2
    }
  }
); 