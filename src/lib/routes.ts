import { Route } from 'next';

export const routes = {
  wellness: {
    root: '/wellness',
    ar: '/wellness/ar',
    workouts: '/wellness/workouts',
    meditation: '/wellness/meditation',
    progress: '/wellness/progress',
    community: '/wellness/community',
  },
  legal: {
    privacy: '/privacy',
    terms: '/terms',
    contact: '/contact',
  },
} as const;

export type AppRoutes = typeof routes;
export type WellnessRoutes = typeof routes.wellness;
export type LegalRoutes = typeof routes.legal;

// Helper to ensure type safety for routes
export {};
