# Accessibility Guide

## Overview

This guide outlines the accessibility standards, practices, and implementation guidelines for the VibeWell platform. Ensuring our application is accessible to all users, including those with disabilities, is not only a legal requirement but aligns with our core values of inclusivity and excellent user experience.

## Table of Contents

1. [Accessibility Standards](#accessibility-standards)
2. [Key Principles](#key-principles)
3. [Implementation Guidelines](#implementation-guidelines)
4. [Testing Accessibility](#testing-accessibility)
5. [Component-Specific Guidelines](#component-specific-guidelines)
6. [Tools and Resources](#tools-and-resources)
7. [Checklist](#accessibility-checklist)

## Accessibility Standards

VibeWell follows the Web Content Accessibility Guidelines (WCAG) 2.1 at the AA level. These guidelines are organized around four principles:

1. **Perceivable**: Information and user interface components must be presentable to users in ways they can perceive.
2. **Operable**: User interface components and navigation must be operable.
3. **Understandable**: Information and the operation of the user interface must be understandable.
4. **Robust**: Content must be robust enough to be reliably interpreted by a wide variety of user agents, including assistive technologies.

## Key Principles

### Semantic HTML

Use HTML elements according to their intended purpose. This ensures that the content has meaning when CSS is disabled or when using assistive technologies.

```tsx
// ❌ Avoid
<div className="button" onClick={handleClick}>Submit</div>

// ✅ Preferred
<button onClick={handleClick}>Submit</button>
```

### Keyboard Navigation

Ensure all functionality is available using a keyboard only:

- Use proper focus management
- Ensure all interactive elements are focusable
- Provide visible focus indicators
- Implement logical tab order

```tsx
// ❌ Avoid
<div 
  onClick={handleClick}
  className="card-clickable"
>
  Card content
</div>

// ✅ Preferred
<div 
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  role="button"
  tabIndex={0}
  className="card-clickable"
>
  Card content
</div>
```

### Screen Reader Support

Implement proper labels, descriptions, and ARIA attributes to support screen reader users:

```tsx
// ❌ Avoid
<button onClick={closeModal}>×</button>

// ✅ Preferred
<button 
  onClick={closeModal}
  aria-label="Close modal"
>
  <span aria-hidden="true">×</span>
</button>
```

### Color and Contrast

- Maintain a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text
- Do not rely solely on color to convey information
- Provide additional indicators (icons, text, etc.)

```tsx
// ❌ Avoid
<span className="error-text">This field is required</span>

// ✅ Preferred
<span className="error-text" role="alert">
  <ErrorIcon aria-hidden="true" /> This field is required
</span>
```

### Focus Management

Properly manage focus, especially in dynamic content and modal dialogs:

```tsx
// Example: Modal focus management
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      // Save last focused element
      const lastActiveElement = document.activeElement;
      
      // Focus the modal
      modalRef.current?.focus();
      
      return () => {
        // Return focus when modal closes
        lastActiveElement?.focus();
      };
    }
  }, [isOpen]);
  
  return isOpen ? (
    <div 
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="modal"
    >
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  ) : null;
}
```

## Implementation Guidelines

### Forms

1. **Labels**: All form controls must have associated labels
   ```tsx
   <label htmlFor="name">Name</label>
   <input id="name" type="text" />
   ```

2. **Error Messages**: Error messages should be programmatically associated with form fields
   ```tsx
   <label htmlFor="email">Email</label>
   <input 
     id="email" 
     type="email" 
     aria-describedby="email-error" 
     aria-invalid={hasError}
   />
   {hasError && (
     <div id="email-error" className="error" role="alert">
       Please enter a valid email address
     </div>
   )}
   ```

3. **Fieldsets**: Group related form elements with fieldset and legend
   ```tsx
   <fieldset>
     <legend>Contact Information</legend>
     {/* Form fields */}
   </fieldset>
   ```

### Images

1. **Alt Text**: Provide descriptive alt text for images
   ```tsx
   <img src="/path/to/image.jpg" alt="Description of the image" />
   ```

2. **Decorative Images**: Use empty alt text for decorative images
   ```tsx
   <img src="/path/to/decorative.jpg" alt="" role="presentation" />
   ```

### Tables

1. **Table Headers**: Use proper table headers and scope attributes
   ```tsx
   <table>
     <caption>Monthly Bookings</caption>
     <thead>
       <tr>
         <th scope="col">Service</th>
         <th scope="col">Date</th>
         <th scope="col">Price</th>
       </tr>
     </thead>
     <tbody>
       {/* Table rows */}
     </tbody>
   </table>
   ```

### Dynamic Content

1. **Live Regions**: Use ARIA live regions for dynamic content updates
   ```tsx
   <div aria-live="polite" aria-atomic="true">
     {notificationMessage}
   </div>
   ```

2. **Loading States**: Indicate loading states to all users
   ```tsx
   <div aria-busy={isLoading} aria-live="polite">
     {isLoading ? <Spinner aria-hidden="true" /> : 'Content loaded'}
   </div>
   ```

## Testing Accessibility

### Automated Testing

Use automated testing tools as a first line of defense:

```tsx
// Example: Jest with jest-axe
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../Button';

expect.extend(toHaveNoViolations);

describe('Button', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Manual Testing

Supplement automated testing with manual checks:

1. **Keyboard Navigation**: Test all functionality using only keyboard
2. **Screen Reader Testing**: Use screen readers to verify content perception
3. **Zoom Testing**: Verify layout at different zoom levels (up to 200%)
4. **Contrast Testing**: Use contrast analyzers to verify color contrast

## Component-Specific Guidelines

### Buttons

All buttons should:

- Be focusable
- Have descriptive text or aria-label
- Have appropriate roles
- Convey state changes

```tsx
// Example: Different button states
<button 
  disabled={isDisabled} 
  aria-busy={isLoading}
>
  {isLoading ? 'Loading...' : 'Submit'}
</button>
```

### Modals

Modal dialogs should:

- Trap focus within while open
- Return focus on close
- Be dismissible via Escape key
- Have appropriate ARIA attributes

```tsx
function AccessibleModal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const [lastActiveElement, setLastActiveElement] = useState(null);
  
  useEffect(() => {
    if (isOpen) {
      setLastActiveElement(document.activeElement);
      setTimeout(() => modalRef.current?.focus(), 100);
      
      // Handle Escape key
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        lastActiveElement?.focus();
      };
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div role="presentation">
      <div className="modal-backdrop" onClick={onClose} />
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className="modal"
      >
        <h2 id="modal-title">{title}</h2>
        <div>{children}</div>
        <button onClick={onClose} aria-label="Close modal">
          Close
        </button>
      </div>
    </div>
  );
}
```

### Dropdown Menus

Dropdown menus should:

- Be keyboard accessible
- Use appropriate ARIA roles and properties
- Properly manage focus
- Be dismissible via Escape key

```tsx
function Dropdown({ label, options, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  
  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);
  
  // Handle Escape key and focus management
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') close();
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);
  
  return (
    <div className="dropdown">
      <button
        ref={buttonRef}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={toggle}
      >
        {label}
      </button>
      
      {isOpen && (
        <ul
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          className="dropdown-menu"
        >
          {options.map((option) => (
            <li key={option.value} role="none">
              <button
                role="menuitem"
                onClick={() => {
                  onSelect(option.value);
                  close();
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Tools and Resources

### Development Tools

- **ESLint**: Use `eslint-plugin-jsx-a11y` to catch common accessibility issues
- **TypeScript**: Leverage TypeScript to ensure proper props for accessibility
- **Testing Library**: Use `@testing-library/react` for user-centric testing
- **Axe Core**: Integrate `react-axe` for runtime accessibility checking

### Browser Extensions

- **axe DevTools**: For checking accessibility violations
- **WAVE**: For visual accessibility evaluation
- **Lighthouse**: For overall accessibility auditing
- **Accessibility Insights**: For detailed accessibility testing

### Screen Readers

- **NVDA**: Free screen reader for Windows
- **VoiceOver**: Built-in screen reader for macOS
- **JAWS**: Commercial screen reader for Windows
- **Narrator**: Built-in screen reader for Windows

## Accessibility Checklist

Use this checklist for every component and page:

### Structure and Semantics
- [ ] Proper HTML5 semantic elements used (`<header>`, `<nav>`, `<main>`, etc.)
- [ ] Headings follow proper hierarchy (h1, h2, h3, etc.)
- [ ] Landmarks are used appropriately (role="navigation", etc.)

### Keyboard and Focus
- [ ] All interactive elements are keyboard accessible
- [ ] Focus order is logical and intuitive
- [ ] Focus state is visible
- [ ] No keyboard traps exist

### Text and Typography
- [ ] Text has sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
- [ ] Font size is at least 16px for body text
- [ ] Line height is at least 1.5 times the font size
- [ ] Text can be resized up to 200% without loss of content or functionality

### Images and Media
- [ ] All images have appropriate alt text
- [ ] Decorative images use empty alt attributes
- [ ] Complex images have extended descriptions
- [ ] Videos have captions and audio descriptions

### Forms and Validation
- [ ] All form controls have associated labels
- [ ] Required fields are clearly indicated
- [ ] Error messages are programmatically associated with form controls
- [ ] Instructions for complex forms are provided

### ARIA and Screen Readers
- [ ] ARIA landmarks are used appropriately
- [ ] Dynamic content updates use aria-live regions
- [ ] Modal dialogs use appropriate ARIA roles and properties
- [ ] Status messages are announced to screen readers

### Color and Contrast
- [ ] Information is not conveyed by color alone
- [ ] UI components meet the 3:1 contrast ratio against adjacent colors
- [ ] Focus indicators have sufficient contrast

### Mobile and Responsive
- [ ] Touch targets are at least 44x44 pixels
- [ ] Pinch zoom is not disabled
- [ ] Content is accessible in both portrait and landscape orientations

## Conclusion

Accessibility is an ongoing process that should be integrated into our development workflow. By following these guidelines, we ensure that VibeWell is usable by everyone, regardless of ability or disability.

## Related Documents

- [Component Library Documentation](../guides/ui-component-library.md)
- [Testing Guide](../guides/testing-guide.md)
- [Design System Guidelines](../design/design-system.md) 