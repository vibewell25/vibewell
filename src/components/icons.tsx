'use client';

// Import SVG component types from React
import type { SVGProps } from 'react';
import { Loader2 } from 'lucide-react';

// Import heroicons (using namespaces to avoid conflicts)
import * as OutlineIcons from '@heroicons/react/24/outline';
import * as SolidIcons from '@heroicons/react/24/solid';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

// Create a function to enhance heroicon components with size prop
const enhanceIconWithSize = (Icon: React.FC<SVGProps<SVGSVGElement>>) => {
  return ({ size, ...props }: IconProps) => (
    <Icon
      width={size || props.width || 24}
      height={size || props.height || 24}
      {...props}
    />
  );
};

// Enhance all outline icons
const enhancedOutlineIcons = Object.entries(OutlineIcons).reduce(
  (acc, [key, Icon]) => ({
    ...acc,
    [key]: enhanceIconWithSize(Icon as React.FC<SVGProps<SVGSVGElement>>),
  }),
  {} as Record<string, React.FC<IconProps>>
);

// Enhance all solid icons and rename them with "Solid" suffix
const enhancedSolidIcons = Object.entries(SolidIcons).reduce(
  (acc, [key, Icon]) => ({
    ...acc,
    [`${key.replace('Icon', '')}Solid`]: enhanceIconWithSize(Icon as React.FC<SVGProps<SVGSVGElement>>),
  }),
  {} as Record<string, React.FC<IconProps>>
);

export const Icons = {
  // Export enhanced heroicons for use throughout the app
  // Outline variants
  ...enhancedOutlineIcons,
  
  // Solid variants with Solid suffix
  ...enhancedSolidIcons,
  
  // Loading spinner
  spinner: Loader2,
  
  // Authentication icons
  google: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  ),
  
  facebook: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  
  apple: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.71-.61-2.64-.46-3.84.39-1.31.95-1.01 1.27-.84 1.27.17 0 .71-.17 1.27-.61.56-.44 1.12-.78 1.78-.78.66 0 1.12.34 1.78.78.66.44 1.12.61 1.27.61.17 0 .47-.32-.84-1.27-.66-.44-1.12-.78-1.78-.78-.66 0-1.12.34-1.78.78-.56.44-1.1.61-1.27.61-.17 0-.47-.32.84-1.27 1.2-.85 2.13-1 3.84-.39 1.03.45 2.1.6 3.08-.35.98-.95.98-1.27.98-1.27s0-.32-.98-1.27zM12.03 7.25c-.13-2.27 1.66-4.07 3.74-4.25.13 2.17-1.66 4.07-3.74 4.25zM18.29 9.13c-1.2.85-2.13 1-3.84.39-1.03-.45-2.1-.6-3.08.35-.98.95-.98 1.27-.98 1.27s0 .32.98 1.27c.98.95 2.05.8 3.08.35 1.71-.61 2.64-.46 3.84.39 1.31.95 1.01 1.27.84 1.27-.17 0-.71-.17-1.27-.61-.56-.44-1.12-.78-1.78-.78-.66 0-1.12.34-1.78.78-.56.44-1.12.61-1.27.61-.17 0-.47-.32.84-1.27z" />
    </svg>
  ),
  
  // Logo icon
  logo: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  
  // Generic UI icons
  arrowRight: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  
  chevronDown: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  
  chevronUp: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  ),
  
  // Theme icons
  sun: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  
  moon: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  
  system: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  
  // Notification icons
  bell: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  
  // Message icons
  chat: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  
  // User icon
  user: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  
  // Settings icon
  settings: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  
  // Close/X icon
  close: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  
  // Menu icon
  menu: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  
  // Calendar icon
  calendar: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  
  // Message icon (alternative to chat)
  message: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  
  // Star icon
  star: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  
  // Activity icon
  activity: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.size || 24}
      height={props.size || 24}
      {...props}
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
};

// Export individual icons for direct imports
export const Spinner = Icons.spinner;
export const Logo = Icons.logo;
export const ChevronDown = Icons.chevronDown;
export const ChevronUp = Icons.chevronUp;
export const ArrowRight = Icons.arrowRight;
export const SunIcon = Icons.sun;
export const MoonIcon = Icons.moon;
export const SystemIcon = Icons.system;
export const BellIcon = Icons.bell;
export const ChatIcon = Icons.chat;
export const UserIcon = Icons.user;
export const SettingsIcon = Icons.settings;
export const CloseIcon = Icons.close;
export const MenuIcon = Icons.menu;
export const CalendarIcon = Icons.calendar;
export const MessageIcon = Icons.message;
export const StarIcon = Icons.star;
export const ActivityIcon = Icons.activity;
