#!/bin/bash

# Vibewell Keyboard Accessibility Testing Script
# This script helps test keyboard accessibility

echo "Setting up keyboard accessibility testing environment..."

# Create keyboard test script
cat > ./accessibility/tests/keyboard-test.js << EOF
// Keyboard accessibility testing script
const puppeteer = require('puppeteer');

async function testKeyboardAccessibility() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Test skip links
    console.log('Testing skip links...');
    await testSkipLinks(page);
    
    // Test focus order
    console.log('Testing focus order...');
    await testFocusOrder(page);
    
    // Test form accessibility
    console.log('Testing form accessibility...');
    await testForms(page);
    
    // Test interactive elements
    console.log('Testing interactive elements...');
    await testInteractiveElements(page);
    
    await browser.close();
}

async function testSkipLinks(page) {
    // Test skip to main content
    await page.keyboard.press('Tab');
    const skipLink = await page.evaluate(() => {
        const link = document.querySelector('.skip-link');
        return link ? link.textContent : null;
    });
    console.log('Skip link text:', skipLink);
}

async function testFocusOrder(page) {
    // Test tab order
    const focusOrder = [];
    while (true) {
        await page.keyboard.press('Tab');
        const focusedElement = await page.evaluate(() => {
            const element = document.activeElement;
            return element ? {
                tag: element.tagName,
                text: element.textContent,
                role: element.getAttribute('role'),
                id: element.id
            } : null;
        });
        
        if (!focusedElement) break;
        focusOrder.push(focusedElement);
    }
    
    console.log('Focus order:', focusOrder);
}

async function testForms(page) {
    // Test form field accessibility
    const forms = await page.$$('form');
    for (const form of forms) {
        const fields = await form.$$('input, select, textarea');
        for (const field of fields) {
            const label = await field.evaluate(el => {
                const id = el.id;
                return id ? document.querySelector(\`label[for="\${id}"]\`)?.textContent : null;
            });
            console.log('Form field label:', label);
        }
    }
}

async function testInteractiveElements(page) {
    // Test buttons, links, and other interactive elements
    const interactiveElements = await page.$$('button, a[href], [role="button"], [tabindex="0"]');
    for (const element of interactiveElements) {
        const isKeyboardAccessible = await element.evaluate(el => {
            return el.getAttribute('tabindex') !== '-1' && 
                   !el.hasAttribute('disabled') &&
                   !el.hasAttribute('aria-hidden');
        });
        console.log('Element keyboard accessible:', isKeyboardAccessible);
    }
}

// Run the tests
testKeyboardAccessibility().catch(console.error);
EOF

# Create test results directory
mkdir -p ./accessibility/test-results

# Create test report template
cat > ./accessibility/test-results/keyboard-test-template.md << EOF
# Keyboard Accessibility Test Results

## Test Environment
- Date: \$(date)
- Browser: Chrome (Puppeteer)
- OS: \$OS

## Test Results

### Skip Links
- [ ] Skip to main content link is present
- [ ] Skip link is visible when focused
- [ ] Skip link works correctly

### Focus Order
- [ ] Focus order is logical
- [ ] Focus is visible on all elements
- [ ] No focus traps
- [ ] Focus returns to trigger after modal closes

### Forms
- [ ] All form fields have labels
- [ ] Labels are properly associated
- [ ] Required fields are indicated
- [ ] Error messages are accessible

### Interactive Elements
- [ ] All buttons are keyboard accessible
- [ ] All links are keyboard accessible
- [ ] Custom interactive elements are keyboard accessible
- [ ] Focus indicators are visible

## Issues Found
1. 
2. 
3. 

## Recommendations
1. 
2. 
3. 
EOF

echo "Keyboard accessibility testing environment setup complete!"
echo "To run tests: node accessibility/tests/keyboard-test.js"
echo "Results will be saved in accessibility/test-results/" 