# VibeWell

Beauty and wellness booking platform with enhanced mobile UX and PWA capabilities.

## Features

- Modern Next.js App Router architecture
- Mobile-optimized user interface
- Progressive Web App (PWA) with offline support
- Responsive design for all device types
- Dark mode support

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Mobile Features

- Enhanced button component with increased touch targets
- Mobile-specific navigation with safe area support
- PWA install experience with platform-specific prompts
- Mobile layout system with status bar handling
- Responsive design utilities

## PWA Capabilities

- Service worker with offline support
- Background sync for API requests
- Adaptive image loading based on network conditions
- Available offline pages list
- Push notification support

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons
- PWA with next-pwa

## Project Structure

- `app/` - App Router pages and layouts
- `pages/` - Compatibility layer for Pages Router (deprecated)
- `public/` - Static assets, icons, and PWA manifest
- `src/components/` - React components organized by category
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions and libraries
- `src/styles/` - Global styles and Tailwind configuration 