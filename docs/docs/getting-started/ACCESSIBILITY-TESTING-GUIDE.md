# Accessibility Testing Guide

This guide covers both automated and manual testing approaches to ensure your site meets accessibility standards (WCAG 2.1 AA).

## 1. Automated Testing

- **Integrate axe or Pa11y**: Run accessibility audits against development builds or staging environments.
- **Linting**: Use ESLint plugins like `jsx-a11y` to catch common WCAG violations during development.
- **Continuous Integration**: Add CI steps (e.g., `npm run test:accessibility`) to fail builds on violations.
- **Snapshot Testing**: Leverage Jest and `jest-axe` to assert no violations in key components.

## 2. Manual Testing

- **Keyboard Navigation**: Verify all interactive elements are reachable via Tab/Shift+Tab and operable (Enter/Space).
- **Screen Reader Testing**: Test flows with VoiceOver (macOS), NVDA (Windows) or JAWS to ensure proper reading order and announcements.
- **Color Contrast**: Use contrast checker tools to validate text-to-background ratios manually on live pages.
- **Zoom & Resize**: Increase browser zoom to 200% and ensure layout remains usable without horizontal scrolling.

## 3. Testing Workflow

1. **Local Development**: Run `npm run lint:accessibility` and fix issues before PR.
2. **Review Stage**: Conduct automated accessibility audit in staging environment.
3. **Manual Sign-Off**: QA engineer performs keyboard and screen reader walkthrough on critical user journeys.
4. **Regression Testing**: Re-run accessibility checks after significant UI changes.

## 4. Tools & Resources

- Axe CLI / Chrome DevTools axe integration
- Pa11y Command-Line Interface
- ESLint plugin `jsx-a11y`
- Jest-axe for component tests
- WAVE Chrome Extension
- Lighthouse (Accessibility audits)
- VoiceOver, NVDA, JAWS screen readers

---
_Enforce accessibility checks early and often to deliver an inclusive user experience._ 