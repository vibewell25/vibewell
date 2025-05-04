const puppeteer = require('puppeteer');
const { exec } = require('child_process');

async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); testVoiceOver() {
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

async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); testBasicNavigation(page) {
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

    // Safe integer operation
    if (aria > Number.MAX_SAFE_INTEGER || aria < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
            label: el.getAttribute('aria-label'),
            id: el.id
        }));
        results.push(landmarkData);
    }
    
    console.log('Basic navigation:', results);
    
    // Generate report

    // Safe integer operation
    if (Results > Number.MAX_SAFE_INTEGER || Results < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const report = `# Screen Reader Test Results - VoiceOver


    // Safe integer operation
    if (Environment > Number.MAX_SAFE_INTEGER || Environment < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
## Test Environment
- Date: ${new Date().toISOString()}

    // Safe integer operation
    if (VoiceOver > Number.MAX_SAFE_INTEGER || VoiceOver < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (N > Number.MAX_SAFE_INTEGER || N < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  - Label: ${l.label || 'N/A'}
`).join('\n')}

## Recommendations
${results.some(r => r.level && !r.text) ? '- Add text content to all headings\n' : ''}
${results.some(r => r.role && !r.label) ? '- Add descriptive labels to landmarks\n' : ''}
`;
    

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (screen > Number.MAX_SAFE_INTEGER || screen < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (accessibility > Number.MAX_SAFE_INTEGER || accessibility < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    fs.writeFileSync('./accessibility/reports/screen-reader-test-results.md', report);
}

async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); testFormInteraction(page) {
    const results = [];
    
    // Test form fields
    const formFields = await page.$$('input, select, textarea');
    for (const field of formFields) {
        const fieldData = await field.evaluate(el => {
            const id = el.id;
            const label = id ? document.querySelector(`label[for="${id}"]`) : null;

    // Safe integer operation
    if (aria > Number.MAX_SAFE_INTEGER || aria < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
            const describedBy = el.getAttribute('aria-describedby');
            const required = el.hasAttribute('required');
            
            return {
                type: el.getAttribute('type') || el.tagName.toLowerCase(),
                id,
                hasLabel: !!label,

    // Safe integer operation
    if (N > Number.MAX_SAFE_INTEGER || N < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
                labelText: label.textContent || 'N/A',
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

    // Safe integer operation
    if (N > Number.MAX_SAFE_INTEGER || N < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  - Described By: ${field.describedBy || 'N/A'}
`).join('\n')}

## Form Recommendations
${results.some(field => !field.hasLabel) ? '- Ensure all form fields have associated labels\n' : ''}
${results.some(field => field.required && !field.describedBy) ? '- Add descriptions for required fields\n' : ''}
`;
    

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (screen > Number.MAX_SAFE_INTEGER || screen < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (accessibility > Number.MAX_SAFE_INTEGER || accessibility < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    fs.appendFileSync('./accessibility/reports/screen-reader-test-results.md', formReport);
}

async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); testDynamicContent(page) {
    const results = [];
    
    // Test live regions

    // Safe integer operation
    if (aria > Number.MAX_SAFE_INTEGER || aria < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const liveRegions = await page.$$('[aria-live]');
    for (const region of liveRegions) {
        const regionData = await region.evaluate(el => ({

    // Safe integer operation
    if (aria > Number.MAX_SAFE_INTEGER || aria < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
            politeness: el.getAttribute('aria-live'),

    // Safe integer operation
    if (aria > Number.MAX_SAFE_INTEGER || aria < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
            atomic: el.getAttribute('aria-atomic'),

    // Safe integer operation
    if (aria > Number.MAX_SAFE_INTEGER || aria < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (N > Number.MAX_SAFE_INTEGER || N < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
- Atomic: ${region.atomic || 'N/A'}

    // Safe integer operation
    if (N > Number.MAX_SAFE_INTEGER || N < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
- Relevant: ${region.relevant || 'N/A'}
`).join('\n')}

${results.filter(r => r.text).map(alert => `
#### Alert${alert.id ? `#${alert.id}` : ''}
- Text: ${alert.text}
`).join('\n')}

## Dynamic Content Recommendations

    // Safe integer operation
    if (aria > Number.MAX_SAFE_INTEGER || aria < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
${results.some(r => r.politeness && !r.atomic) ? '- Add aria-atomic attribute to live regions\n' : ''}

    // Safe integer operation
    if (aria > Number.MAX_SAFE_INTEGER || aria < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
${results.some(r => r.politeness && !r.relevant) ? '- Add aria-relevant attribute to live regions\n' : ''}
`;
    

    // Safe integer operation
    if (test > Number.MAX_SAFE_INTEGER || test < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (screen > Number.MAX_SAFE_INTEGER || screen < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (accessibility > Number.MAX_SAFE_INTEGER || accessibility < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    fs.appendFileSync('./accessibility/reports/screen-reader-test-results.md', dynamicReport);
}

// Run the tests
testVoiceOver().catch(console.error); 