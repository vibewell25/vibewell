# Code Quality Fixes for VibeWell Project

This document summarizes the code quality improvements implemented to address various issues in the VibeWell project.

## Authentication Context Consolidation

### Problem
Multiple authentication context implementations existed in the codebase:
- `src/contexts/auth-context.tsx`
- `src/context/AuthContext.tsx`
- `mobile/src/contexts/AuthContext.tsx`

This led to code duplication, maintenance challenges, and inconsistent implementations.

### Solution
1. Created a unified authentication context:
   - `src/contexts/unified-auth-context.tsx`

2. Added the following improvements:
   - Combined features from all three implementations
   - Enhanced TypeScript type safety
   - Added comprehensive error handling
   - Added role-based access control
   - Added cross-platform support (web and mobile)
   - Added additional functionality (profile management, etc.)

3. Created backward compatibility wrappers:
   - Updated `src/contexts/auth-context.tsx` to forward to the unified context
   - Updated `src/context/AuthContext.tsx` to forward to the unified context
   - Added deprecation warnings in development mode

4. Provided migration documentation:
   - Created `src/contexts/README.md` with migration instructions
   - Included examples of new features and APIs

## TypeScript Error Fixes

### Problem
The codebase contained TypeScript errors, including:
- `@ts-nocheck` directive in `src/utils/error-handler.ts`
- Type definitions that might be incomplete or incorrect

### Solution
1. Improved `src/utils/error-handler.ts`:
   - Removed `@ts-nocheck` directive
   - Added proper TypeScript types
   - Fixed error handling type issues
   - Enhanced function return types
   - Improved error boundary component

## Standardized Base Components

### Problem
The codebase lacked standardized base components, leading to:
- Inconsistent UI implementations
- Code duplication across similar components
- Accessibility issues
- Maintenance challenges

### Solution
1. Created standardized base components:
   - `src/components/ui/base-input.tsx` (existing but enhanced)
   - `src/components/ui/base-button.tsx` (new)
   - `src/components/ui/base-card.tsx` (new)
   - `src/components/ui/base-modal.tsx` (new)

2. Added the following features to base components:
   - Consistent API patterns
   - Comprehensive TypeScript types
   - Accessibility features (ARIA attributes, keyboard support)
   - Customization options through variants and className props
   - Composability for creating specialized components

3. Created documentation:
   - `src/components/ui/README.md` with usage guidelines
   - JSDoc comments in the component files
   - Examples of extending base components

## Performance Optimizations

### Problem
The application had performance issues, particularly in 3D/AR components:
- Inefficient model loading without level-of-detail (LOD)
- High-resolution textures always used regardless of device capabilities
- Lack of asset preloading
- Excessive draw calls and render passes
- Insufficient mobile and battery optimization

### Solution
1. Created optimized 3D components:
   - `src/components/ar/OptimizedModelLoader.tsx` for efficient model loading
   - `src/components/ar/AdaptiveARViewer.tsx` for device-aware rendering

2. Added device capability detection:
   - `src/utils/device-capability.ts` for detailed device information
   - `src/hooks/useDeviceCapabilities.tsx` with React hooks for adaptive rendering

3. Implemented progressive loading:
   - Automatic quality level selection based on device capabilities
   - Initial loading with low quality models, progressively upgrading
   - Battery-aware rendering to preserve power on mobile devices

4. Enhanced resource monitoring:
   - Better utilization of the ARResourceMonitor component
   - Added performance metrics and adaptive quality
   - Added automatic quality downgrading when performance issues detected

## Future Recommendations

1. **Component Migration**
   - Gradually migrate existing components to use the new base components
   - Prioritize high-use components for migration

2. **Authentication Consolidation**
   - Complete migration from old auth contexts to the unified one
   - Set a deadline for removing the backward compatibility wrappers

3. **TypeScript Improvements**
   - Continue improving type safety throughout the codebase
   - Consider enabling stricter TypeScript checks in `tsconfig.json`

