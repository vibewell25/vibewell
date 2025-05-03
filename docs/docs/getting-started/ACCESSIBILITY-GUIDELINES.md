# Accessibility Guidelines

This guide outlines best practices to ensure all users—including those with disabilities—can perceive, understand, navigate, and interact with your content.

## 1. Semantic HTML
- Use native HTML elements (`<button>`, `<header>`, `<nav>`, `<main>`, `<section>`) instead of generic `<div>` for structure.
- Provide meaningful `alt` text for images and decorative images should have `alt=""`.
- Use heading levels (`<h1>`–`<h6>`) in logical order to define page structure.

## 2. ARIA Best Practices
- Only use ARIA roles and properties when native semantics are insufficient.
- Always pair interactive elements with proper ARIA roles (e.g., `role="dialog"`, `role="alert"`).
- Keep ARIA attributes up-to-date with component state (`aria-expanded`, `aria-pressed`).

## 3. Color and Contrast
- Ensure text has a contrast ratio of at least 4.5:1 (small text) or 3:1 (large text).
- Do not rely solely on color to convey information; provide text labels or icons.
- Test with tools like the WCAG Contrast Checker or axe.

## 4. Keyboard Navigation
- All interactive controls must be reachable and operable via keyboard (Tab, Enter, Space).
- Visible focus indicators (outline) should clearly highlight the active element.
- Ensure focus order matches the visual layout and logical reading order.

## 5. Focus Management
- Move `tabindex` thoughtfully for modals and dynamic content, and return focus to the triggering element.
- Use `aria-live` regions for important status updates (errors, success messages).

## 6. Forms and Labels
- Associate form controls with `<label>` elements or `aria-label`/`aria-labelledby`.
- Provide clear instructions and validation feedback inline.
- Group related controls with `<fieldset>` and `<legend>` when appropriate.

## 7. Media Accessibility
- Provide captions and transcripts for all audio and video content.
- Use `aria-describedby` to link to detailed transcripts or long descriptions.

## 8. Testing and Validation
- Integrate automated tools (axe, Lighthouse) into your development workflow.
- Manually test with screen readers (VoiceOver, NVDA) and keyboard-only navigation.

---
_These guidelines align with WCAG 2.1 AA standards._ 