#!/bin/bash

# Vibewell Mobile Touch Target Testing Script
# This script helps test mobile touch target sizes

echo "Setting up mobile touch target testing environment..."

# Create touch target test script
cat > ./accessibility/tests/touch-target-test.js << EOF
// Mobile touch target testing script
const puppeteer = require('puppeteer');

async function testTouchTargets() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Set viewport to mobile size
    await page.setViewport({ width: 375, height: 812 });
    
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Test interactive elements
    console.log('Testing interactive elements...');
    await testInteractiveElements(page);
    
    // Test form elements
    console.log('Testing form elements...');
    await testFormElements(page);
    
    // Test navigation elements
    console.log('Testing navigation elements...');
    await testNavigationElements(page);
    
    await browser.close();
}

async function testInteractiveElements(page) {
    // Test buttons and links
    const interactiveElements = await page.$$('button, a[href], [role="button"]');
    for (const element of interactiveElements) {
        const size = await element.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return {
                width: rect.width,
                height: rect.height,
                minSize: Math.min(rect.width, rect.height)
            };
        });
        
        console.log('Element size:', size);
        if (size.minSize < 44) {
            console.log('WARNING: Touch target too small!');
        }
    }
}

async function testFormElements(page) {
    // Test form inputs
    const formElements = await page.$$('input, select, textarea');
    for (const element of formElements) {
        const size = await element.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return {
                width: rect.width,
                height: rect.height,
                minSize: Math.min(rect.width, rect.height)
            };
        });
        
        console.log('Form element size:', size);
        if (size.minSize < 44) {
            console.log('WARNING: Form element touch target too small!');
        }
    }
}

async function testNavigationElements(page) {
    // Test navigation items
    const navElements = await page.$$('nav a, nav button');
    for (const element of navElements) {
        const size = await element.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return {
                width: rect.width,
                height: rect.height,
                minSize: Math.min(rect.width, rect.height)
            };
        });
        
        console.log('Navigation element size:', size);
        if (size.minSize < 44) {
            console.log('WARNING: Navigation element touch target too small!');
        }
    }
}

// Run the tests
testTouchTargets().catch(console.error);
EOF

# Create test results directory
mkdir -p ./accessibility/test-results

# Create test report template
cat > ./accessibility/test-results/touch-target-test-template.md << EOF
# Mobile Touch Target Test Results

## Test Environment
- Date: \$(date)
- Device: iPhone X (375x812)
- Browser: Chrome (Puppeteer)
- OS: \$OS

## Test Results

### Interactive Elements
- [ ] All buttons meet minimum size (44x44px)
- [ ] All links meet minimum size (44x44px)
- [ ] Custom interactive elements meet minimum size
- [ ] Adequate spacing between touch targets

### Form Elements
- [ ] Input fields meet minimum size (44x44px)
- [ ] Checkboxes and radio buttons meet minimum size
- [ ] Select dropdowns meet minimum size
- [ ] Form labels are tappable

### Navigation Elements
- [ ] Navigation links meet minimum size
- [ ] Menu items meet minimum size
- [ ] Tab bar items meet minimum size
- [ ] Back/forward buttons meet minimum size

## Issues Found
1. 
2. 
3. 

## Recommendations
1. 
2. 
3. 
EOF

echo "Mobile touch target testing environment setup complete!"
echo "To run tests: node accessibility/tests/touch-target-test.js"
echo "Results will be saved in accessibility/test-results/" 