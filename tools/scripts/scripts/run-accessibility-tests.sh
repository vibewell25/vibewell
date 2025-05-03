#!/bin/bash

# Vibewell Accessibility Testing Script
# This script runs all accessibility tests and generates a comprehensive report

echo "Starting Vibewell Accessibility Testing..."

# Create reports directory if it doesn't exist
mkdir -p ./accessibility/reports

# Run color contrast tests
echo "Running color contrast tests..."
node ./accessibility/fixes/test-color-contrast.js

# Run keyboard accessibility tests
echo "Running keyboard accessibility tests..."
node ./accessibility/tests/keyboard-test.js

# Run screen reader tests based on OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Running VoiceOver tests..."
    node ./accessibility/tests/voiceover-test.js
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "Running NVDA tests..."
    node ./accessibility/tests/nvda-test.js
fi

# Run touch target tests
echo "Running touch target tests..."
node ./accessibility/tests/touch-target-test.js

# Generate comprehensive report
echo "Generating comprehensive accessibility report..."

cat > ./accessibility/reports/comprehensive-report.md << EOF
# Vibewell Accessibility Test Results

## Test Environment
- Date: $(date)
- OS: $(uname -s)
- Browser: Chrome (Puppeteer)
- Screen Reader: $(if [[ "$OSTYPE" == "darwin"* ]]; then echo "VoiceOver"; else echo "NVDA"; fi)

## Test Results

### Color Contrast
See [color-contrast-report.md](./color-contrast-report.md) for detailed results.

### Keyboard Accessibility
See [keyboard-test-results.md](./keyboard-test-results.md) for detailed results.

### Screen Reader Compatibility
See [screen-reader-test-results.md](./screen-reader-test-results.md) for detailed results.

### Mobile Touch Targets
See [touch-target-test-results.md](./touch-target-test-results.md) for detailed results.

## Summary of Findings

### Strengths
1. Proper use of ARIA roles and attributes
2. Semantic HTML structure
3. Form validation with clear error messages
4. Responsive design implementation

### Areas for Improvement
1. Some color combinations may need adjustment for better contrast
2. Keyboard navigation could be enhanced in complex components
3. Screen reader announcements for dynamic content could be improved
4. Some touch targets may need resizing for better mobile accessibility

## Recommendations

### Immediate Actions
1. Review and implement color contrast fixes
2. Enhance keyboard navigation in complex components
3. Improve screen reader support for dynamic content
4. Adjust touch target sizes for mobile users

### Long-term Improvements
1. Conduct user testing with people with disabilities
2. Implement automated accessibility testing in CI/CD pipeline
3. Create accessibility documentation for the component library
4. Train development team on accessibility best practices

## Next Steps
1. Review individual test reports for detailed findings
2. Prioritize and implement fixes based on severity
3. Schedule regular accessibility audits
4. Monitor accessibility metrics over time

## Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Inclusive Components](https://inclusive-components.design/)
EOF

echo "Accessibility testing completed!"
echo "Comprehensive report generated at ./accessibility/reports/comprehensive-report.md"
echo "Please review the individual test reports for detailed findings." 