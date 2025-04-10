# Accessibility Components

This document provides information about the accessibility components available in the Vibewell UI library and how to use them.

## Overview

Accessibility is a key part of the Vibewell platform. These components help make your application more accessible to users with disabilities, including those using screen readers, keyboard navigation, and other assistive technologies.

## Available Components

### SkipLink

Allows keyboard users to skip navigation and go directly to main content. This is especially helpful for users who navigate using a keyboard.

```tsx
import { SkipLink } from '@/components/ui/accessibility';

// Use at the top of your layout
<SkipLink targetId="main-content" />

// Make sure your main content has the matching ID
<main id="main-content">
  {/* Your content */}
</main>
```

### ScreenReaderOnly / VisuallyHidden

Text that's only visible to screen readers. Useful for providing additional context to screen reader users without cluttering the visual interface.

```tsx
import { ScreenReaderOnly, VisuallyHidden } from '@/components/ui/accessibility';

// Option 1: ScreenReaderOnly
<ScreenReaderOnly>This text is only announced to screen readers</ScreenReaderOnly>

// Option 2: VisuallyHidden (alternative implementation)
<VisuallyHidden>This text is also only for screen readers</VisuallyHidden>
```

### LiveAnnouncer

Announces dynamic changes to screen reader users. Useful for form submissions, async operations, etc.

```tsx
import { LiveAnnouncer } from '@/components/ui/accessibility';

// Place once in your app layout
<LiveAnnouncer politeness="polite" />

// Then use the global function anywhere in your app
if (window.announcer) {
  window.announcer.announce("Your form was submitted successfully!");
}
```

### AccessibleDialog

A dialog with proper focus management and keyboard accessibility.

```tsx
import { AccessibleDialog } from '@/components/ui/accessibility';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Dialog</button>
      
      <AccessibleDialog
        title="Dialog Title"
        description="Optional description of the dialog"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        footer={<button onClick={() => setIsOpen(false)}>Close</button>}
      >
        {/* Dialog content */}
        <p>This dialog has proper focus management</p>
      </AccessibleDialog>
    </>
  );
}
```

### FormErrorMessage

Properly associates error messages with form fields using ARIA.

```tsx
import { FormErrorMessage } from '@/components/ui/accessibility';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function MyForm() {
  const [error, setError] = useState('');
  
  return (
    <form>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          aria-describedby={error ? "email-error" : undefined}
          aria-invalid={Boolean(error)}
        />
        {error && (
          <FormErrorMessage id="email-error">
            {error}
          </FormErrorMessage>
        )}
      </div>
    </form>
  );
}
```

### AccessibleIcon

Makes icons accessible to screen readers.

```tsx
import { AccessibleIcon } from '@/components/ui/accessibility';
import { Bell } from 'lucide-react';

// Icon only (hidden label for screen readers)
<AccessibleIcon 
  icon={<Bell className="h-5 w-5" />} 
  label="Notifications"
/>

// Icon with visible label after
<AccessibleIcon 
  icon={<Bell className="h-5 w-5" />} 
  label="Notifications" 
  labelPosition="after"
/>

// Icon with visible label before
<AccessibleIcon 
  icon={<Bell className="h-5 w-5" />} 
  label="Notifications" 
  labelPosition="before"
/>

// Clickable icon
<AccessibleIcon 
  icon={<Bell className="h-5 w-5" />} 
  label="Notifications"
  onClick={() => console.log('clicked')}
/>
```

## Best Practices

1. **Always use SkipLink** in your main layout to allow keyboard users to bypass navigation.

2. **Provide context for screen readers** when necessary using ScreenReaderOnly or VisuallyHidden components.

3. **Announce dynamic changes** with LiveAnnouncer, especially for:
   - Form submissions/errors
   - Async operations completion
   - Modal dialogs opening/closing
   - Important UI state changes

4. **Use AccessibleDialog** for any modal or dialog component.

5. **Always associate form errors** with their fields using FormErrorMessage.

6. **Ensure icons have accessible names** using AccessibleIcon.

## Implementation Guide

For a complete implementation example, visit the [accessibility example page](/example/accessibility) in the application.

## Testing Accessibility

To test these components:

1. **Keyboard Navigation**: Try navigating with Tab and Shift+Tab, with focus visible.
2. **Screen Readers**: Test with popular screen readers like NVDA, VoiceOver, or JAWS.
3. **Automated Tools**: Run accessibility audits using tools like Lighthouse or axe.

## References

For more information on web accessibility:

- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [Inclusive Components](https://inclusive-components.design/)
- [The A11Y Project](https://www.a11yproject.com/) 