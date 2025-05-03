# Accessibility Testing Guide

This guide outlines the process for comprehensive accessibility testing of the Vibewell application, focusing on screen readers, keyboard navigation, and mobile compatibility.

## Screen Reader Testing

### Prerequisites

- **NVDA** (Windows): [Download from NVDAProject.org](https://www.nvaccess.org/download/)
- **VoiceOver** (macOS/iOS): Built into macOS (activate with `Cmd + F5`)
- **JAWS** (Windows): Commercial screen reader for enterprise testing
- **TalkBack** (Android): Built into Android devices (activate in Accessibility settings)

### Test Procedure

#### 1. Basic Navigation Test

1. Launch the screen reader before opening the application
2. Navigate to the Vibewell application
3. Verify the screen reader announces:
   - Page title
   - Navigation elements
   - Main content area
   - Form controls and interactive elements

#### 2. Interactive Elements Test

Test the following elements with screen readers:

- **Buttons**: Verify proper role and label announcement
- **Form fields**: Check for proper label association and instructions
- **Error messages**: Ensure they're announced when form validation fails
- **Modal dialogs**: Test focus management and ARIA roles
- **Dropdown menus**: Verify keyboard operability and ARIA states
- **Custom components**: Test any complex custom components (carousels, tabs, etc.)

#### 3. Dynamic Content Test

1. Test any content that updates without page reload:
   - Form validation messages
   - Notifications/alerts
   - Expandable/collapsible sections
   - Content that loads via infinite scroll or "load more" buttons
2. Verify that screen readers announce these changes using the `LiveAnnouncer` component

#### 4. Testing Checklist

| Element | NVDA (Windows) | VoiceOver (macOS) | JAWS (Windows) | TalkBack (Android) |
|---------|---------------|-------------------|----------------|-------------------|
| Skip Link | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ |
| Navigation Menu | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ |
| Search Form | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ |
| Main Content | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ |
| Product Cards | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ |
| Modal Dialogs | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ |
| Form Validation | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ |
| Dynamic Updates | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ |

### Common NVDA Commands

- **Tab**: Move to next focusable element
- **Shift + Tab**: Move to previous focusable element
- **H**: Navigate by headings
- **D**: Navigate by landmarks/regions
- **F**: Navigate by form fields
- **B**: Navigate by buttons
- **NVDA + Space**: Activate current element
- **NVDA + Down Arrow**: Enter forms mode
- **NVDA + Num Pad Plus**: Turn on/off browse mode

### Common VoiceOver Commands

- **VO + Right Arrow**: Move to next element (VO is Control + Option)
- **VO + Left Arrow**: Move to previous element
- **VO + Space**: Activate current element
- **VO + U**: Use rotor (navigate by headings, links, etc.)
- **VO + Command + H**: Navigate by headings
- **Tab**: Move to next interactive element
- **Shift + Tab**: Move to previous interactive element

## Keyboard-Only Testing

### Testing Procedure

1. Disconnect/disable your mouse and touchpad
2. Navigate the entire application using only the keyboard
3. Verify the following:

#### Focus Management

- **Focus Visibility**: All interactive elements show a clear focus indicator
- **Focus Order**: Tab order follows a logical sequence (usually left-to-right, top-to-bottom)
- **Skip Link**: Skip link appears when focus enters the page and works correctly
- **Focus Trapping**: Modal dialogs trap focus while open
- **Focus Return**: Focus returns to trigger element when a modal closes

#### Interactive Elements

| Element | Keyboard Access | Keystrokes |
|---------|----------------|------------|
| Buttons | ✓/✗ | Tab + Enter/Space |
| Links | ✓/✗ | Tab + Enter |
| Dropdowns | ✓/✗ | Tab + Enter, Arrow keys |
| Form fields | ✓/✗ | Tab + typing |
| Checkboxes/Radio buttons | ✓/✗ | Tab + Space |
| Sliders | ✓/✗ | Tab + Arrow keys |
| Date pickers | ✓/✗ | Tab + Arrow keys/Enter |
| Custom widgets | ✓/✗ | Varies |

### Keyboard Testing Checklist

1. **Navigation**
   - [ ] Can navigate to all interactive elements
   - [ ] Skip link functions correctly
   - [ ] Keyboard traps are avoided (except modal dialogs)
   - [ ] All functionality is available without a mouse

2. **Visual Cues**
   - [ ] Focus indicators are clearly visible
   - [ ] Focus indicators have sufficient contrast (3:1 minimum)
   - [ ] Focus style is consistent throughout the application

3. **Complex Interactions**
   - [ ] Modal dialogs trap focus appropriately
   - [ ] Dropdown menus can be operated with keyboard
   - [ ] Custom components support keyboard operation
   - [ ] Error messages are accessible via keyboard

## Mobile Touch Target Testing

### Testing Procedure

1. Use a physical mobile device (iOS and Android) to test
2. Test both in portrait and landscape orientations
3. Check touch targets for all interactive elements

### Touch Target Requirements

- **Minimum Size**: All touch targets should be at least 44×44 pixels (per WCAG 2.1)
- **Spacing**: Adequate space between touch targets (8px minimum)
- **Forgiving Touch**: Slightly missing the target should still activate it

### Testing Checklist

1. **Buttons and Controls**
   - [ ] All buttons have sufficient touch area
   - [ ] Navigation items are easily tappable
   - [ ] Form controls have adequate size
   - [ ] Small icons have extended touch areas

2. **Form Inputs**
   - [ ] Text fields expand appropriately on focus
   - [ ] Field labels are tappable to focus the field
   - [ ] Error messages are easily dismissible
   - [ ] Custom form controls meet size requirements

3. **Interactive Elements**
   - [ ] Cards and list items are easily selectable
   - [ ] Sliders and custom controls are usable with fingers
   - [ ] No tiny close buttons or controls
   - [ ] Screen edges and corners are easily accessible

### Measurement Tool

Use the built-in browser developer tools to measure element dimensions:

1. Open DevTools
2. Select the element
3. Check dimensions in the box model or computed styles panel

## Reporting Issues

For any accessibility issues found during testing:

1. Document the issue with:
   - Device/OS/Browser/Screen reader version
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshot or recording if possible
   - Severity rating (Critical, High, Medium, Low)

2. File issues in the issue tracker using the "Accessibility" label

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [WebAIM Screen Reader Survey](https://webaim.org/projects/screenreadersurvey9/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Deque University](https://dequeuniversity.com/)
- [Inclusive Components](https://inclusive-components.design/) 