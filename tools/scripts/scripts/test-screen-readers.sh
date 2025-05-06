#!/bin/bash

# Vibewell Screen Reader Testing Script
# This script helps set up and run screen reader tests

echo "Setting up screen reader testing environment..."

# Check if running on macOS or Windows
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "macOS detected - setting up VoiceOver testing"
    
    # Check if VoiceOver is installed
    if ! command -v VoiceOver &> /dev/null; then
        echo "VoiceOver is not installed. Please enable it in System Preferences > Accessibility > VoiceOver"
        exit 1
    fi
    
    # Create VoiceOver test script
    cat > ./accessibility/tests/voiceover-test.js << EOF
// VoiceOver testing script
const { exec } = require('child_process');

// Test basic navigation
function testNavigation() {
    console.log('Testing basic navigation...');
    // Add your VoiceOver testing commands here
}

// Test form interaction
function testForms() {
    console.log('Testing form interaction...');
    // Add your VoiceOver testing commands here
}

// Test dynamic content
function testDynamicContent() {
    console.log('Testing dynamic content...');
    // Add your VoiceOver testing commands here
}

// Run all tests
testNavigation();
testForms();
testDynamicContent();
EOF

elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "Windows detected - setting up NVDA testing"
    
    # Check if NVDA is installed
    if ! command -v nvda &> /dev/null; then
        echo "NVDA is not installed. Please download and install it from https://www.nvaccess.org/download/"
        exit 1
    fi
    
    # Create NVDA test script
    cat > ./accessibility/tests/nvda-test.js << EOF
// NVDA testing script
const { exec } = require('child_process');

// Test basic navigation
function testNavigation() {
    console.log('Testing basic navigation...');
    // Add your NVDA testing commands here
}

// Test form interaction
function testForms() {
    console.log('Testing form interaction...');
    // Add your NVDA testing commands here
}

// Test dynamic content
function testDynamicContent() {
    console.log('Testing dynamic content...');
    // Add your NVDA testing commands here
}

// Run all tests
testNavigation();
testForms();
testDynamicContent();
EOF
fi

# Create test results directory
mkdir -p ./accessibility/test-results

# Create test report template
cat > ./accessibility/test-results/template.md << EOF
# Screen Reader Test Results

## Test Environment
- Date: \$(date)
- Screen Reader: \$SCREEN_READER
- Browser: \$BROWSER
- OS: \$OS

## Test Results

### Navigation
- [ ] Skip links work correctly
- [ ] Heading structure is logical
- [ ] Landmarks are properly identified
- [ ] Focus order is logical

### Forms
- [ ] Labels are properly associated
- [ ] Error messages are announced
- [ ] Required fields are indicated
- [ ] Form validation is announced

### Dynamic Content
- [ ] Live regions work correctly
- [ ] Modal dialogs are announced
- [ ] Status messages are announced
- [ ] Dynamic updates are announced

### Images and Media
- [ ] Images have appropriate alt text
- [ ] Decorative images are hidden
- [ ] Complex images have long descriptions
- [ ] Media controls are accessible

## Issues Found
1. 
2. 
3. 

## Recommendations
1. 
2. 
3. 
EOF

echo "Screen reader testing environment setup complete!"
echo "To run tests:"
echo "  - On macOS: node accessibility/tests/voiceover-test.js"
echo "  - On Windows: node accessibility/tests/nvda-test.js"
echo "Results will be saved in accessibility/test-results/" 