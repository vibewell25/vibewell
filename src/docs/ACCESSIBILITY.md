# Accessibility Features in VibeWell

VibeWell is committed to providing an accessible experience for all users. This document outlines the accessibility features implemented in our application and provides guidance for developers on maintaining and enhancing accessibility.

## Table of Contents

1. [Accessibility Context](#accessibility-context)
2. [Usage Examples](#usage-examples)
3. [Supported Features](#supported-features)
4. [Testing Accessibility](#testing-accessibility)
5. [Best Practices](#best-practices)
6. [Resources](#resources)

## Accessibility Context

The application uses a React Context API pattern to manage accessibility preferences across the application. The primary components involved are:

- `AccessibilityProvider`: Provides the context for accessibility preferences
- `useAccessibilityContext`: A hook to access accessibility preferences in any component
- `AccessibilityStyleProvider`: Applies accessibility styles to the document based on user preferences
- `AccessibilityControls`: UI component for users to adjust their accessibility preferences

### Implementation

The accessibility context is implemented in `src/contexts/AccessibilityContext.tsx` with a backing hook in `src/hooks/useAccessibility.ts`. This pattern allows for:

- Centralized management of accessibility preferences
- Persistent storage of user preferences (via localStorage)
- Type-safe access to preferences and methods

## Usage Examples

### Accessing Accessibility Preferences

You can access the accessibility context in any component using the `useAccessibilityContext` hook:

```tsx
import React from 'react';
import { useAccessibilityContext } from '../contexts/AccessibilityContext';

function MyComponent() {
  const { 
    preferences, 
    setHighContrast, 
    setLargeText,
    setReduceMotion 
  } = useAccessibilityContext();

  return (
    <div>
      <p>Current high contrast setting: {preferences.highContrast ? 'On' : 'Off'}</p>
      <button onClick={() => setHighContrast(!preferences.highContrast)}>
        Toggle High Contrast
      </button>
    </div>
  );
}
```

### Setting Up Providers

The providers are already set up in both page directories:

1. For `/pages` directory (Pages Router):
```tsx
import { AppProviders } from '../providers/app-providers';

function MyApp({ Component, pageProps }) {
  return (
    <AppProviders>
      <Component {...pageProps} />
    </AppProviders>
  );
}
```

2. For `/app` directory (App Router):
```tsx
// In layout.tsx
import { LayoutProviders } from '@/components/providers/layout-providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <LayoutProviders>
            {children}
          </LayoutProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Supported Features

### High Contrast Mode

Increases contrast for all UI elements, making content more readable for users with low vision or color perception difficulties.

- Implemented via CSS variables and class toggling
- Applied through the `high-contrast-theme` class

### Large Text

Increases text size throughout the application for users who need larger text to read comfortably.

- Implemented via font size multipliers
- Applied through the `large-text` class

### Reduced Motion

Minimizes or eliminates animations and transitions for users with vestibular disorders or motion sensitivity.

- Implemented via CSS properties
- Applied through the `reduce-motion` class

### Keyboard Focus Visibility

Enhances visibility of focused elements for keyboard navigation users.

- Implemented via focus styling
- Applied through the `keyboard-focus-visible` class

### Language and Directionality Support

Supports multiple languages including right-to-left (RTL) languages.

- Implemented via HTML dir attribute and language-specific CSS

## Testing Accessibility

### Automated Testing

We use the following tools for automated accessibility testing:

- [Jest](https://jestjs.io/) with [Testing Library](https://testing-library.com/) for component testing
- [Axe](https://www.deque.com/axe/) for accessibility validation
- [Cypress](https://www.cypress.io/) for end-to-end testing

Example test:

```tsx
import { render, screen } from '@testing-library/react';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';
import AccessibilityControls from '../components/accessibility/AccessibilityControls';

describe('AccessibilityControls', () => {
  it('renders accessibility controls with default values', () => {
    render(
      <AccessibilityProvider>
        <AccessibilityControls />
      </AccessibilityProvider>
    );
    
    expect(screen.getByText('High Contrast')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'High Contrast' })).not.toBeChecked();
  });
});
```

### Manual Testing

For manual testing, we recommend:

1. Testing with screen readers (NVDA, VoiceOver, JAWS)
2. Testing keyboard navigation
3. Testing with zoom (up to 200%)
4. Testing with different browser/OS text size settings
5. Testing with browser extensions like [Wave](https://wave.webaim.org/) or [aXe](https://www.deque.com/axe/)

## Best Practices

### Semantic HTML

Always use the most semantically appropriate HTML elements:

- Use heading elements (`<h1>` through `<h6>`) for hierarchical page structure
- Use `<button>` for interactive elements that don't navigate to a new page
- Use `<a>` for navigation links
- Use `<label>` for form controls

### Focus Management

Ensure proper focus management:

- All interactive elements should be focusable
- Focus order should be logical and follow the visual layout
- Custom components should implement keyboard interactions
- Focus should be trapped in modals and maintained across page transitions

### ARIA Attributes

Use ARIA attributes judiciously:

- Only when necessary to supplement HTML semantics
- Keep roles, states, and properties accurate and up-to-date
- Test with screen readers to ensure ARIA is working as expected

## Resources

- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [MDN Web Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)
- [Inclusive Components](https://inclusive-components.design/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/) 