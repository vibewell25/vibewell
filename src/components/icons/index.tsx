'use client';

import * as OutlineIcons from '@heroicons/react/24/outline';
import * as SolidIcons from '@heroicons/react/24/solid';
import { Icons } from '../icons';

// Re-export the Icons object from the main icons component
export { Icons };

// Export individual icon types
export type { IconProps } from '../icons';

// Re-export individual icons for convenience
export const {
  // Authentication icons
  google,
  facebook,
  apple,
  
  // Logo icon
  logo,
  
  // UI icons
  spinner,
  arrowRight,
  chevronDown,
  chevronUp,
  
  // Theme icons
  sun,
  moon,
  system,
  
  // Notification icons
  bell,
  
  // Message icons
  chat,
  
  // User icon
  user,
  
  // Settings icon
  settings,
  
  // Close/X icon
  close,
  
  // Menu icon
  menu,
} = Icons;

// Export namespaced heroicons for convenience
export const Outline = OutlineIcons;
export const Solid = SolidIcons;
