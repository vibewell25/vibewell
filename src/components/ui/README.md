# VibeWell Component System

This document provides guidelines for using the standardized base components in the VibeWell application. These base components serve as the foundation for creating consistent, accessible, and maintainable UI components throughout the application.

## Available Base Components

The following base components are available:

- **BaseInput**: A foundational input component for all form inputs
- **BaseButton**: A versatile button component with multiple variants
- **BaseCard**: A flexible card component for content containers
- **BaseModal**: An accessible modal dialog component

## Component Design Principles

All base components follow these key design principles:

1. **Composability**: Components are designed to be extended and composed into more specialized components.
2. **Accessibility**: Built with WCAG compliance in mind, including proper ARIA attributes and keyboard navigation.
3. **Customizability**: Extensive styling options via className props and variants.
4. **Consistency**: Common patterns and APIs across all components.
5. **TypeScript**: Fully typed with comprehensive interfaces.

## Using Base Components

### Direct Usage

You can use base components directly:

```tsx
import { BaseInput } from '@/components/ui/base-input';
import { BaseButton } from '@/components/ui/base-button';

function MyForm() {
  return (
    <form>
      <BaseInput 
        label="Email" 
        type="email" 
        placeholder="Enter your email"
        size="md"
        leftIcon={<MailIcon />}
      />
      <BaseButton 
        variant="primary" 
        size="md"
        isLoading={isSubmitting}
      >
        Submit
      </BaseButton>
    </form>
  );
}
```

### Creating Specialized Components

You can extend base components to create specialized ones:

```tsx
import { BaseInput, BaseInputProps } from '@/components/ui/base-input';

interface SearchInputProps extends BaseInputProps {
  onSearch: (value: string) => void;
}

export function SearchInput({ onSearch, ...props }: SearchInputProps) {
  return (
    <BaseInput
      type="search"
      placeholder="Search..."
      leftIcon={<SearchIcon />}
      wrapperClassName="w-full max-w-md"
      onChange={(e) => onSearch(e.target.value)}
      {...props}
    />
  );
}
```

## Component Properties

### Common Properties

All components share these common properties:

- `className`: For styling the main component
- `wrapperClassName`: For styling the wrapper element (if applicable)

### BaseInput

Key properties:

- `label`: Input label text
- `error`: Error message
- `leftIcon`: Icon to display at the left
- `rightIcon`: Icon to display at the right
- `size`: Size variant ('sm', 'md', 'lg')
- `variant`: Style variant ('default', 'ghost', 'outline')
- `fullWidth`: Whether the input should take full width

### BaseButton

Key properties:

- `variant`: Style variant ('default', 'destructive', 'outline', 'secondary', 'ghost', 'link')
- `size`: Size variant ('sm', 'md', 'lg', 'icon')
- `leftIcon`: Icon to display before text
- `rightIcon`: Icon to display after text
- `isLoading`: Whether to show loading spinner
- `loadingText`: Text to display while loading
- `fullWidth`: Whether the button should take full width
- `asChild`: Whether to render as child component (using Radix UI's Slot)

### BaseCard

Key properties:

- `variant`: Style variant ('default', 'outline', 'ghost', 'elevated')
- `size`: Size variant ('sm', 'md', 'lg', 'xl', 'full')
- `padding`: Padding size ('none', 'sm', 'md', 'lg')
- `rounded`: Border radius ('none', 'sm', 'md', 'lg', 'xl', 'full')
- `header`: Content for the card header
- `footer`: Content for the card footer
- `isHoverable`: Whether the card should have hover effects
- `isClickable`: Whether the card should look clickable
- `isCollapsible`: Whether the card can be collapsed
- `isCollapsed`: Whether the card is currently collapsed

### BaseModal

Key properties:

- `isOpen`: Whether the modal is visible
- `onClose`: Function to call when modal is closed
- `position`: Modal position ('center', 'top', 'bottom', 'left', 'right')
- `size`: Size variant ('sm', 'md', 'lg', 'xl', '2xl', 'full')
- `animation`: Animation style ('none', 'fade', 'zoom', 'slide')
- `title`: Modal title
- `description`: Modal description
- `footer`: Modal footer content
- `closeOnOutsideClick`: Whether clicking outside closes the modal
- `closeOnEsc`: Whether pressing ESC closes the modal
- `hideCloseButton`: Whether to hide the close button
- `preventScroll`: Whether to prevent scrolling the background

## Accessibility Features

The base components include these accessibility features:

- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader announcements
- Proper contrast ratios
- Appropriate label associations

## Best Practices

1. **Always provide labels** for form inputs (either through the `label` prop or with `aria-label`).
2. **Be consistent** with styling across related components.
3. **Use variants** instead of custom styles when possible.
4. **Include error states** for form controls.
5. **Test with keyboard navigation** to ensure accessibility.
6. **Use appropriate sizes** for touch targets on mobile.

## Examples

You can find examples of component usage in:

- `src/components/common/`: Common components that use base components
- `src/components/ui/`: Direct usage examples in the implementation of shadcn/ui components

## Adding New Base Components

When creating new base components, follow these guidelines:

1. Use the naming convention `Base[ComponentName].tsx`
2. Follow the same structure as existing base components
3. Implement accessibility features
4. Create comprehensive TypeScript interfaces
5. Document the component with JSDoc comments
6. Add the component to this documentation 