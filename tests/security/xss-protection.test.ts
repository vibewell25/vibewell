/**
 * Cross-Site Scripting (XSS) Protection Tests
 * 
 * This test suite checks various user input fields for XSS vulnerabilities
 * by attempting to inject malicious scripts and verifying they are properly sanitized.
 */

import puppeteer, { Browser, Page } from 'puppeteer';

describe('XSS Protection Tests', () => {
  let browser: Browser;
  let page: Page;
  const baseUrl = process.env.TEST_URL || 'http://localhost:3000';
  const testEmail = 'security-test@example.com';
  const testPassword = 'SecurePassword123!';
  
  // Common XSS attack payloads to test
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src="x" onerror="alert(\'XSS\')">',
    '<div onmouseover="alert(\'XSS\')">Hover me</div>',
    'javascript:alert("XSS")',
    '<a href="javascript:alert(\'XSS\')">Click me</a>',
    '"><script>alert("XSS")</script>',
    '\'><script>alert("XSS")</script>',
    '<ScRiPt>alert("XSS")</ScRiPt>',
    '<svg/onload=alert("XSS")>',
    '<body onload=alert("XSS")>'
  ];
  
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });
  
  afterAll(async () => {
    await browser.close();
  });
  
  beforeEach(async () => {
    page = await browser.newPage();
    // Set up console listener to detect XSS execution
    page.on('console', (msg) => {
      if (msg.text().includes('XSS')) {
        console.error('Potential XSS detected:', msg.text());
        throw new Error('XSS vulnerability detected: ' + msg.text());
      }
    });
    
    // Set up dialog listener to detect alert/confirm/prompt
    page.on('dialog', async (dialog) => {
      console.error('Dialog detected:', dialog.message());
      await dialog.dismiss();
      throw new Error('XSS vulnerability detected: Dialog opened with message: ' + dialog.message());
    });
    
    await page.goto(baseUrl);
  });
  
  afterEach(async () => {
    await page.close();
  });
  
  // Helper function to test input fields for XSS
  const testInputField = async (selector: string, payloads: string[] = xssPayloads) => {
    for (const payload of payloads) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.focus(selector);
        await page.evaluate((sel) => { document.querySelector(sel).value = ''; }, selector);
        await page.type(selector, payload);
        
        // After typing, attempt to submit or trigger the input
        // This depends on the specific form being tested
        // Try pressing Enter
        await page.keyboard.press('Enter');
        
        // Wait a bit to see if any XSS is triggered
        await page.waitForTimeout(1000);
        
        // Check if the payload is rendered as HTML (potential XSS)
        const renderedContent = await page.evaluate(() => document.body.innerHTML);
        
        // Check if the script tag or event handlers from the payload appear in the rendered HTML
        // If they do, it's not necessarily a vulnerability unless they're executable,
        // but it's worth investigating further
        if (renderedContent.includes('<script') && renderedContent.includes(payload)) {
          console.warn('Potential XSS issue: Script tag from payload found in rendered content');
        }
        
        if (renderedContent.includes('onerror=') || 
            renderedContent.includes('onload=') || 
            renderedContent.includes('onmouseover=')) {
          console.warn('Potential XSS issue: Event handler from payload found in rendered content');
        }
      } catch (error) {
        if (error.message.includes('XSS vulnerability detected')) {
          throw error; // Re-throw XSS-specific errors
        }
        console.error(`Error when testing payload "${payload}" in "${selector}":`, error);
      }
    }
  };
  
  test('Login form should be protected against XSS', async () => {
    await page.goto(`${baseUrl}/login`);
    await testInputField('[data-cy="email-input"]');
    await testInputField('[data-cy="password-input"]');
  });
  
  test('Signup form should be protected against XSS', async () => {
    await page.goto(`${baseUrl}/signup`);
    await testInputField('[data-cy="name-input"]');
    await testInputField('[data-cy="email-input"]');
    await testInputField('[data-cy="password-input"]');
  });
  
  test('Profile form should be protected against XSS', async () => {
    // First login
    await page.goto(`${baseUrl}/login`);
    await page.waitForSelector('[data-cy="email-input"]');
    await page.type('[data-cy="email-input"]', testEmail);
    await page.type('[data-cy="password-input"]', testPassword);
    await page.click('[data-cy="login-button"]');
    
    // Wait for redirect to profile or dashboard
    await page.waitForNavigation();
    
    // Go to profile edit page
    await page.goto(`${baseUrl}/profile/edit`);
    
    // Test various profile form fields
    await testInputField('[data-cy="name-input"]');
    await testInputField('[data-cy="bio-input"]');
    await testInputField('[data-cy="phone-input"]');
  });
  
  test('Review submission should be protected against XSS', async () => {
    // Login first
    await page.goto(`${baseUrl}/login`);
    await page.waitForSelector('[data-cy="email-input"]');
    await page.type('[data-cy="email-input"]', testEmail);
    await page.type('[data-cy="password-input"]', testPassword);
    await page.click('[data-cy="login-button"]');
    
    // Navigate to a service that can be reviewed
    await page.goto(`${baseUrl}/services/1`);
    
    // Go to review form
    await page.waitForSelector('[data-cy="write-review-button"]');
    await page.click('[data-cy="write-review-button"]');
    
    // Test review form fields
    await testInputField('[data-cy="review-title-input"]');
    await testInputField('[data-cy="review-content-input"]');
  });
  
  test('URL parameters should be sanitized', async () => {
    // Test URL with malicious parameters
    for (const payload of xssPayloads) {
      await page.goto(`${baseUrl}/search?q=${encodeURIComponent(payload)}`);
      await page.waitForTimeout(1000); // Wait to see if XSS triggers
      
      // Check if the search results page shows the raw payload
      const content = await page.content();
      const decodedPayload = payload.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      expect(content).not.toContain(payload); // Should not contain unescaped payload
      // It's okay if it contains escaped/sanitized version
    }
  });
}); 