4. **Documentation**
   - Expand component documentation with more examples
   - Add visual examples of component variants
   - Create a component storybook for testing and documentation

5. **Bundle Optimization**
   - Implement route-based code splitting 
   - Tree-shake Three.js to reduce bundle size
   - Optimize webpack configuration for better chunking

6. **Mobile Improvements**
   - Increase touch target sizes for better accessibility
   - Add more power-aware features
   - Implement full responsive design # Code Consolidation Plan

## Overview
This document outlines the approach for consolidating duplicate code implementations in the VibeWell project, with a focus on auth hooks, form validation utilities, and other core functionality.

## 1. Auth Hook Consolidation

### Current State
We have multiple auth hook implementations:
- `src/hooks/useAuth.ts` (already marked as deprecated)
- `src/hooks/use-auth.ts`
- `src/hooks/unified-auth.ts`
- `src/hooks/use-unified-auth.ts` (target implementation)

### Consolidation Steps
1. ✅ Mark legacy hooks as deprecated (completed for `useAuth.ts`)
2. Ensure `use-unified-auth.ts` has complete functionality from all hooks
3. Update `use-auth.ts` and `unified-auth.ts` to re-export from `use-unified-auth.ts`
4. Create a script to identify and update imports in components

### Implementation Timeline
- Day 1: Complete deprecation warnings and re-exports
- Days 2-3: Run update script and manually verify components
- Day 4: Final testing of auth functionality

## 2. Form Validation Consolidation

### Current State
Form validation logic exists in:
- `src/utils/form-validation.ts` (target implementation)
- Custom validation in various component files

### Consolidation Steps
1. Review `form-validation.ts` and ensure it covers all use cases
2. Add any missing validation patterns from component implementations
3. Create a migration guide for developers
4. Update components to use the centralized validation

### Implementation Timeline
- Day 1: Audit and enhance central validation utility
- Days 2-3: Update high-priority components
- Days 4-5: Update remaining components

## 3. API Types Consolidation

### Current State
API types are defined in:
- `src/types/api.ts` (target implementation)
- Scattered across service files

### Consolidation Steps
1. Review all API-related types across the codebase
2. Consolidate into the central types file
3. Update imports across the codebase

### Implementation Timeline
- Day 1: Complete type consolidation
- Day 2: Update imports and verify type usage

## 4. Migration Script

```javascript
// scripts/update-imports.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define import mappings: old import → new import
const importMappings = [
  {
    pattern: /import.*from ['"]@\/hooks\/useAuth['"]|import.*from ['"]@\/hooks\/use-auth['"]|import.*from ['"]@\/hooks\/unified-auth['"]/g,
    replacement: match => match.replace(/useAuth|use-auth|unified-auth/, 'use-unified-auth')
  },
  {
    pattern: /import.*from ['"]@\/lib\/auth['"]/g,
    replacement: match => match.replace('@/lib/auth', '@/hooks/use-unified-auth')
  },
  // Add more mappings as needed
];

function updateImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    
    importMappings.forEach(({ pattern, replacement }) => {
      updatedContent = updatedContent.replace(pattern, replacement);
    });
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated imports in ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Find all TypeScript/JavaScript files
const findFiles = () => {
  const result = execSync(
    `find src -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"`,
    { encoding: 'utf8' }
  );
  return result.split('\n').filter(Boolean);
};

// Main function
function main() {
  const files = findFiles();
  let updatedCount = 0;
  
  files.forEach(file => {
    const updated = updateImports(file);
    if (updated) updatedCount++;
  });
  
  console.log(`\nImport consolidation complete: Updated ${updatedCount} files.`);
}

