const puppeteer = require('puppeteer');
const fs = require('fs');

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
        return link ? {
            text: link.textContent,
            visible: window.getComputedStyle(link).display !== 'none',
            href: link.getAttribute('href')
        } : null;
    });
    
    console.log('Skip link:', skipLink);
    
    // Generate report
    const report = `# Keyboard Accessibility Test Results - Skip Links

## Test Environment
- Date: ${new Date().toISOString()}
- Browser: Chrome (Puppeteer)

## Results

### Skip Link
- Present: ${skipLink ? '✅' : '❌'}
- Visible on focus: ${skipLink?.visible ? '✅' : '❌'}
- Target ID: ${skipLink?.href || 'N/A'}

## Recommendations
${!skipLink ? '- Add a skip link to allow keyboard users to bypass navigation\n' : ''}
${skipLink && !skipLink.visible ? '- Ensure skip link is visible when focused\n' : ''}
${skipLink && !skipLink.href ? '- Add proper href attribute to skip link\n' : ''}
`;
    
    fs.writeFileSync('./accessibility/reports/keyboard-test-results.md', report);
}

async function testFocusOrder(page) {
    const focusOrder = [];
    let previousElement = null;
    
    while (true) {
        await page.keyboard.press('Tab');
        const focusedElement = await page.evaluate(() => {
            const element = document.activeElement;
            return element ? {
                tag: element.tagName,
                text: element.textContent,
                role: element.getAttribute('role'),
                id: element.id,
                tabIndex: element.getAttribute('tabindex')
            } : null;
        });
        
        if (!focusedElement) break;
        
        // Check if focus is trapped
        if (previousElement && 
            focusedElement.id === previousElement.id && 
            focusedElement.tag === previousElement.tag) {
            console.log('Focus trap detected!');
            break;
        }
        
        focusOrder.push(focusedElement);
        previousElement = focusedElement;
    }
    
    console.log('Focus order:', focusOrder);
    
    // Append to report
    const focusReport = `

### Focus Order
${focusOrder.map((el, i) => `
${i + 1}. ${el.tag}${el.id ? `#${el.id}` : ''}${el.role ? `[role="${el.role}"]` : ''}
   - Text: ${el.text || 'N/A'}
   - Tab Index: ${el.tabIndex || 'default'}
`).join('\n')}

## Focus Order Recommendations
${focusOrder.some(el => el.tabIndex && parseInt(el.tabIndex) > 0) ? '- Avoid using positive tabindex values\n' : ''}
${focusOrder.some(el => !el.text && !el.role) ? '- Add descriptive text or ARIA labels to interactive elements\n' : ''}
`;
    
    fs.appendFileSync('./accessibility/reports/keyboard-test-results.md', focusReport);
}

async function testForms(page) {
    const forms = await page.$$('form');
    const formResults = [];
    
    for (const form of forms) {
        const fields = await form.$$('input, select, textarea');
        const formData = [];
        
        for (const field of fields) {
            const fieldData = await field.evaluate(el => {
                const id = el.id;
                const label = id ? document.querySelector(`label[for="${id}"]`) : null;
                const required = el.hasAttribute('required');
                const ariaInvalid = el.getAttribute('aria-invalid');
                
                return {
                    id,
                    type: el.getAttribute('type') || el.tagName.toLowerCase(),
                    hasLabel: !!label,
                    labelText: label?.textContent || 'N/A',
                    required,
                    ariaInvalid
                };
            });
            
            formData.push(fieldData);
        }
        
        formResults.push(formData);
    }
    
    console.log('Form results:', formResults);
    
    // Append to report
    const formReport = `

### Form Accessibility
${formResults.map((form, i) => `
#### Form ${i + 1}
${form.map(field => `
- ${field.type}${field.id ? `#${field.id}` : ''}
  - Label: ${field.hasLabel ? '✅' : '❌'} (${field.labelText})
  - Required: ${field.required ? '✅' : '❌'}
  - ARIA Invalid: ${field.ariaInvalid || 'N/A'}
`).join('\n')}
`).join('\n')}

## Form Recommendations
${formResults.some(form => form.some(field => !field.hasLabel)) ? '- Ensure all form fields have associated labels\n' : ''}
${formResults.some(form => form.some(field => field.required && !field.ariaInvalid)) ? '- Add ARIA invalid attributes for required fields\n' : ''}
`;
    
    fs.appendFileSync('./accessibility/reports/keyboard-test-results.md', formReport);
}

async function testInteractiveElements(page) {
    const interactiveElements = await page.$$('button, a[href], [role="button"], [tabindex="0"]');
    const elementResults = [];
    
    for (const element of interactiveElements) {
        const result = await element.evaluate(el => {
            const isKeyboardAccessible = el.getAttribute('tabindex') !== '-1' && 
                                       !el.hasAttribute('disabled') &&
                                       !el.hasAttribute('aria-hidden');
            
            return {
                tag: el.tagName,
                text: el.textContent,
                role: el.getAttribute('role'),
                id: el.id,
                keyboardAccessible: isKeyboardAccessible,
                hasFocusIndicator: window.getComputedStyle(el).outline !== 'none'
            };
        });
        
        elementResults.push(result);
    }
    
    console.log('Interactive elements:', elementResults);
    
    // Append to report
    const elementsReport = `

### Interactive Elements
${elementResults.map(el => `
- ${el.tag}${el.id ? `#${el.id}` : ''}${el.role ? `[role="${el.role}"]` : ''}
  - Text: ${el.text || 'N/A'}
  - Keyboard Accessible: ${el.keyboardAccessible ? '✅' : '❌'}
  - Focus Indicator: ${el.hasFocusIndicator ? '✅' : '❌'}
`).join('\n')}

## Interactive Elements Recommendations
${elementResults.some(el => !el.keyboardAccessible) ? '- Ensure all interactive elements are keyboard accessible\n' : ''}
${elementResults.some(el => !el.hasFocusIndicator) ? '- Add visible focus indicators to all interactive elements\n' : ''}
`;
    
    fs.appendFileSync('./accessibility/reports/keyboard-test-results.md', elementsReport);
}

// Run the tests
testKeyboardAccessibility().catch(console.error); 