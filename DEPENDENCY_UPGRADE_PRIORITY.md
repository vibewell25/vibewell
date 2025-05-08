# Dependency Upgrade Priority List

This document categorizes the 69 outdated packages identified in the dependency report, helping teams prioritize which packages to update first based on risk, urgency, and impact.

## Priority Categories

- **P0**: Critical security vulnerabilities or breaking production functionality
- **P1**: High-risk packages with major version increases (breaking changes likely)
- **P2**: Medium-risk packages with significant changes
- **P3**: Lower-risk packages with minimal API changes

## P0: Immediate Action Required

| Package | Current | Target | Risk | Reason for Priority |
|---------|---------|--------|------|---------------------|
| *No P0 packages identified* | - | - | - | Current security audit shows no critical vulnerabilities |

## P1: High Priority (Core Frameworks)

| Package | Current | Target | Risk | Impact |
|---------|---------|--------|------|--------|
| next | 14.2.28 | 15.3.2 | **High** | Core web framework, major update with App Router changes |
| react | 18.3.1 | 19.1.0 | **High** | Foundation of all UI, major version with breaking changes |
| react-dom | 18.3.1 | 19.1.0 | **High** | Coupled with React core |
| @prisma/client | 4.16.2 | 6.7.0 | **High** | Database access layer with significant schema changes |
| prisma | 4.16.2 | 6.7.0 | **High** | Database tooling with migration API changes |
| expo-router | 3.5.24 | 5.0.6 | **High** | Mobile navigation foundation |
| @types/react | 18.3.21 | 19.1.3 | **High** | TypeScript definitions for React 19 |
| @types/react-dom | 18.3.7 | 19.1.3 | **High** | TypeScript definitions for React DOM 19 |

## P2: Medium Priority (Important Libraries)

