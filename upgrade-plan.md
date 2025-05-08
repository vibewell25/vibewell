# Vibewell Dependency Upgrade Plan

This document outlines the plan for upgrading dependencies across the Vibewell project to fix security vulnerabilities and ensure long-term stability.

## Overall Strategy

1. Update in phases, starting with the most critical dependencies
2. Ensure workspace compatibility
3. Maintain proper peer dependency relationships
4. Update type definitions to match new library versions
5. Fix deprecated package usage

## Phase 1: Critical Framework Updates

### Root Project

```bash
# Update Next.js ecosystem
npm install next@latest @next/bundle-analyzer@latest eslint-config-next@latest

# Update React ecosystem
npm install react@latest react-dom@latest @types/react@latest @types/react-dom@latest
```

### Web App

```bash
# Update Next.js and React
cd apps/web
npm install next@latest react@latest react-dom@latest
npm install --save-dev @types/react@latest @types/react-dom@latest eslint-config-next@latest
```

### Mobile App

```bash
# Update Expo ecosystem
cd apps/mobile
npx expo install expo-router@latest
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npx expo install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context
```

### Server App

```bash
# Update Express and related packages
cd apps/server
npm install express@latest
npm install --save-dev @types/express@latest
```

## Phase 2: Replace Deprecated Packages

1. Replace `@types/winston` with Winston's built-in types
2. Replace `@types/react-native` with the types from React Native itself
3. Replace `@types/jwt-decode` with the latest JWT decode package
4. Replace `@types/helmet` with Helmet's built-in types
5. Update `@babel/plugin-proposal-*` plugins to their transform equivalents
6. Replace deprecated rimraf versions with v4+
7. Replace deprecated glob versions with v9+

## Phase 3: Library Updates

Update all UI and functional libraries:

1. Three.js ecosystem (`three`, `@react-three/fiber`, `@react-three/drei`)
2. Stripe integration (`@stripe/stripe-react-native`)
3. Data management libraries (`zustand`, `@reduxjs/toolkit`)
4. UI frameworks (`@chakra-ui/react`, `@mui/material`, `framer-motion`)
5. Testing libraries (`@testing-library/*`)

## Phase 4: Update TypeScript and Build Tools

1. Update TypeScript to latest version across all workspaces
2. Update build tools (Babel, ESLint, Prettier)
3. Update test frameworks (Jest, Vitest)

## Implementation Steps

For each phase:

1. Create a new Git branch
2. Make the updates in the specified order
3. Run tests to ensure functionality
4. Fix any compatibility issues
5. Merge to main branch when stable

## Long-term Maintenance

1. Set up automated dependency updates with Dependabot or Renovate
2. Implement pre-commit hooks to check for outdated dependencies
3. Schedule regular dependency updates (monthly)
4. Add CI checks for security vulnerabilities 