main();
```

## 5. Monitoring Progress

We will track consolidation progress in the following table:

| Area | Status | Components Updated | Total Components | Progress |
|------|--------|-------------------|-----------------|----------|
| Auth Hooks | In Progress | 1 | ~50 | 2% |
| Form Validation | Not Started | 0 | ~30 | 0% |
| API Types | Not Started | 0 | ~20 | 0% |

## 6. Final Verification

Once consolidation is complete, we will:
1. Run the full test suite
2. Verify application functionality
3. Run TypeScript type checking
4. Create proper documentation for all standardized utilities # VibeWell Code Consolidation

This document tracks the progress of code consolidation efforts in the VibeWell platform to reduce redundancy and improve maintainability.

## Completed Consolidations

### Rate Limiter Consolidation

**Status: Completed**

Previously, rate limiter implementations were scattered across multiple files:

- `src/lib/api/rate-limiter.ts`
- `src/lib/websocket/rate-limiter.ts`
- `src/lib/graphql/rate-limiter.ts`
- `src/lib/redis-rate-limiter.ts`

All functionality has been consolidated into a unified implementation:

- Core implementation: `src/lib/rate-limiter.ts`
- Modular design: `src/lib/rate-limiter/` directory

**Benefits:**

- Reduced code duplication
- Unified configuration and behavior
- Simplified maintenance
- Better Redis integration
- Improved error handling and logging

**Migration:**

Backward compatibility modules have been provided to ensure a smooth transition. Users can run:

```bash
npm run migrate:rate-limiter:guided
```

For more details, see [Rate Limiter Migration Guide](./rate-limiter-migration.md).

### Redis Client Implementation

**Status: Completed**

After investigation, it was determined that there's already a single Redis client implementation in:

- `src/lib/redis-client.ts`

This implementation provides:
- Production Redis connections with ioredis
- In-memory mock implementation for development
- Support for rate limiting events and metrics
- IP blocking functionality

Redis metrics functionality exists in:
- `src/lib/redis/redis-metrics.ts`

The metrics module correctly uses the centralized Redis client implementation.

**No migration needed.**

### Cache Consolidation

**Status: Completed**

Previously, cache implementations were scattered in different files:

- `src/lib/api/cache.ts`
- `src/lib/ar/cache.ts`

All functionality has been consolidated into a unified cache system:

- Core implementation: `src/lib/cache/index.ts`
- API Cache: `src/lib/cache/api-cache.ts` for HTTP responses
- AR Model Cache: `src/lib/cache/ar-cache.ts` for 3D models

The old files now act as backward compatibility modules that re-export from the consolidated implementation.

**Benefits:**

- Unified caching interface
- Specialized implementations for different caching needs
- Simplified imports with a single entry point
- Cache-specific optimizations preserved

**No migration needed as backward compatibility is already in place.**

### Accessibility Components

**Status: Completed**

After investigation, it was determined that accessibility components are already properly consolidated in the UI components library:

- Core components: `src/components/ui/accessible-dialog.tsx`, `src/components/ui/accessible-icon.tsx`, etc.
- Consolidated export module: `src/components/ui/accessibility.tsx`

The components follow best practices:
- Proper focus management
- Appropriate ARIA attributes
- Screen reader support
- Keyboard navigation

The `accessibility.tsx` file provides a convenient re-export of all accessibility components, making them easy to import.

**No migration needed.**

### Icon Files

**Status: Completed**

After investigation, it was determined that there's only one icons file in the codebase:

- `src/components/ui/icons.tsx`

This file provides a centralized collection of icon components that are used throughout the application. 

The icons follow best practices:
- Consistent API
- Proper accessibility support
- SVG-based for scalability
- Proper React typings

**No consolidation needed.**

## Remaining Tasks

Below are the remaining consolidation tasks in priority order:

1. **Test API Routes**
   - Consolidate test routes by category and functionality
   - Move test-only endpoints to a dedicated test environment

2. **Navigation Components**
   - Implement a configuration-driven navigation system
   - Replace multiple specific navigation components

## Best Practices for Future Development

To avoid redundancy in the future, follow these best practices:

1. **Use the Component Library**
   - Always check if a component already exists before creating a new one
   - Contribute to the shared component library instead of creating duplicates

2. **Follow the DRY Principle**
   - Don't Repeat Yourself
   - Extract shared logic into utilities or services

3. **Centralize Services**
   - Keep service implementations (caching, API clients, etc.) in a single location
   - Use adapters for specialized needs instead of creating separate implementations

4. **Documentation**
   - Document the location and purpose of shared resources
   - Keep a list of available services and components

5. **Code Reviews**
   - Specifically look for redundancy during code reviews
   - Suggest consolidation when duplicate logic is identified

## Monitoring Redundancy

To monitor and prevent code redundancy, we've established:

1. **Regular Codebase Audits**
   - Quarterly review of the codebase for redundancy
   - Automated code similarity detection

2. **Linting Rules**
   - Custom ESLint rules to detect potential duplication

3. **Dependency Analysis**
   - Regular dependency audits using tools like `depcheck`

4. **Performance Monitoring**
   - Track bundle size and load times
   - Identify performance bottlenecks caused by duplication # VibeWell Code Style Guide

This guide establishes coding standards for the VibeWell project. Consistent code style improves readability, maintainability, and collaboration efficiency.

## File Structure & Organization

### Component Directory Structure

Components should be organized according to their domain and function. Use the following structure:

```
src/
  components/
    ui/                    # Reusable UI components
      Button.tsx
      Input.tsx
    layout/                # Layout components
      Header.tsx
      Footer.tsx
    features/              # Feature-specific components
      auth/
        LoginForm.tsx
        SignupForm.tsx
    [domain]/              # Domain-specific components
      [ComponentName].tsx
