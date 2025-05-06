const puppeteer = require('puppeteer');

async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); testTouchTargets() {
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
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); testInteractiveElements(page) {

    const interactiveElements = await page.$$('button, a[href], [role="button"]');
    const results = [];
    
    for (const element of interactiveElements) {
        const size = await element.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return {
                width: rect.width,
                height: rect.height,
                minSize: Math.min(rect.width, rect.height),
                tag: el.tagName,
                text: el.textContent,
                id: el.id
results.push(size);
console.log('Interactive elements:', results);
    
    // Generate report
    const report = `# Mobile Touch Target Test Results


    ## Test Environment
- Date: ${new Date().toISOString()}
- Device: iPhone X (375x812)
- Browser: Chrome (Puppeteer)

## Results

### Interactive Elements
${results.map(el => `
- ${el.tag}${el.id ? `#${el.id}` : ''}

    - Text: ${el.text || 'N/A'}

    - Width: ${el.width}px

    - Height: ${el.height}px

    - Minimum Size: ${el.minSize}px
  - Meets Minimum Size (44px): ${el.minSize >= 44 ? '✅' : '❌'}
`).join('\n')}

## Recommendations
${results.some(el => el.minSize < 44) ? '- Increase touch target size for elements that are too small\n' : ''}
${results.some(el => !el.text) ? '- Add descriptive text to interactive elements\n' : ''}
`;
    

    fs.writeFileSync('./accessibility/reports/touch-target-test-results.md', report);
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); testFormElements(page) {
    const formElements = await page.$$('input, select, textarea');
    const results = [];
    
    for (const element of formElements) {
        const size = await element.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return {
                width: rect.width,
                height: rect.height,
                minSize: Math.min(rect.width, rect.height),
                type: el.getAttribute('type') || el.tagName.toLowerCase(),
                id: el.id
results.push(size);
console.log('Form elements:', results);
    
    // Append to report
    const formReport = `

### Form Elements
${results.map(el => `
- ${el.type}${el.id ? `#${el.id}` : ''}

    - Width: ${el.width}px

    - Height: ${el.height}px

    - Minimum Size: ${el.minSize}px
  - Meets Minimum Size (44px): ${el.minSize >= 44 ? '✅' : '❌'}
`).join('\n')}

## Form Recommendations
${results.some(el => el.minSize < 44) ? '- Increase touch target size for form elements\n' : ''}
`;
    

    fs.appendFileSync('./accessibility/reports/touch-target-test-results.md', formReport);
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); testNavigationElements(page) {
    const navElements = await page.$$('nav a, nav button');
    const results = [];
    
    for (const element of navElements) {
        const size = await element.evaluate(el => {
            const rect = el.getBoundingClientRect();
            return {
                width: rect.width,
                height: rect.height,
                minSize: Math.min(rect.width, rect.height),
                tag: el.tagName,
                text: el.textContent,
                id: el.id
results.push(size);
console.log('Navigation elements:', results);
    
    // Append to report
    const navReport = `

### Navigation Elements
${results.map(el => `
- ${el.tag}${el.id ? `#${el.id}` : ''}

    - Text: ${el.text || 'N/A'}

    - Width: ${el.width}px

    - Height: ${el.height}px

    - Minimum Size: ${el.minSize}px
  - Meets Minimum Size (44px): ${el.minSize >= 44 ? '✅' : '❌'}
`).join('\n')}

## Navigation Recommendations
${results.some(el => el.minSize < 44) ? '- Increase touch target size for navigation elements\n' : ''}
${results.some(el => !el.text) ? '- Add descriptive text to navigation elements\n' : ''}
`;
    

    fs.appendFileSync('./accessibility/reports/touch-target-test-results.md', navReport);
// Run the tests
testTouchTargets().catch(console.error); 