# Accessibility Features Summary

## Key Components

- **AccessibilityProvider**: React context provider for accessibility preferences
- **useAccessibilityContext**: Hook to access accessibility settings anywhere in the app
- **AccessibilityStyleProvider**: Applies styles based on accessibility preferences
- **AccessibilityControls**: UI component for users to adjust settings

## Features Implemented

1. **High Contrast Mode**: Enhances visual contrast for better readability
2. **Large Text**: Increases font size throughout the application
3. **Reduce Motion**: Minimizes animations for users with motion sensitivity
4. **Keyboard Focus Visibility**: Enhances focus indicators for keyboard users
5. **Language Support**: Multiple languages including RTL (right-to-left) layouts

## Quick Implementation Example

```tsx
// Access accessibility settings in any component
import { useAccessibilityContext } from '@/contexts/AccessibilityContext';

function MyComponent() {
  const { preferences, setHighContrast } = useAccessibilityContext();

  return (
    <div>
      <p>High contrast is {preferences.highContrast ? 'enabled' : 'disabled'}</p>
      <button onClick={() => setHighContrast(!preferences.highContrast)}>
        Toggle high contrast
      </button>
    </div>
  );
}
```

## Testing Accessibility

1. Components can access accessibility preferences using the `useAccessibilityContext` hook
2. Preferences are stored in localStorage and applied consistently across the app
3. Run the app with different settings enabled to test compatibility
4. Test keyboard navigation with keyboard focus visibility enabled
5. Test RTL languages for proper layout mirroring

## Structure

```
src/
├── contexts/
│   └── AccessibilityContext.tsx  // Main context definition
├── hooks/
│   └── useAccessibility.ts       // Core hook implementation
├── components/
│   └── accessibility/
│       ├── AccessibilityControls.tsx  // UI controls
│       └── AccessibilityProvider.tsx  // Style provider
├── providers/
│   └── layout-providers.tsx      // App layout providers
└── styles/
    └── accessibility.css         // Accessibility styles
```

## Documentation

For more detailed information, see:

- [Comprehensive Accessibility Guide](./ACCESSIBILITY.md)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
