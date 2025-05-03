# Component Documentation Template

This template provides a standardized format for documenting UI components in the VibeWell platform. Use this template when creating or updating component documentation to ensure consistency across the codebase.

## JSDoc Template

```tsx
/**
 * ComponentName Component
 * 
 * Description: A clear, concise description of what the component does and when to use it.
 * 
 * @component
 * 
 * @typedef ComponentNameProps
 * @param {PropType} propName - Description of what this prop does
 * @param {'option1'|'option2'|'option3'} enumProp - Description of enum prop with possible values
 * @param {(value: ValueType) => void} callbackProp - Description of callback function
 * @param {React.ReactNode} children - Description of children content
 * 
 * @example
 * ```tsx
 * <ComponentName
 *   propName={value}
 *   enumProp="option1"
 *   callbackProp={(value) => console.log(value)}
 * >
 *   Children content
 * </ComponentName>
 * ```
 */
```

## Component Implementation Format

Components should follow this structure:

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

// Add JSDoc comment block here

export interface ComponentNameProps {
  // Define props with TypeScript types
  propName: PropType;
  enumProp?: 'option1' | 'option2' | 'option3';
  callbackProp?: (value: ValueType) => void;
  children?: React.ReactNode;
  className?: string;
}

export const ComponentName = React.forwardRef<HTMLElementType, ComponentNameProps>(({
  propName,
  enumProp = 'option1', // Set defaults here
  callbackProp,
  children,
  className = '',
  ...props
}, ref) => {
  // Component implementation

  return (
    <element
      ref={ref}
      className={cn(
        'base-classes',
        'variant-specific-classes',
        className
      )}
      {...props}
    >
      {children}
    </element>
  );
});

ComponentName.displayName = 'ComponentName';

export default ComponentName;
```

## Component Export Format

All components should be exported from the unified component library:

```tsx
// src/components/ui/index.ts
export * from './ComponentName';
```

## Required Documentation Sections

1. **Component Name**: The first line should be the component name followed by "Component".
2. **Description**: Explain what the component does, its purpose, and when to use it.
3. **Component Tag**: Include `@component` to mark it as a component.
4. **Props Definition**: Document the props interface with `@typedef`.
5. **Props Documentation**: Document each prop with `@param` tags.
6. **Example**: Provide at least one realistic usage example.

## Optional Documentation Sections

1. **See Also**: Reference related components with `@see`.
2. **Since**: Version when the component was introduced with `@since`.
3. **Deprecated**: If applicable, mark as deprecated with `@deprecated`.

## Component File Location

All standardized UI components should be placed in the following directory:

```
src/components/ui/ComponentName.tsx
```

## Component Testing Requirements

Each component should have corresponding test files:

```
src/components/ui/__tests__/ComponentName.test.tsx
```

Tests should cover:
1. Basic rendering
2. Prop variations
3. User interactions
4. Accessibility requirements

## Example Component Documentation

Here's a complete example for a Button component:

```tsx
/**
 * Button Component
 * 
 * Description: A customizable button component that supports different variants and sizes.
 * Used for triggering actions or navigation throughout the application.
 * 
 * @component
 * 
 * @typedef ButtonProps
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement>} props - All standard button HTML attributes
 * @param {'primary'|'secondary'|'outline'|'ghost'|'link'|'destructive'} variant - Visual style variant
 * @param {'sm'|'md'|'lg'} size - Button size
 * @param {boolean} isLoading - Whether to show a loading spinner
 * @param {boolean} fullWidth - Whether the button should take full width of parent
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} children - Button content
 * 
 * @example
 * ```tsx
 * <Button 
 *   variant="primary" 
 *   size="md" 
 *   onClick={() => console.log('Button clicked')}
 *   disabled={!isValid}
 * >
 *   Submit Form
 * </Button>
 * ```
 * 
 * @example
 * ```tsx
 * <Button 
 *   variant="destructive" 
 *   isLoading={isDeleting}
 *   onClick={handleDelete}
 * >
 *   {isDeleting ? 'Deleting...' : 'Delete Item'}
 * </Button>
 * ```
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled = false,
  children,
  ...props
}, ref) => {
  // Component implementation
  
  return (
    <button
      ref={ref}
      className={cn(
        // Base styles
        'font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
        
        // Variant styles
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
          'border border-gray-300 text-gray-700 hover:bg-gray-50': variant === 'outline',
          // other variants...
        },
        
        // Size styles
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-base': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
        },
        
        // Other modifiers
        fullWidth && 'w-full',
        
        // External classes
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
```

## Documentation Review Checklist

When reviewing component documentation, check that:

- [ ] Component follows the standardized naming and file location
- [ ] JSDoc includes all required sections
- [ ] Props are fully documented with types and descriptions
- [ ] Default values are specified where applicable
- [ ] Examples demonstrate realistic usage scenarios
- [ ] Component is properly exported from the UI component index
- [ ] Code follows project style guidelines