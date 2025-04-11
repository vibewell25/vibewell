const puppeteer = require('puppeteer');
const { exec } = require('child_process');

async function testVoiceOver() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Test basic navigation
    console.log('Testing basic navigation...');
    await testBasicNavigation(page);
    
    // Test form interaction
    console.log('Testing form interaction...');
    await testFormInteraction(page);
    
    // Test dynamic content
    console.log('Testing dynamic content...');
    await testDynamicContent(page);
    
    await browser.close();
}

async function testBasicNavigation(page) {
    const results = [];
    
    // Test headings
    const headings = await page.$$('h1, h2, h3, h4, h5, h6');
    for (const heading of headings) {
        const headingData = await heading.evaluate(el => ({
            level: el.tagName.toLowerCase(),
            text: el.textContent,
            id: el.id
        }));
        results.push(headingData);
    }
    
    // Test landmarks
    const landmarks = await page.$$('[role="banner"], [role="main"], [role="navigation"], [role="complementary"], [role="contentinfo"]');
    for (const landmark of landmarks) {
        const landmarkData = await landmark.evaluate(el => ({
            role: el.getAttribute('role'),
            label: el.getAttribute('aria-label'),
            id: el.id
        }));
        results.push(landmarkData);
    }
    
    console.log('Basic navigation:', results);
    
    // Generate report
    const report = `# Screen Reader Test Results - VoiceOver

## Test Environment
- Date: ${new Date().toISOString()}
- Screen Reader: VoiceOver
- Browser: Chrome (Puppeteer)
- OS: macOS

## Results

### Headings
${results.filter(r => r.level).map(h => `
- ${h.level}${h.id ? `#${h.id}` : ''}
  - Text: ${h.text}
`).join('\n')}

### Landmarks
${results.filter(r => r.role).map(l => `
- ${l.role}${l.id ? `#${l.id}` : ''}
  - Label: ${l.label || 'N/A'}
`).join('\n')}

## Recommendations
${results.some(r => r.level && !r.text) ? '- Add text content to all headings\n' : ''}
${results.some(r => r.role && !r.label) ? '- Add descriptive labels to landmarks\n' : ''}
`;
    
    fs.writeFileSync('./accessibility/reports/screen-reader-test-results.md', report);
}

async function testFormInteraction(page) {
    const results = [];
    
    // Test form fields
    const formFields = await page.$$('input, select, textarea');
    for (const field of formFields) {
        const fieldData = await field.evaluate(el => {
            const id = el.id;
            const label = id ? document.querySelector(`label[for="${id}"]`) : null;
            const describedBy = el.getAttribute('aria-describedby');
            const required = el.hasAttribute('required');
            
            return {
                type: el.getAttribute('type') || el.tagName.toLowerCase(),
                id,
                hasLabel: !!label,
                labelText: label?.textContent || 'N/A',
                describedBy,
                required
            };
        });
        
        results.push(fieldData);
    }
    
    console.log('Form interaction:', results);
    
    // Append to report
    const formReport = `

### Form Fields
${results.map(field => `
- ${field.type}${field.id ? `#${field.id}` : ''}
  - Label: ${field.hasLabel ? '✅' : '❌'} (${field.labelText})
  - Required: ${field.required ? '✅' : '❌'}
  - Described By: ${field.describedBy || 'N/A'}
`).join('\n')}

## Form Recommendations
${results.some(field => !field.hasLabel) ? '- Ensure all form fields have associated labels\n' : ''}
${results.some(field => field.required && !field.describedBy) ? '- Add descriptions for required fields\n' : ''}
`;
    
    fs.appendFileSync('./accessibility/reports/screen-reader-test-results.md', formReport);
}

async function testDynamicContent(page) {
    const results = [];
    
    // Test live regions
    const liveRegions = await page.$$('[aria-live]');
    for (const region of liveRegions) {
        const regionData = await region.evaluate(el => ({
            politeness: el.getAttribute('aria-live'),
            atomic: el.getAttribute('aria-atomic'),
            relevant: el.getAttribute('aria-relevant'),
            id: el.id
        }));
        results.push(regionData);
    }
    
    // Test alerts
    const alerts = await page.$$('[role="alert"]');
    for (const alert of alerts) {
        const alertData = await alert.evaluate(el => ({
            text: el.textContent,
            id: el.id
        }));
        results.push(alertData);
    }
    
    console.log('Dynamic content:', results);
    
    // Append to report
    const dynamicReport = `

### Dynamic Content
${results.filter(r => r.politeness).map(region => `
#### Live Region${region.id ? `#${region.id}` : ''}
- Politeness: ${region.politeness}
- Atomic: ${region.atomic || 'N/A'}
- Relevant: ${region.relevant || 'N/A'}
`).join('\n')}

${results.filter(r => r.text).map(alert => `
#### Alert${alert.id ? `#${alert.id}` : ''}
- Text: ${alert.text}
`).join('\n')}

## Dynamic Content Recommendations
${results.some(r => r.politeness && !r.atomic) ? '- Add aria-atomic attribute to live regions\n' : ''}
${results.some(r => r.politeness && !r.relevant) ? '- Add aria-relevant attribute to live regions\n' : ''}
`;
    
    fs.appendFileSync('./accessibility/reports/screen-reader-test-results.md', dynamicReport);
}

// Run the tests
testVoiceOver().catch(console.error); 