```

### File Naming Conventions

- **Component Files**: Use PascalCase and match the component name
  - Example: `Button.tsx`

- **Utility Files**: Use camelCase
  - Example: `dateFormatter.ts`

- **Hook Files**: Use camelCase with `use` prefix
  - Example: `useAuth.ts`

- **Type Files**: Use PascalCase with `.types.ts` suffix
  - Example: `User.types.ts`

- **Context Files**: Use PascalCase with `Context` suffix
  - Example: `AuthContext.tsx`

- **Test Files**: Use the same name as the file being tested with `.test` or `.spec` suffix
  - Example: `Button.test.tsx`

## Component Structure

### Standard Component Template

Use the following template for creating components:

```tsx
/**
 * ComponentName Component
 * 
 * Description of the component's purpose and usage.
 * 
 * @component
 */

import React from 'react';

// External dependencies

// Internal dependencies

// Types
interface ComponentNameProps {
  // Props definition
}

export function ComponentName({ prop1, prop2 }: ComponentNameProps): JSX.Element {
  // Hooks

  // Derived state

  // Event handlers

  // Render
  return (
    <div>
      {/* Component content */}
    </div>
  );
}

export default ComponentName;
```

### Import Order

Imports should follow this order, with blank lines between each group:

1. React imports
2. External library imports
3. Internal absolute imports (from src/)
4. Internal relative imports (from ./)
5. Asset imports (images, CSS, etc.)

Example:

```tsx
import React, { useState, useEffect } from 'react';

import { format } from 'date-fns';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

import { validateInput } from './utils';
import { UserData } from './types';

import './styles.css';
```

## TypeScript Standards

### Type Definitions

- Prefer `interface` over `type` for object definitions
- Use PascalCase for type and interface names
- Use descriptive names that indicate the purpose

```tsx
// Good
interface UserProfileProps {
  user: User;
  isEditable: boolean;
}

// Avoid
type Props = {
  u: User;
  editable: boolean;
}
```

### Type Exports

- Export types from a central file (e.g., `types.ts`) or alongside the component
- Re-export types when needed to maintain a clear API

```tsx
// In Button.tsx
export interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
}

