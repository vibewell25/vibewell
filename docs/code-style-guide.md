# Vibewell Code Style Guide

This guide establishes coding standards for the Vibewell project. Consistent code style improves readability, maintainability, and collaboration efficiency.

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
``` 