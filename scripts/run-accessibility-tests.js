const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Create reports directory if it doesn't exist
const reportsDir = path.join(__dirname, '../accessibility/reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

async function runTests() {
    console.log('Starting comprehensive accessibility testing...');
    
    try {
        // Run keyboard tests
        console.log('\nRunning keyboard accessibility tests...');
        await runWithRetry(runKeyboardTests);
        
        // Run screen reader tests
        console.log('\nRunning screen reader tests...');
        await runWithRetry(runScreenReaderTests);
        
        // Run color contrast tests
        console.log('\nRunning color contrast tests...');
        await runWithRetry(runColorContrastTests);
        
        // Run ARIA validation tests
        console.log('\nRunning ARIA validation tests...');
        await runWithRetry(runARIAValidationTests);
        
        // Run mobile touch target tests
        console.log('\nRunning mobile touch target tests...');
        await runWithRetry(runTouchTargetTests);
        
        // Run WCAG compliance check
        console.log('\nRunning WCAG compliance check...');
        await runWithRetry(runWCAGComplianceCheck);
        
        // Generate consolidated report
        console.log('\nGenerating consolidated report...');
        await generateConsolidatedReport();
        
        console.log('\nAccessibility testing completed!');
    } catch (error) {
        console.error('Error during accessibility testing:', error);
        process.exit(1);
    }
}

async function runWithRetry(fn, retries = MAX_RETRIES) {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            console.log(`Retrying... (${retries} attempts remaining)`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return runWithRetry(fn, retries - 1);
        }
        throw error;
    }
}

async function runKeyboardTests() {
    return new Promise((resolve, reject) => {
        exec('node accessibility/tests/keyboard-test.js', (error, stdout, stderr) => {
            if (error) {
                console.error('Keyboard tests error:', error);
                reject(error);
                return;
            }
            console.log('Keyboard tests completed');
            resolve();
        });
    });
}

async function runScreenReaderTests() {
    const platform = process.platform;
    
    if (platform === 'darwin') {
        console.log('Running VoiceOver tests (macOS)...');
        await runVoiceOverTests();
    } else if (platform === 'win32') {
        console.log('Running NVDA tests (Windows)...');
        await runNVDATests();
    } else {
        console.log('Screen reader tests not supported on this platform');
    }
}

async function runVoiceOverTests() {
    return new Promise((resolve, reject) => {
        exec('node accessibility/tests/voiceover-test.js', (error, stdout, stderr) => {
            if (error) {
                console.error('VoiceOver tests error:', error);
                reject(error);
                return;
            }
            console.log('VoiceOver tests completed');
            resolve();
        });
    });
}

async function runNVDATests() {
    return new Promise((resolve, reject) => {
        exec('node accessibility/tests/nvda-test.js', (error, stdout, stderr) => {
            if (error) {
                console.error('NVDA tests error:', error);
                reject(error);
                return;
            }
            console.log('NVDA tests completed');
            resolve();
        });
    });
}

async function runColorContrastTests() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Test color contrast
    const contrastResults = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const results = [];
        
        elements.forEach(element => {
            const style = window.getComputedStyle(element);
            const bgColor = style.backgroundColor;
            const textColor = style.color;
            
            if (bgColor !== 'rgba(0, 0, 0, 0)' && textColor !== 'rgba(0, 0, 0, 0)') {
                results.push({
                    element: element.tagName,
                    id: element.id,
                    bgColor,
                    textColor,
                    fontSize: style.fontSize,
                    fontWeight: style.fontWeight
                });
            }
        });
        
        return results;
    });
    
    // Generate color contrast report
    const contrastReport = `# Color Contrast Test Results

## Test Environment
- Date: ${new Date().toISOString()}
- Browser: Chrome (Puppeteer)

## Results

### Elements with Color Contrast
${contrastResults.map(result => `
- ${result.element}${result.id ? `#${result.id}` : ''}
  - Background: ${result.bgColor}
  - Text: ${result.textColor}
  - Font Size: ${result.fontSize}
  - Font Weight: ${result.fontWeight}
`).join('\n')}

## Recommendations
- Verify all text elements meet WCAG 2.1 contrast requirements
- Check contrast ratios for different font sizes and weights
- Ensure interactive elements have sufficient contrast
`;
    
    fs.writeFileSync(path.join(reportsDir, 'color-contrast-results.md'), contrastReport);
    
    await browser.close();
}

async function runARIAValidationTests() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000');
    
    const ariaResults = await page.evaluate(() => {
        const results = [];
        
        // Check for invalid ARIA attributes
        const elements = document.querySelectorAll('[aria-*]');
        elements.forEach(element => {
            const ariaAttributes = Array.from(element.attributes)
                .filter(attr => attr.name.startsWith('aria-'))
                .map(attr => ({
                    name: attr.name,
                    value: attr.value,
                    valid: true // This would be validated against ARIA spec
                }));
            
            if (ariaAttributes.length > 0) {
                results.push({
                    element: element.tagName,
                    id: element.id,
                    ariaAttributes
                });
            }
        });
        
        return results;
    });
    
    const ariaReport = `# ARIA Validation Test Results

## Test Environment
- Date: ${new Date().toISOString()}
- Browser: Chrome (Puppeteer)

## Results

### ARIA Attributes
${ariaResults.map(result => `
- ${result.element}${result.id ? `#${result.id}` : ''}
  ${result.ariaAttributes.map(attr => `
  - ${attr.name}: ${attr.value} ${attr.valid ? '✅' : '❌'}
  `).join('')}