// In index.ts
export type { ButtonProps } from './Button';
```

## CSS & Styling

### General Guidelines

- Use Tailwind CSS as the primary styling approach
- Use CSS Modules for component-specific styles when needed
- Follow utility-first approach with Tailwind

### CSS Naming (for CSS Modules)

- Use kebab-case for class names
- Use BEM-like naming convention for complex components

```css
/* Button.module.css */
.button-container {}
.button-icon {}
.button--primary {}
.button--secondary {}
```

## Best Practices

### State Management

- Use React Context for global state
- Use local state (useState) for component-specific state
- Consider using React Query for server state

### Performance Optimization

- Use memoization (useMemo, useCallback) judiciously
- Use virtualization for long lists
- Follow React rendering optimization guidelines

### Error Handling

- Use error boundaries for handling component errors
- Implement consistent error state handling in forms
- Log errors properly

### Accessibility

- Follow WCAG 2.1 AA standards
- Include proper ARIA attributes
- Ensure keyboard navigation works
- Use semantic HTML elements

## Code Quality Tools

The project enforces these standards using:

- ESLint for code quality
- Prettier for code formatting
- TypeScript for type checking
- Husky for pre-commit hooks

Run these tools using:

```bash
# Lint check
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## Commit Guidelines

Follow these guidelines for commit messages:

- Use present tense ("Add feature" not "Added feature")
- Start with a verb
- Keep the first line under 72 characters
- Reference issue numbers when relevant

Format:
```
type(scope): description

[body]

[footer]
```

Types: feat, fix, docs, style, refactor, test, chore

Example:
```
feat(auth): add login validation

Implement client-side validation for the login form
Ensures email and password meet requirements

Fixes #123
``` # VibeWell Coding Standards

This document outlines the coding standards and best practices to be followed when developing the VibeWell platform. Adhering to these standards ensures maintainability, scalability, and clean code.

## Table of Contents