| Package | Current | Target | Risk | Impact |
|---------|---------|--------|------|--------|
| typescript | 4.9.5 | 5.8.3 | **Medium** | Programming language - type compatibility impacts all code |
| eslint | 8.57.1 | 9.26.0 | **Medium** | Code quality tool - rule changes may require adjustments |
| express | 4.21.2 | 5.1.0 | **Medium** | Server framework with API changes |
| @react-three/fiber | 8.18.0 | 9.1.2 | **Medium** | 3D rendering library - central to 3D features |
| @react-three/drei | 9.122.0 | 10.0.7 | **Medium** | 3D utilities - used with Three.js |
| three | Various | Latest | **Medium** | Core 3D library - underlying all 3D features |
| @mui/material | 5.17.1 | 7.1.0 | **Medium** | UI component framework - used in multiple screens |
| zustand | 4.5.6 | 5.0.4 | **Medium** | State management - impacts data flow |
| framer-motion | 10.18.0 | 12.10.3 | **Medium** | Animation library - visual effects |
| tailwindcss | 3.4.17 | 4.1.5 | **Medium** | CSS utility framework - styling all components |
| @react-navigation/* | Various | Latest | **Medium** | Mobile navigation libraries |
| @sentry/* | 8.55.0 | 9.16.1 | **Medium** | Error tracking and monitoring |
| @auth0/nextjs-auth0 | 3.7.0 | 4.5.1 | **Medium** | Authentication - security-sensitive |

## P3: Normal Priority (Supporting Libraries)

| Package | Current | Target | Risk | Impact |
|---------|---------|--------|------|--------|
| eslint-config-next | 14.2.28 | 15.3.2 | **Low** | Coupled with Next.js update |
| @next/bundle-analyzer | 14.2.28 | 15.3.2 | **Low** | Build tool for Next.js |
| @types/node | 20.17.44 | 22.15.16 | **Low** | Node.js type definitions |
| @types/express | 4.17.21 | 5.0.1 | **Low** | Express type definitions |
| @testing-library/react | 14.3.1 | 16.3.0 | **Low** | Testing utility - not production code |
| @testing-library/jest-dom | Various | Latest | **Low** | Testing utility - not production code |
| @testing-library/user-event | Various | Latest | **Low** | Testing utility - not production code |
| @types/cors | 2.8.17 | 2.8.18 | **Low** | Minor type definition update |
| date-fns | 3.6.0 | 4.1.0 | **Low** | Date utility library |
| web-vitals | 3.5.2 | 5.0.0 | **Low** | Performance monitoring |
| @reduxjs/toolkit | Various | Latest | **Low** | State management utility |
| tailwind-merge | 2.6.0 | 3.2.0 | **Low** | Tailwind CSS utility |
| helmet | 6.2.0 | 8.1.0 | **Low** | HTTP security headers |
| patch-package | 6.5.1 | 8.0.0 | **Low** | Development utility |

## P4: Expo SDK (Mobile App Specific)

| Package | Current | Target | Risk | Impact |
|---------|---------|--------|------|--------|
| expo-av | 13.10.6 | 15.1.4 | **Medium** | Audio/video functionality |
| expo-camera | 14.1.3 | 16.1.6 | **Medium** | Camera functionality |
| expo-device | 5.9.4 | 7.1.4 | **Medium** | Device information |
| expo-document-picker | 11.10.1 | 13.1.5 | **Medium** | File selection |
| expo-image-picker | 14.7.1 | 16.1.4 | **Medium** | Image selection |
| expo-linear-gradient | 12.7.2 | 14.1.4 | **Low** | UI styling |
| expo-location | 16.5.5 | 18.1.4 | **Medium** | Location services |
| expo-media-library | 15.9.2 | 17.1.6 | **Medium** | Media management |
| expo-sharing | 11.10.0 | 13.1.5 | **Low** | Content sharing |
| expo-status-bar | 1.12.1 | 2.2.3 | **Low** | UI element |
| @react-native-async-storage/async-storage | 1.24.0 | 2.1.2 | **Medium** | Mobile data storage |
| react-native-safe-area-context | 4.14.1 | 5.4.0 | **Medium** | Mobile UI layout |
| react-native-screens | 3.37.0 | 4.10.0 | **Medium** | Screen management |
| react-native-svg | 13.14.1 | 15.11.2 | **Medium** | Vector graphics |
| @expo/metro-runtime | 3.2.3 | 5.0.4 | **Medium** | Build tooling |
| metro | 0.76.9 | 0.82.3 | **Low** | Build tooling |

## P5: Type Packages to Deprecate/Replace

| Package | Current | Target | Risk | Impact |
|---------|---------|--------|------|--------|
| @types/winston | Current | None | **Low** | Replace with Winston's built-in types |
| @types/jwt-decode | 3.1.0 | None | **Low** | Replace with jwt-decode's built-in types |
| @types/helmet | 4.0.0 | None | **Low** | Replace with Helmet's built-in types |

## Update Strategy

### Recommended Update Order

1. **First Wave** - Clean up deprecated type packages (P5)
   - Remove reliance on outdated @types packages
   - Install packages with built-in types

2. **Second Wave** - Core foundations (P1)
   - Next.js and React ecosystem
   - Database layer (Prisma)
   - Mobile navigation foundation

3. **Third Wave** - Important libraries (P2)
   - TypeScript and development tools
   - UI frameworks and state management

4. **Fourth Wave** - Mobile-specific updates (P4)
   - Update Expo SDK packages in compatible groups

5. **Final Wave** - Supporting libraries (P3)
   - Utilities and less critical packages

### Risk Mitigation Approach

For each wave:
1. Create a dedicated branch
2. Update packages in small, logical groups
3. Run automated tests after each group
4. Manually verify key functionality
5. Address any breaking changes before proceeding

## Estimated Effort

| Wave | Packages | Estimated Time | Complexity |
|------|----------|----------------|------------|
| First Wave (P5) | 3 | 0.5 days | Easy |
| Second Wave (P1) | 8 | 3-5 days | High |
| Third Wave (P2) | 13 | 3-4 days | Medium |
| Fourth Wave (P4) | 16 | 2-3 days | Medium |
| Final Wave (P3) | 29 | 1-2 days | Low |

**Total Estimated Time**: 9-14 days of dedicated engineering effort 