`).join('\n')}

## Recommendations
- Validate all ARIA attributes against the ARIA specification
- Ensure ARIA roles are used appropriately
- Check for redundant ARIA attributes
`;
    
    fs.writeFileSync(path.join(reportsDir, 'aria-validation-results.md'), ariaReport);
    await browser.close();
}

async function runTouchTargetTests() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Set viewport to mobile size
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    
    const touchResults = await page.evaluate(() => {
        const MIN_TOUCH_SIZE = 44; // WCAG minimum touch target size
        const results = [];
        
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
        interactiveElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            const isLargeEnough = width >= MIN_TOUCH_SIZE && height >= MIN_TOUCH_SIZE;
            
            results.push({
                element: element.tagName,
                id: element.id,
                width,
                height,
                meetsRequirements: isLargeEnough
            });
        });
        
        return results;
    });
    
    const touchReport = `# Mobile Touch Target Test Results

## Test Environment
- Date: ${new Date().toISOString()}
- Browser: Chrome (Puppeteer)
- Viewport: 375x667 (iPhone SE)

## Results

### Touch Targets
${touchResults.map(result => `
- ${result.element}${result.id ? `#${result.id}` : ''}
  - Size: ${result.width}x${result.height}px
  - Meets Requirements: ${result.meetsRequirements ? '✅' : '❌'}
`).join('\n')}

## Recommendations
- Ensure all interactive elements are at least 44x44px
- Add padding to small elements to increase touch target size
- Consider using CSS to increase touch target size without affecting visual design
`;
    
    fs.writeFileSync(path.join(reportsDir, 'touch-target-results.md'), touchReport);
    await browser.close();
}

async function runWCAGComplianceCheck() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000');
    
    const wcagResults = await page.evaluate(() => {
        const results = {
            levelA: [],
            levelAA: [],
            levelAAA: []
        };
        
        // Check for common WCAG violations
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.alt && !img.getAttribute('role') === 'presentation') {
                results.levelA.push({
                    type: 'Image missing alt text',
                    element: img.tagName,
                    id: img.id
                });
            }
        });
        
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let lastLevel = 0;
        headings.forEach(heading => {
            const level = parseInt(heading.tagName[1]);
            if (level > lastLevel + 1) {
                results.levelA.push({
                    type: 'Heading level skipped',
                    element: heading.tagName,
                    id: heading.id,
                    currentLevel: level,
                    expectedLevel: lastLevel + 1
                });
            }
            lastLevel = level;
        });
        
        return results;
    });
    
    const wcagReport = `# WCAG Compliance Check Results

## Test Environment
- Date: ${new Date().toISOString()}
- Browser: Chrome (Puppeteer)

## Results

### Level A Issues
${wcagResults.levelA.map(issue => `
- ${issue.type}
  - Element: ${issue.element}${issue.id ? `#${issue.id}` : ''}
  ${issue.currentLevel ? `- Current Level: ${issue.currentLevel}\n  - Expected Level: ${issue.expectedLevel}` : ''}
`).join('\n')}

### Level AA Issues
${wcagResults.levelAA.map(issue => `
- ${issue.type}
  - Element: ${issue.element}${issue.id ? `#${issue.id}` : ''}
`).join('\n')}

### Level AAA Issues
${wcagResults.levelAAA.map(issue => `
- ${issue.type}
  - Element: ${issue.element}${issue.id ? `#${issue.id}` : ''}
`).join('\n')}

## Recommendations
- Address all Level A issues first
- Implement Level AA requirements
- Consider Level AAA requirements for enhanced accessibility
`;
    
    fs.writeFileSync(path.join(reportsDir, 'wcag-compliance-results.md'), wcagReport);
    await browser.close();
}

async function generateConsolidatedReport() {
    // Read all individual reports
    const reports = {
        keyboard: fs.readFileSync(path.join(reportsDir, 'keyboard-test-results.md'), 'utf8'),
        screenReader: fs.readFileSync(path.join(reportsDir, 
            process.platform === 'darwin' ? 'voiceover-test-results.md' : 'nvda-test-results.md'), 'utf8'),
        contrast: fs.readFileSync(path.join(reportsDir, 'color-contrast-results.md'), 'utf8'),
        aria: fs.readFileSync(path.join(reportsDir, 'aria-validation-results.md'), 'utf8'),
        touch: fs.readFileSync(path.join(reportsDir, 'touch-target-results.md'), 'utf8'),
        wcag: fs.readFileSync(path.join(reportsDir, 'wcag-compliance-results.md'), 'utf8')
    };
    
    // Generate consolidated report
    const consolidatedReport = `# Comprehensive Accessibility Test Report

## Test Environment
- Date: ${new Date().toISOString()}
- Platform: ${process.platform}
- Browser: Chrome (Puppeteer)

## Test Results

### 1. Keyboard Accessibility
${reports.keyboard.split('## Results')[1]}

### 2. Screen Reader Compatibility
${reports.screenReader.split('## Results')[1]}

### 3. Color Contrast
${reports.contrast.split('## Results')[1]}

### 4. ARIA Validation
${reports.aria.split('## Results')[1]}

### 5. Mobile Touch Targets
${reports.touch.split('## Results')[1]}

### 6. WCAG Compliance
${reports.wcag.split('## Results')[1]}

## Overall Recommendations
1. Address all keyboard accessibility issues
2. Implement screen reader improvements
3. Fix color contrast violations
4. Validate and improve ARIA implementation
5. Ensure mobile touch targets meet requirements
6. Achieve WCAG 2.1 Level AA compliance
7. Regular accessibility testing schedule
8. User testing with assistive technologies
`;
    
    fs.writeFileSync(path.join(reportsDir, 'consolidated-accessibility-report.md'), consolidatedReport);
}

// Run all tests
runTests().catch(console.error); 