1. [Code Structure and Organization](#code-structure-and-organization)
2. [Coding Style and Consistency](#coding-style-and-consistency)
3. [React/React Native Guidelines](#reactreact-native-guidelines)
4. [CSS and Styling](#css-and-styling)
5. [Testing and TDD](#testing-and-tdd)
6. [Version Control](#version-control)

## Code Structure and Organization

### Modular and Scalable Structure

- Split code into small, reusable components
- Group components by functionality (auth, payment, booking, etc.)
- Each module or feature should be self-contained

### Folder Structure

```
src/
  ├── components/         # Reusable UI components
  │   ├── auth/           # Authentication components
  │   ├── payment/        # Payment-related components
  │   ├── booking/        # Booking-related components
  │   ├── common/         # Common/shared components
  │   └── layout/         # Layout components (header, footer, etc.)
  ├── services/           # Business logic and API calls
  │   ├── auth/           # Auth-related services
  │   ├── payment/        # Payment-related services
  │   ├── booking/        # Booking-related services
  │   └── api/            # API client and utilities
  ├── hooks/              # Custom React hooks
  ├── utils/              # Utility functions
  ├── pages/              # Page components (for Next.js)
  ├── assets/             # Images, fonts, etc.
  ├── styles/             # Global styles
  └── types/              # TypeScript type definitions
```

## Coding Style and Consistency

### TypeScript

- Use TypeScript for strong typing
- Enforce strict typing throughout the codebase
- Define interfaces for all props, state, and API responses
- Implement proper error handling with typed errors

### ESLint & Prettier

- Use the Airbnb JavaScript Style Guide
- Configure ESLint to enforce style and catch errors
- Use Prettier for consistent code formatting
- Run linting as part of pre-commit hooks

### Naming Conventions

- Use camelCase for variables and functions (e.g., `getUserData`)
- Use PascalCase for components and classes (e.g., `LoginForm`)
- Use UPPER_SNAKE_CASE for constants (e.g., `MAX_LOGIN_ATTEMPTS`)
- Use kebab-case for file names (e.g., `login-form.tsx`)
- Prefix boolean variables with "is", "has", or "should" (e.g., `isLoading`, `hasError`)

### Code Organization

- Import order: React, external libraries, internal modules, styles
- Group related functions and variables together
- Place helper functions after the main component function
- Keep files under 300 lines, splitting larger components when needed

## React/React Native Guidelines

### Functional Components & Hooks

- Use functional components exclusively
- Use React hooks for state management and lifecycle
- Create custom hooks for shared logic

```typescript
// Good example
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  // ...
  return { user, login, logout };
};

// Instead of
class AuthProvider extends Component {
  // ...
}
```

### State Management

- Use React Context for global state
- Use useState and useReducer for local component state
- Consider Redux only for complex state management needs
- Keep state as local as possible
- Derive values where possible instead of storing in state

### Component Best Practices

- Component names should be descriptive and clear
- Keep components focused on a single responsibility
- Implement Error Boundaries to catch and handle errors
- Use prop destructuring for cleaner code
- Use React.memo for expensive computations
- Avoid inline functions in renders when performance is a concern

```typescript
// Good example
const Button: React.FC<ButtonProps> = ({ onClick, children, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="btn"
  >
    {children}
  </button>
);

// Instead of
const Button = (props) => (
  <button
    type="button"
    onClick={props.onClick}
    disabled={props.disabled}
    className="btn"
  >
    {props.children}
  </button>
);
```

## CSS and Styling

### TailwindCSS

- Use TailwindCSS for utility-first styling
- Create reusable components for common design patterns
- Use the `@apply` directive sparingly, only for frequently reused styles
- Keep consistent spacing, sizing, and colors using design tokens

```jsx
// Good example
<button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
  Submit
</button>

// Instead of
<button className="submit-button">
  Submit
</button>
```

### BEM for Complex CSS

- When custom CSS is needed, follow BEM (Block Element Modifier) naming conventions
- Keep CSS scoped to components to avoid global conflicts
- Use CSS variables for theming and maintaining consistency

```css
/* Good example */
.card__header {
  /* styles */
}

.card__header--highlighted {
  /* styles */
}

/* Instead of */
.card-header {
  /* styles */
}

.highlighted-header {
  /* styles */
}
```

## Testing and TDD

### Test-Driven Development

- Write tests before implementing features
- Focus on behavior, not implementation details
- Test components in isolation with mocked dependencies

### Jest and React Testing Library

- Use Jest as the test runner and assertion library
- Use React Testing Library for component testing
- Test user interactions and outcomes, not implementation details
- Mock external dependencies for consistent tests

```typescript
// Good example
test('submits form with valid input', async () => {
  render(<LoginForm />);
  
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'test@example.com' }
  });
  
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'password123' }
  });
  
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
  
  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});
```

### Coverage Requirements

- Aim for at least a minimum of 80% test coverage
- 100% coverage for critical business logic and core components
- Include unit, integration, and E2E tests
- Write meaningful assertions that validate behavior

## Version Control

### Git Workflow

- Follow GitFlow branching strategy
- Use feature branches for development
- Rebase feature branches to keep history clean
- Create descriptive pull requests with appropriate labels

### Commit Messages

- Follow Conventional Commits format
- Begin with a type: feat, fix, docs, style, refactor, perf, test, chore
- Include a scope when relevant
- Write a descriptive message in imperative present tense

```
feat(auth): add multi-factor authentication support

Implement MFA with SMS and email verification options.

Closes #123
```

### Pull Requests

- Keep PRs focused on a single feature or fix
- Include screenshots for UI changes
- Link to relevant issues
- Add appropriate reviewers
- Ensure all CI checks pass before merging

By following these standards, we ensure a maintainable and scalable codebase for the VibeWell platform. This document should be regularly updated as our standards evolve. 